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

// Fr modulus for BLS12-381 (used to reduce blinding factor additions mod q).
// Blinding factors are Fr elements; additions must stay in the field.
const FR_MODULUS =
  52435875175126190479447740508185965837690552500527637822603658699938581184513n;

function randomFr(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  // Reduce mod q to ensure it's a valid Fr element.
  let v = 0n;
  for (const b of bytes) v = (v << 8n) | BigInt(b);
  return v % FR_MODULUS;
}

function addFr(a: bigint, b: bigint): bigint {
  return (a + b) % FR_MODULUS;
}

// Commitment point is stored on-chain as (x, y) BytesN<32> big-endian.
// Here we read it back as hex strings (field elements as decimal) from
// the RPC response. This helper normalises both representations to decimal.
function pointFromHex(x: string, y: string): JubJubPoint {
  const normalise = (v: string) =>
    v.startsWith("0x") ? BigInt(v).toString() : v;
  return [normalise(x), normalise(y)];
}

export interface PiiloConfig {
  network: Network;
  contractId: string;
  wallet: WalletAdapter & WalletSigner;
  relayUrl?: string; // optional — only for fee sponsorship, holds no secrets
}

export class Piilo {
  private cfg: PiiloConfig;
  private stellar: PiiloStellar;
  private noteKeypair: NoteKeypair | null = null;

