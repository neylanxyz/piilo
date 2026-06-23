// Main SDK entry point. Coordinates local state, proof generation, note
// encryption, and Stellar transaction submission.
//
// Usage:
//   const piilo = new Piilo({ network: "testnet", contractId: "C...", wallet })
//   await piilo.deposit(500n)
//   await piilo.transfer({ to: "G...", amount: 200n })
//   await piilo.settleIfPending()
//   await piilo.withdraw()

import {
  loadState, saveState,
  applyDeposit, applySend, applyReceiveNote, applySettle,
  type Note,
} from "./state.js";
import { proveTransfer, proveWithdraw, type JubJubPoint } from "./proof.js";
import {
  deriveNoteKeypair, encryptNote, decryptNote, encodeNote, decodeNote,
  type WalletSigner, type NoteKeypair,
} from "./note.js";
import { PiiloStellar, type Network, type WalletAdapter } from "./stellar.js";
import { FR_Q, G, H, modFr, edwardsAdd, scalarMul } from "./jubjub.js";

function randomFr(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let v = 0n;
  for (const b of bytes) v = (v << 8n) | BigInt(b);
  return v % FR_Q;
}

function addFr(a: bigint, b: bigint): bigint {
  return (a + b) % FR_Q;
}

// Commitment point is stored on-chain as (x, y) BytesN<32> big-endian.
// Here we read it back as hex strings (field elements as decimal) from
// the RPC response. This helper normalises both representations to decimal.
function pointFromHex(x: string, y: string): JubJubPoint {
  const normalise = (v: string) =>
    v.startsWith("0x") ? BigInt(v).toString() : v;
  return [normalise(x), normalise(y)];
}

// Canonical deployed contract addresses. contractId in PiiloConfig is optional;
// if omitted the SDK uses this for the configured network.
export const CONTRACT_IDS: Record<Network, string> = {
  testnet: "", // filled after each deploy — see scripts/deploy.mjs
  mainnet: "", // TBD
};

export interface PiiloConfig {
  network: Network;
  contractId?: string; // optional — defaults to CONTRACT_IDS[network]
  wallet: WalletAdapter & WalletSigner;
  relayUrl?: string; // optional — only for fee sponsorship, holds no secrets
}

export class Piilo {
  private cfg: PiiloConfig;
  private stellar: PiiloStellar;
  private noteKeypair: NoteKeypair | null = null;

  constructor(cfg: PiiloConfig) {
    this.cfg = cfg;
    const contractId = cfg.contractId ?? CONTRACT_IDS[cfg.network];
    if (!contractId) throw new Error(`No contract deployed on ${cfg.network} yet — pass contractId explicitly`);
    this.stellar = new PiiloStellar(contractId, cfg.network);
  }

  // Lazily derive and cache the note keypair (requires one wallet signature).
  private async getNoteKeypair(): Promise<NoteKeypair> {
    if (!this.noteKeypair) {
      this.noteKeypair = await deriveNoteKeypair(this.cfg.wallet);
    }
    return this.noteKeypair;
  }

