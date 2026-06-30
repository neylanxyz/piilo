// Main SDK entry point. Coordinates local state, proof generation, note
// encryption, and Stellar transaction submission.
//
// Usage:
//   const piilo = new Piilo({ network: "testnet", contractId: "C...", wallet })
//   await piilo.deposit(500n)
//   await piilo.transfer({ to: "G...", amount: 200n })
//   await piilo.settleIfPending()
//   await piilo.withdraw()

import deployments from "./deployments.json" with { type: "json" };
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

type NetworkDeployment = {
  registry?: string;
  sacs?: Record<string, string>;
};
const DEPLOYMENTS = deployments as Record<Network, NetworkDeployment>;

// Default to jsDelivr CDN so the SDK works out of the box without any
// circuit file setup. Override circuitsUrl for self-hosting.
const DEFAULT_CIRCUITS_URL = "https://cdn.jsdelivr.net/gh/neylanxyz/piilo@v0.1.1/circuits/build";

export interface PiiloConfig {
  network: Network;
  asset?: string;       // token symbol: "XLM" (default), "USDC", etc.
  contractId?: string;  // explicit override — takes precedence over asset lookup
  wallet: WalletAdapter & WalletSigner;
  relayUrl?: string;
  circuitsUrl?: string; // base URL for circuit files; defaults to /circuits
}

export class Piilo {
  private cfg: PiiloConfig;
  private _stellar: PiiloStellar | null = null;
  private asset: string;
  private circuitsBase: string;
  private noteKeypair: NoteKeypair | null = null;

  constructor(cfg: PiiloConfig) {
    this.cfg = cfg;
    this.asset = cfg.asset ?? "XLM";
    this.circuitsBase = cfg.circuitsUrl ?? DEFAULT_CIRCUITS_URL;
    // contractId is resolved lazily via the on-chain registry;
    // explicit cfg.contractId bypasses the registry entirely.
  }