  constructor(cfg: PiiloConfig) {
    this.cfg = cfg;
    this.stellar = new PiiloStellar(cfg.contractId, cfg.network);
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
    const r = randomFr();

    await this.stellar.deposit(this.cfg.wallet, amount, r);

    const state = loadState(address);
    saveState(address, applyDeposit(state, amount, r));
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

    // Compute C_A and C_new locally using the same commitment arithmetic the
    // circuit uses. We don't have on-chain computation here — the proof itself
    // attests that these are correctly formed.
    // In a real implementation, use a local JubJub scalar_mul (same as the
    // Rust commitment.rs). For now: the circuit witness generator computes
    // them; we read them back from the proof's public signals.
    const { proof, C_A, C_new } = await this.proveTransferAndExtractCommitments(
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
      encryptedNote
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
  async withdraw(): Promise<void> {
    const address = await this.myAddress();
    const state = loadState(address);

    if (state.balance <= 0n) throw new Error("no balance to withdraw");

    const onChain = await this.stellar.getAccount(address);
    if (!onChain) throw new Error("no on-chain account");
    const C_B = pointFromHex(
      onChain.balance_commitment[0],
      onChain.balance_commitment[1]
    );

    const proof = await proveWithdraw({
      r_B: state.r,
      C_B,
      B: state.balance,
    });

    await this.stellar.withdraw(this.cfg.wallet, state.balance, proof);

    saveState(address, { balance: 0n, r: 0n, pendingNotes: [] });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async proveTransferAndExtractCommitments(
    B: bigint,
    r_B: bigint,
    A: bigint,
    r_A: bigint,
    r_new: bigint,
    C_B: JubJubPoint
  ): Promise<{ proof: import("./proof.js").GrothProof; C_A: JubJubPoint; C_new: JubJubPoint }> {
    // We need C_A and C_new before we can call the circuit — but the circuit
    // computes them internally from (A, r_A) and (B-A, r_new). To get C_A and
    // C_new we use a local JubJub implementation (or run the circuit twice).
    //
    // Short-cut: run the fullProve call which returns both proof and public
    // signals. The public signals are [C_B[0], C_B[1], C_A[0], C_A[1],
    // C_new[0], C_new[1]] — we extract C_A and C_new from there.
    const { groth16 } = await import("snarkjs");
    const snarkInput = {
      B: B.toString(),
      r_B: r_B.toString(),
      A: A.toString(),
      r_A: r_A.toString(),
      r_new: r_new.toString(),
      // Circuit computes C_B internally and constrains it == C_B public input.
      // We pass the on-chain C_B as the public input.
      C_B: [C_B[0], C_B[1]],
      // C_A and C_new: the circuit computes these and constrains them to the
      // public inputs. We pass 0 as placeholders — the witness generator
      // will compute the correct values and the prover will use those.
      // Actually in Circom, public inputs ARE inputs — the witness generator
      // needs the real values. So we need to pre-compute C_A and C_new.
      // Use the JubJub local helper for this.
      C_A: await localCommit(A, r_A),
      C_new: await localCommit(B - A, r_new),
    };

    const wasmPath = assetPath("transfer_js/transfer.wasm");
    const zkeyPath = assetPath("transfer_1.zkey");
    const { proof: rawProof, publicSignals } = await groth16.fullProve(
      snarkInput,
      wasmPath,
      zkeyPath
    );

    // publicSignals: [C_B[0], C_B[1], C_A[0], C_A[1], C_new[0], C_new[1]]
    const C_A: JubJubPoint = [publicSignals[2], publicSignals[3]];
    const C_new: JubJubPoint = [publicSignals[4], publicSignals[5]];

    const proof = {
      pi_a: [rawProof.pi_a[0], rawProof.pi_a[1]] as [string, string],
      pi_b: [
        [rawProof.pi_b[0][0], rawProof.pi_b[0][1]],
        [rawProof.pi_b[1][0], rawProof.pi_b[1][1]],
      ] as [[string, string], [string, string]],
      pi_c: [rawProof.pi_c[0], rawProof.pi_c[1]] as [string, string],
    };

    return { proof, C_A, C_new };
  }

  // Fetch the note pubkey for a recipient. Currently reads it from on-chain
  // events emitted during their own deposit/transfer calls. In the MVP this
  // is a direct RPC query; a relay or indexer could cache it.
  private async fetchRecipientNotePubkey(address: string): Promise<Uint8Array> {
    // For the MVP: recipient note pubkey is stored in a well-known format in
    // the first `deposit` event for their account, or communicated out-of-band.
    // Placeholder: throw if not found; real implementation queries RPC events.
    throw new Error(
      `fetchRecipientNotePubkey not yet implemented for ${address} — ` +
        "recipients must share their note pubkey out-of-band in this MVP."
    );
  }

  // Fetch and decrypt all incoming transfer notes for this address from
  // on-chain events within the 7-day RPC retention window.
  private async fetchPendingNotes(address: string): Promise<Note[]> {
    const noteKeypair = await this.getNoteKeypair();
    // Query `transfer` events where recipient == address.
    // Each event carries an encrypted_note bytes field.
    // For MVP: return notes already cached in local state + any newly found.
    const state = loadState(address);
    // TODO: query RPC for TransferEvent where to == address, decrypt each note.
    return state.pendingNotes;
  }
}

// ── Local JubJub commitment (mirrors commitment.rs, for pre-computing C_A/C_new) ──

function assetPath(rel: string): string {
  const base =
    typeof process !== "undefined"
      ? new URL("../../../circuits/build/", import.meta.url).pathname
      : "/circuits/build/";
  return `${base}${rel}`;
}

// JubJub curve parameters (same as jubjub.circom and commitment.rs).
const D =
  19257038036680949359750312669786877991949435402254120286184196891950884077233n;
const FR_Q = FR_MODULUS;

// Generator G from jubjub.circom: PiiloGeneratorG()
const G: JubJubPoint = [
  "52011214036797608008763021134739816867182510661071949920602030138765591619595",
  "36017543053724001483519641180346241195937746995850157919072206337752529044138",
];

// Generator H from jubjub.circom: PiiloGeneratorH()
const H: JubJubPoint = [
  "2641322346204092426446313763048872749581807614122456322352786044536967383341",
  "12433362859382302755418372944023213970869823563090304431189761096447391844644",
];

function modFr(v: bigint): bigint {
  return ((v % FR_Q) + FR_Q) % FR_Q;
}

function edwardsAdd(
  [x1, y1]: [bigint, bigint],
  [x2, y2]: [bigint, bigint]
): [bigint, bigint] {
  // Complete twisted Edwards addition: -x^2 + y^2 = 1 + d*x^2*y^2, a = -1
  const x1y2 = modFr(x1 * y2);
  const y1x2 = modFr(y1 * x2);
  const dTau = modFr(D * modFr(x1y2 * y1x2));
  const xNum = modFr(x1y2 + y1x2);
  const xDen = modFr(1n + dTau);
  const yNum = modFr(modFr(modFr(modFr(-x1) * y2) + modFr(y1 * y2)) + modFr(x1 * x2));
  const yDen = modFr(1n - dTau);

  const xOut = modFr(xNum * modInv(xDen, FR_Q));
  const yOut = modFr(yNum * modInv(yDen, FR_Q));
  return [xOut, yOut];
}

function modInv(a: bigint, m: bigint): bigint {
  // Extended Euclidean algorithm.
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return modFr(old_s);
}

function scalarMul(scalar: bigint, [px, py]: [bigint, bigint]): [bigint, bigint] {
  let acc: [bigint, bigint] = [0n, 1n]; // identity
  let cur: [bigint, bigint] = [px, py];
  let s = scalar;
  while (s > 0n) {
    if (s & 1n) acc = edwardsAdd(acc, cur);
    cur = edwardsAdd(cur, cur);
    s >>= 1n;
  }
  return acc;
}

async function localCommit(value: bigint, blinding: bigint): Promise<[string, string]> {
  const gPt: [bigint, bigint] = [BigInt(G[0]), BigInt(G[1])];
  const hPt: [bigint, bigint] = [BigInt(H[0]), BigInt(H[1])];
  const vG = scalarMul(value, gPt);
  const rH = scalarMul(blinding, hPt);
  const sum = edwardsAdd(vG, rH);
  return [sum[0].toString(), sum[1].toString()];
}