  private async myAddress(): Promise<string> {
    return this.cfg.wallet.publicKey();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Current local plaintext balance. Does not require a network call. */
  async getBalance(): Promise<bigint> {
    const address = await this.myAddress();
    return loadState(address).balance;
  }

  /**
   * Deposit `amount` (in stroops / smallest XLM unit) into the confidential
   * account. Picks a random blinding factor, computes the commitment, and
   * submits the on-chain deposit transaction.
   */
  async deposit(amount: bigint): Promise<void> {
    if (amount <= 0n) throw new Error("amount must be positive");
    const address = await this.myAddress();
    const noteKeypair = await this.getNoteKeypair();
    const r = randomFr();

    const { depositFeeBps } = await this.stellar.getFees();
    const fee = amount * BigInt(depositFeeBps) / 10_000n;
    const credited = amount - fee;

    await this.stellar.deposit(this.cfg.wallet, amount, r, noteKeypair.publicKey);

    const state = loadState(address);
    saveState(address, applyDeposit(state, credited, r));
  }

  /**
   * Send `amount` privately to `to`. Generates a Groth16 proof, encrypts the
   * payment note for the recipient, and submits the transfer transaction.
   */
  async transfer({ to, amount }: { to: string; amount: bigint }): Promise<void> {
    const address = await this.myAddress();
    const state = loadState(address);

    if (amount <= 0n) throw new Error("amount must be positive");
    if (amount > state.balance) throw new Error("insufficient balance");

    // Fetch current on-chain commitment to use as C_B in the proof.
    const onChain = await this.stellar.getAccount(address);
    if (!onChain) throw new Error("no on-chain account — deposit first");
    const C_B = pointFromHex(
      onChain.balance_commitment[0],
      onChain.balance_commitment[1]
    );

    // Choose fresh blinding factors for C_A and C_new.
    const r_A = randomFr();
    const r_new = randomFr();

    const { proof, C_A, C_new, R_e, a_enc } =
      await this.proveTransferAndExtractCommitments(
        state.balance,
        state.r,
        amount,
        r_A,
        r_new,
        C_B
      );

    // Encrypt the note for the recipient.
    const noteKeypair = await this.getNoteKeypair();
    const recipientPubkey = await this.fetchRecipientNotePubkey(to);
    const encryptedNote = encodeNote(
      encryptNote(amount, r_A, recipientPubkey, noteKeypair)
    );

    await this.stellar.transfer(
      this.cfg.wallet,
      to,
      C_A,
      C_new,
      proof,
      encryptedNote,
      R_e,
      a_enc
    );

    saveState(address, applySend(state, amount, r_new));
  }

  /**
   * Check for pending incoming transfers. If found, decrypts the notes,
   * calls settle_pending on-chain, and updates local state.
   * Returns the total received amount, or null if nothing was pending.
   */
  async settleIfPending(): Promise<{ received: bigint } | null> {
    const address = await this.myAddress();
    const onChain = await this.stellar.getAccount(address);
    if (!onChain?.has_pending) return null;

    // Fetch and decrypt incoming transfer notes from on-chain events.
    const notes = await this.fetchPendingNotes(address);

    await this.stellar.settlePending(this.cfg.wallet);

    const state = loadState(address);
    const withNotes = notes.reduce(
      (s, n) => applyReceiveNote(s, n),
      state
    );
    const settled = applySettle(withNotes);
    saveState(address, settled);

    const received = notes.reduce((s, n) => s + n.amount, 0n);
    return { received };
  }

  /**
   * Reveal balance and withdraw all XLM. Generates a Groth16 proof of balance
   * knowledge, submits the withdrawal, and resets local state.
   */
  async withdraw(): Promise<{ payout: bigint }> {
    const address = await this.myAddress();
    const state = loadState(address);

    if (state.balance <= 0n) throw new Error("no balance to withdraw");

    const onChain = await this.stellar.getAccount(address);
    if (!onChain) throw new Error("no on-chain account");
    const C_B = pointFromHex(
      onChain.balance_commitment[0],
      onChain.balance_commitment[1]
    );

    const { withdrawFeeBps } = await this.stellar.getFees();
    const fee = state.balance * BigInt(withdrawFeeBps) / 10_000n;
    const payout = state.balance - fee;

    const proof = await proveWithdraw({
      r_B: state.r,
      C_B,
      B: state.balance,
    });

    await this.stellar.withdraw(this.cfg.wallet, state.balance, proof);

    saveState(address, { balance: 0n, r: 0n, pendingNotes: [] });
    return { payout };
  }

  /** Export local state (balance + blinding factor) as a JSON string. */
  async exportBackup(): Promise<string> {
    const address = await this.myAddress();
    const state = loadState(address);
    return JSON.stringify({
      version: 1,
      address,
      balance: state.balance.toString(),
      r: state.r.toString(),
    });
  }

  /**
   * Restore local state from a backup JSON string.
   * Verifies the restored (balance, r) opens to the on-chain commitment
   * before writing — rejects corrupted or mismatched backups.
   */
  async importBackup(json: string): Promise<{ balance: bigint }> {
    const address = await this.myAddress();
    const data = JSON.parse(json) as { version: number; address: string; balance: string; r: string };
    if (data.version !== 1) throw new Error(`Unknown backup version ${data.version}`);
    if (data.address !== address)
      throw new Error(`Backup belongs to ${data.address}, connected wallet is ${address}`);

    const balance = BigInt(data.balance);
    const r = BigInt(data.r);

    const onChain = await this.stellar.getAccount(address);
    if (!onChain) throw new Error("No on-chain account — deposit first, then restore");

    const [cx, cy] = localCommit(balance, r);
    const [onX, onY] = onChain.balance_commitment;
    if (cx !== onX || cy !== onY)
      throw new Error("Backup does not match on-chain commitment — wrong balance or blinding factor");

    saveState(address, { balance, r, pendingNotes: [] });
    return { balance };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async proveTransferAndExtractCommitments(
    B: bigint,
    r_B: bigint,
    A: bigint,
    r_A: bigint,
    r_new: bigint,
    C_B: JubJubPoint
  ): Promise<{
    proof: import("./proof.js").GrothProof;
    C_A: JubJubPoint;
    C_new: JubJubPoint;
    R_e: JubJubPoint;
    a_enc: bigint;
  }> {
    // Fetch the auditor public key from the contract (one RPC sim call).
    const K_aud = await this.stellar.getAuditorKey();

    // Generate a fresh non-zero ephemeral scalar. The circuit's A0 constraint
    // rejects r_e = 0 because it collapses S to the identity and leaks A.
    let r_e = 0n;
    while (r_e === 0n) r_e = randomFr();

    // Pre-compute auditor ECDH values locally — the circuit constrains these
    // to match what's derived from r_e, so the prover must supply them.
    const hPt: [bigint, bigint] = [BigInt(H[0]), BigInt(H[1])];
    const kPt: [bigint, bigint] = [BigInt(K_aud[0]), BigInt(K_aud[1])];

    const [re_x, re_y] = scalarMul(r_e, hPt);         // R_e = r_e * H
    const [s_x]        = scalarMul(r_e, kPt);          // S   = r_e * K_aud
    const a_enc        = modFr(A + s_x);               // A_enc = A + S.x mod q

    const R_e: JubJubPoint  = [re_x.toString(), re_y.toString()];

    const { groth16 } = await import("snarkjs");
    const snarkInput = {
      B: B.toString(),
      r_B: r_B.toString(),
      A: A.toString(),
      r_A: r_A.toString(),
      r_new: r_new.toString(),
      r_e: r_e.toString(),
      C_B: [C_B[0], C_B[1]],
      C_A: localCommit(A, r_A),
      C_new: localCommit(B - A, r_new),
      K_aud: [K_aud[0], K_aud[1]],
      R_e: [R_e[0], R_e[1]],
      A_enc: a_enc.toString(),
    };

    const wasmPath = assetPath("transfer_js/transfer.wasm");
    const zkeyPath = assetPath("transfer_1.zkey");
    const { proof: rawProof, publicSignals } = await groth16.fullProve(
      snarkInput,
      wasmPath,
      zkeyPath
    );

    // publicSignals order matches `component main {public [C_B, C_A, C_new, K_aud, R_e, A_enc]}`:
    // [0] C_B.x  [1] C_B.y  [2] C_A.x  [3] C_A.y  [4] C_new.x  [5] C_new.y
    // [6] K_aud.x [7] K_aud.y [8] R_e.x [9] R_e.y  [10] A_enc
    const C_A_out: JubJubPoint   = [publicSignals[2], publicSignals[3]];
    const C_new_out: JubJubPoint = [publicSignals[4], publicSignals[5]];

    const proof = {
      pi_a: [rawProof.pi_a[0], rawProof.pi_a[1]] as [string, string],
      pi_b: [
        [rawProof.pi_b[0][0], rawProof.pi_b[0][1]],
        [rawProof.pi_b[1][0], rawProof.pi_b[1][1]],
      ] as [[string, string], [string, string]],
      pi_c: [rawProof.pi_c[0], rawProof.pi_c[1]] as [string, string],
    };

    return { proof, C_A: C_A_out, C_new: C_new_out, R_e, a_enc };
  }

  // Fetch the note pubkey for a recipient from the contract.
  // The pubkey is stored on-chain when the recipient calls deposit().
  private async fetchRecipientNotePubkey(address: string): Promise<Uint8Array> {
    const myAddr = await this.myAddress();
    if (address === myAddr) {
      return (await this.getNoteKeypair()).publicKey;
    }
    const pubkey = await this.stellar.getNotePubkey(address);
    if (pubkey) return pubkey;
    throw new Error(
      `Recipient ${address} has not deposited yet — their note pubkey is not on-chain.`
    );
  }

  // Fetch and decrypt pending transfer notes from contract persistent storage.
  // Notes are written on transfer and cleared on settle — no event queries needed.
  private async fetchPendingNotes(address: string): Promise<Note[]> {
    const noteKeypair = await this.getNoteKeypair();
    const rawNotes = await this.stellar.getPendingNotes(address);
    const notes: Note[] = [];
    for (const { from, encryptedNote } of rawNotes) {
      try {
        const decrypted = decryptNote(decodeNote(encryptedNote), noteKeypair);
        if (!decrypted) {
          console.error("[piilo] decryptNote returned null for note from", from);
          continue;
        }
        notes.push({ from, amount: decrypted.amount, r_A: decrypted.r_A });
      } catch (e) {
        console.error("[piilo] failed to decode/decrypt note from", from, e);
      }
    }
    return notes;
  }
}

// ── Local JubJub commitment (mirrors commitment.rs, for pre-computing C_A/C_new) ──

function assetPath(rel: string): string {
  if (typeof window !== "undefined") return `/circuits/${rel}`;
  const repoRoot = new URL("../../../", import.meta.url);
  return new URL(`circuits/build/${rel}`, repoRoot).pathname;
}

function localCommit(value: bigint, blinding: bigint): [string, string] {
  const [x, y] = edwardsAdd(scalarMul(value, G), scalarMul(blinding, H));
  return [x.toString(), y.toString()];
}