  private async getStellar(): Promise<PiiloStellar> {
    if (this._stellar) return this._stellar;

    let contractId = this.cfg.contractId;
    if (!contractId) {
      const net = DEPLOYMENTS[this.cfg.network];
      const registryId = net?.registry;
      const tokenSac   = net?.sacs?.[this.asset];
      if (!registryId || !tokenSac) {
        throw new Error(
          `No registry configured for ${this.asset} on ${this.cfg.network}. ` +
          `Pass contractId explicitly.`
        );
      }
      contractId = await PiiloStellar.registryLookup(this.cfg.network, registryId, tokenSac) ?? undefined;
      if (!contractId) {
        throw new Error(
          `Token ${this.asset} is not registered in the Piilo registry on ${this.cfg.network}.`
        );
      }
    }

    this._stellar = new PiiloStellar(contractId, this.cfg.network);
    return this._stellar;
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

  async getFees(): Promise<{ depositFeeBps: number; withdrawFeeBps: number; transferFlatFee: bigint }> {
    return (await this.getStellar()).getFees();
  }

  /** Returns the resolved on-chain contract ID for this token. */
  async getContractId(): Promise<string> {
    return (await this.getStellar()).contractId;
  }

  /** Fetch the on-chain account state (commitments, pending flag). */
  async getAccount(address: string) {
    return (await this.getStellar()).getAccount(address);
  }

  /** Current local plaintext balance. Does not require a network call. */
  async getBalance(): Promise<bigint> {
    const address = await this.myAddress();
    return loadState(address, this.asset).balance;
  }

  /**
   * Deposit `amount` (in stroops / smallest XLM unit) into the confidential
   * account. Picks a random blinding factor, computes the commitment, and
   * submits the on-chain deposit transaction.
   */
  async deposit(amount: bigint): Promise<string> {
    if (amount <= 0n) throw new Error("amount must be positive");
    const address = await this.myAddress();
    const noteKeypair = await this.getNoteKeypair();
    const r = randomFr();

    const { depositFeeBps } = await (await this.getStellar()).getFees();
    const fee = amount * BigInt(depositFeeBps) / 10_000n;
    const credited = amount - fee;

    // Reset local state when depositing into a fresh contract (e.g. after a
    // redeploy). Without this, stale r from a prior contract causes the
    // transfer circuit to fail — the accumulated blinding factor no longer
    // matches the on-chain commitment.
    const onChain = await (await this.getStellar()).getAccount(address);
    if (!onChain) saveState(address, this.asset, { balance: 0n, r: 0n, pendingNotes: [] });

    const txHash = await (await this.getStellar()).deposit(this.cfg.wallet, amount, r, noteKeypair.publicKey);

    const state = loadState(address, this.asset);
    saveState(address, this.asset, applyDeposit(state, credited, r));
    return txHash;
  }

  /**
   * Send `amount` privately to `to`. Generates a Groth16 proof, encrypts the
   * payment note for the recipient, and submits the transfer transaction.
   */
  async transfer({ to, amount }: { to: string; amount: bigint }): Promise<string> {
    const address = await this.myAddress();
    const state = loadState(address, this.asset);

    if (amount <= 0n) throw new Error("amount must be positive");
    if (amount > state.balance) throw new Error("insufficient balance");

    // Fetch current on-chain commitment to use as C_B in the proof.
    const onChain = await (await this.getStellar()).getAccount(address);
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

    const txHash = await (await this.getStellar()).transfer(
      this.cfg.wallet,
      to,
      C_A,
      C_new,
      proof,
      encryptedNote,
      R_e,
      a_enc
    );

    saveState(address, this.asset,applySend(state, amount, r_new));
    return txHash;
  }

  /**
   * Check for pending incoming transfers. If found, decrypts the notes,
   * calls settle_pending on-chain, and updates local state.
   * Returns the total received amount, or null if nothing was pending.
   */
  async settleIfPending(): Promise<{ received: bigint; txHash: string } | null> {
    const address = await this.myAddress();
    const onChain = await (await this.getStellar()).getAccount(address);
    if (!onChain?.has_pending) return null;

    // Fetch and decrypt incoming transfer notes from on-chain events.
    const notes = await this.fetchPendingNotes(address);

    const txHash = await (await this.getStellar()).settlePending(this.cfg.wallet);

    const state = loadState(address, this.asset);
    const withNotes = notes.reduce(
      (s, n) => applyReceiveNote(s, n),
      state
    );
    const settled = applySettle(withNotes);
    saveState(address, this.asset,settled);

    const received = notes.reduce((s, n) => s + n.amount, 0n);
    return { received, txHash };
  }

  /**
   * Reveal balance and withdraw all XLM. Generates a Groth16 proof of balance
   * knowledge, submits the withdrawal, and resets local state.
   */
  async withdraw(): Promise<{ payout: bigint; txHash: string }> {
    const address = await this.myAddress();
    const state = loadState(address, this.asset);

    if (state.balance <= 0n) throw new Error("no balance to withdraw");

    const onChain = await (await this.getStellar()).getAccount(address);
    if (!onChain) throw new Error("no on-chain account");
    const C_B = pointFromHex(
      onChain.balance_commitment[0],
      onChain.balance_commitment[1]
    );

    const { withdrawFeeBps } = await (await this.getStellar()).getFees();
    const fee = state.balance * BigInt(withdrawFeeBps) / 10_000n;
    const payout = state.balance - fee;

    const proof = await proveWithdraw({
      r_B: state.r,
      C_B,
      B: state.balance,
    }, this.circuitsBase);

    const txHash = await (await this.getStellar()).withdraw(this.cfg.wallet, state.balance, proof);

    saveState(address, this.asset,{ balance: 0n, r: 0n, pendingNotes: [] });
    return { payout, txHash };
  }

  /** Export local state (balance + blinding factor) as a JSON string. */
  async exportBackup(): Promise<string> {
    const address = await this.myAddress();
    const state = loadState(address, this.asset);
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

    const onChain = await (await this.getStellar()).getAccount(address);
    if (!onChain) throw new Error("No on-chain account — deposit first, then restore");

    const [cx, cy] = localCommit(balance, r);
    const [onX, onY] = onChain.balance_commitment;
    if (cx !== onX || cy !== onY)
      throw new Error("Backup does not match on-chain commitment — wrong balance or blinding factor");

    saveState(address, this.asset,{ balance, r, pendingNotes: [] });
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
    const K_aud = await (await this.getStellar()).getAuditorKey();

    let r_e = 0n;
    while (r_e === 0n) r_e = randomFr();

    const hPt: [bigint, bigint] = [BigInt(H[0]), BigInt(H[1])];
    const kPt: [bigint, bigint] = [BigInt(K_aud[0]), BigInt(K_aud[1])];
    const [re_x, re_y] = scalarMul(r_e, hPt);
    const [s_x]        = scalarMul(r_e, kPt);
    const a_enc        = modFr(A + s_x);
    const R_e: JubJubPoint = [re_x.toString(), re_y.toString()];

    // C_A and C_new computed locally — circuit constrains these to match,
    // so if the proof passes on-chain they are correct by soundness.
    const C_A: JubJubPoint   = localCommit(A,     r_A)   as JubJubPoint;
    const C_new: JubJubPoint = localCommit(B - A, r_new) as JubJubPoint;

    // Circuit files are fetched from circuitsBase and SHA-256 verified before
    // any private input reaches snarkjs.
    const proof = await proveTransfer({
      B, r_B, A, r_A, r_new, r_e,
      C_B, C_A, C_new,
      K_aud, R_e,
      A_enc: a_enc,
    }, this.circuitsBase);

    return { proof, C_A, C_new, R_e, a_enc };
  }

  // Fetch the note pubkey for a recipient from the contract.
  // The pubkey is stored on-chain when the recipient calls deposit().
  private async fetchRecipientNotePubkey(address: string): Promise<Uint8Array> {
    const myAddr = await this.myAddress();
    if (address === myAddr) {
      return (await this.getNoteKeypair()).publicKey;
    }
    const pubkey = await (await this.getStellar()).getNotePubkey(address);
    if (pubkey) return pubkey;
    throw new Error(
      `Recipient ${address} has not deposited yet — their note pubkey is not on-chain.`
    );
  }

  // Fetch and decrypt pending transfer notes from contract persistent storage.
  // Notes are written on transfer and cleared on settle — no event queries needed.
  private async fetchPendingNotes(address: string): Promise<Note[]> {
    const noteKeypair = await this.getNoteKeypair();
    const rawNotes = await (await this.getStellar()).getPendingNotes(address);
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

function localCommit(value: bigint, blinding: bigint): [string, string] {
  const [x, y] = edwardsAdd(scalarMul(value, G), scalarMul(blinding, H));
  return [x.toString(), y.toString()];
}
