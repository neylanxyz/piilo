// Stellar transaction builders for the Piilo contract.
// Uses @stellar/stellar-sdk v13 Soroban RPC flow:
//   1. simulateTransaction → get fee + auth entries
//   2. sign with wallet
//   3. submitTransaction → await inclusion

import {
  Contract,
  Keypair,
  Networks,
  rpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import type { GrothProof, JubJubPoint } from "./proof.js";

export type Network = "testnet" | "mainnet";

const RPC_URLS: Record<Network, string> = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://mainnet.stellar.soroban.sh",
};

export interface WalletAdapter {
  publicKey(): Promise<string>;
  signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise<string>;
}

// ── XDR encoding helpers ─────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    out[i >> 1] = parseInt(hex.slice(i, i + 2), 16);
  return out;
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

// stellar-sdk types declare scvBytes as taking Buffer; Uint8Array is safe at
// runtime because Buffer extends Uint8Array.
const toScvBytes = (u8: Uint8Array): xdr.ScVal =>
  xdr.ScVal.scvBytes(u8 as unknown as Buffer);

function encodePoint(p: JubJubPoint): xdr.ScVal {
  // Point { x: BytesN<32>, y: BytesN<32> } stored as a Soroban struct (map).
  const xBytes = hexToBytes(BigInt(p[0]).toString(16).padStart(64, "0"));
  const yBytes = hexToBytes(BigInt(p[1]).toString(16).padStart(64, "0"));
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("x"), val: toScvBytes(xBytes) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("y"), val: toScvBytes(yBytes) }),
  ]);
}

function encodeG1(coords: [string, string]): xdr.ScVal {
  // G1Affine (uncompressed, 96 bytes): x || y, each 48 bytes big-endian Fq.
  const x = hexToBytes(BigInt(coords[0]).toString(16).padStart(96, "0"));
  const y = hexToBytes(BigInt(coords[1]).toString(16).padStart(96, "0"));
  return toScvBytes(concatBytes(x, y));
}

function encodeG2(coords: [[string, string], [string, string]]): xdr.ScVal {
  // BLS12-381 G2 uncompressed (192 bytes): x_c1 || x_c0 || y_c1 || y_c0 (Zcash: imaginary first).
  // snarkjs outputs [[x_c0, x_c1], [y_c0, y_c1]] — swap within each pair.
  const parts = [coords[0][1], coords[0][0], coords[1][1], coords[1][0]];
  return toScvBytes(
    concatBytes(...parts.map((c) => hexToBytes(BigInt(c).toString(16).padStart(96, "0"))))
  );
}

function encodeProof(proof: GrothProof): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("a"), val: encodeG1(proof.pi_a) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("b"), val: encodeG2(proof.pi_b) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("c"), val: encodeG1(proof.pi_c) }),
  ]);
}

function encodeBlinding(r: bigint): xdr.ScVal {
  return toScvBytes(hexToBytes(r.toString(16).padStart(64, "0")));
}

// Encode an Fr field element (bigint) as 32 big-endian bytes — used for
// a_enc (the auditor-encrypted amount, A + S.x mod q).
function encodeFrBytes(v: bigint): xdr.ScVal {
  return toScvBytes(hexToBytes(v.toString(16).padStart(64, "0")));
}

// Decode a big-endian Uint8Array (BytesN<32>) to a bigint.
function bytesToBigInt(b: Uint8Array | Buffer): bigint {
  let hex = "";
  for (const byte of new Uint8Array(b)) hex += byte.toString(16).padStart(2, "0");
  return BigInt("0x" + hex);
}

// Decimal-string form of bytesToBigInt — used where JubJubPoint strings are expected.
function bytesToDec(b: Uint8Array | Buffer): string {
  return bytesToBigInt(b).toString();
}

// ── Transaction lifecycle ────────────────────────────────────────────────────

export class PiiloStellar {
  private rpc: rpc.Server;
  private contract: Contract;
  private network: Network;

  constructor(contractId: string, network: Network) {
    this.rpc = new rpc.Server(RPC_URLS[network]);
    this.contract = new Contract(contractId);
    this.network = network;
  }

  private networkPassphrase(): string {
    return this.network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
  }

  private async buildAndSend(
    wallet: WalletAdapter,
    method: string,
    args: xdr.ScVal[]
  ): Promise<rpc.Api.GetTransactionResponse> {
    const publicKey = await wallet.publicKey();
    const account = await this.rpc.getAccount(publicKey);

    const tx = new TransactionBuilder(account, {
      fee: "1000000",
      networkPassphrase: this.networkPassphrase(),
    })
      .addOperation(
        this.contract.call(method, ...args)
      )
      .setTimeout(30)
      .build();

    const simResult = await this.rpc.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simResult)) {
      throw new Error(`Simulation failed: ${simResult.error}`);
    }

    const prepared = rpc.assembleTransaction(tx, simResult).build();
    const signedXdr = await wallet.signTransaction(prepared.toXDR(), {
      networkPassphrase: this.networkPassphrase(),
    });
    const signed = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase());

    const sent = await this.rpc.sendTransaction(signed);
    if (sent.status === "ERROR") {
      throw new Error(`Submit failed: ${sent.errorResult?.toXDR("base64")}`);
    }

    // Poll until included.
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const result = await this.rpc.getTransaction(sent.hash);
      if (result.status !== "NOT_FOUND") return result;
    }
    throw new Error("Transaction not confirmed within 30s");
  }

  async deposit(
    wallet: WalletAdapter,
    amount: bigint,
    r: bigint,
    notePubkey: Uint8Array
  ): Promise<void> {
    const user = await wallet.publicKey();
    await this.buildAndSend(wallet, "deposit", [
      nativeToScVal(user, { type: "address" }),
      nativeToScVal(amount, { type: "i128" }),
      encodeBlinding(r),
      toScvBytes(notePubkey),
    ]);
  }

  async transfer(
    wallet: WalletAdapter,
    recipientAddress: string,
    c_a: JubJubPoint,
    c_new: JubJubPoint,
    proof: GrothProof,
    encryptedNote: Uint8Array,
    r_e: JubJubPoint,
    a_enc: bigint
  ): Promise<void> {
    const sender = await wallet.publicKey();
    await this.buildAndSend(wallet, "transfer", [
      nativeToScVal(sender, { type: "address" }),
      nativeToScVal(recipientAddress, { type: "address" }),
      encodePoint(c_a),
      encodePoint(c_new),
      encodeProof(proof),
      toScvBytes(encryptedNote),
      encodePoint(r_e),
      encodeFrBytes(a_enc),
    ]);
  }

  async settlePending(wallet: WalletAdapter): Promise<void> {
    const user = await wallet.publicKey();
    await this.buildAndSend(wallet, "settle_pending", [
      nativeToScVal(user, { type: "address" }),
    ]);
  }

  async withdraw(
    wallet: WalletAdapter,
    amount: bigint,
    proof: GrothProof
  ): Promise<void> {
    const user = await wallet.publicKey();
    await this.buildAndSend(wallet, "withdraw", [
      nativeToScVal(user, { type: "address" }),
      nativeToScVal(amount, { type: "i128" }),
      encodeProof(proof),
    ]);
  }

  // ── Read-only calls ────────────────────────────────────────────────────────

  async getAuditorKey(): Promise<JubJubPoint> {
    const dummyKeypair = Keypair.random();
    const dummyAccount = await this.rpc.getAccount(dummyKeypair.publicKey()).catch(() => ({
      id: dummyKeypair.publicKey(), sequenceNumber: () => "0",
      incrementSequenceNumber: () => {}, accountId: () => dummyKeypair.publicKey(),
      sequence: "0", subentryCount: 0, inflationDest: null, homeDomain: "",
      thresholds: { lowThreshold: 0, medThreshold: 0, highThreshold: 0 },
      flags: { authRequired: false, authRevocable: false, authImmutable: false },
      balances: [], signers: [], data: {},
    } as never));

    const tx = new TransactionBuilder(dummyAccount as never, {
      fee: "100", networkPassphrase: this.networkPassphrase(),
    })
      .addOperation(this.contract.call("get_auditor_key"))
      .setTimeout(5)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim) || !sim.result)
      throw new Error("get_auditor_key simulation failed");

    const val = scValToNative(sim.result.retval) as { x: Uint8Array; y: Uint8Array };
    return [bytesToDec(val.x), bytesToDec(val.y)];
  }

  async getAccount(address: string): Promise<{
    balance_commitment: JubJubPoint;
    pending_commitment: JubJubPoint;
    has_pending: boolean;
    nonce: bigint;
  } | null> {
    const account = await this.rpc.getAccount(address).catch(() => null);
    if (!account) return null;

    // Use simulateTransaction for read-only calls.
    const dummyKeypair = Keypair.random();
    const dummyAccount = await this.rpc
      .getAccount(dummyKeypair.publicKey())
      .catch(() => {
        // If the dummy account doesn't exist, use a minimal placeholder.
        return {
          id: dummyKeypair.publicKey(),
          sequenceNumber: () => "0",
          incrementSequenceNumber: () => {},
          accountId: () => dummyKeypair.publicKey(),
          sequence: "0",
          subentryCount: 0,
          inflationDest: null,
          homeDomain: "",
          thresholds: { lowThreshold: 0, medThreshold: 0, highThreshold: 0 },
          flags: { authRequired: false, authRevocable: false, authImmutable: false },
          balances: [],
          signers: [],
          data: {},
        } as never;
      });

    const tx = new TransactionBuilder(dummyAccount as never, {
      fee: "100",
      networkPassphrase: this.networkPassphrase(),
    })
      .addOperation(
        this.contract.call(
          "get_account",
          nativeToScVal(address, { type: "address" })
        )
      )
      .setTimeout(5)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) return null;
    if (!sim.result) return null;

    const val = scValToNative(sim.result.retval);
    if (!val) return null;

    const pt = (raw: { x: Uint8Array; y: Uint8Array }): JubJubPoint =>
      [bytesToDec(raw.x), bytesToDec(raw.y)];

    return {
      balance_commitment: pt(val.balance_commitment),
      pending_commitment: pt(val.pending_commitment),
      has_pending: Boolean(val.has_pending),
      nonce: BigInt(val.nonce ?? 0),
    };
  }

  // Returns all transfer events directed to recipientAddress that occurred
  // after the most recent settle event for that address (so already-counted
  // notes are excluded). Covers the 7-day RPC retention window.
  async getTransferNotes(
    recipientAddress: string
  ): Promise<Array<{ from: string; encryptedNote: Uint8Array; r_e: JubJubPoint; a_enc: bigint }>> {
    const latest = await this.rpc.getLatestLedger();
    // Use 100_000 ledgers (~5.8 days) instead of 120_960 to stay safely inside
    // the RPC's actual retention window (exact boundary varies; 120_960 causes
    // off-by-one failures when latest.sequence - 120_960 < minRetained).
    const windowStart = Math.max(1, latest.sequence - 100_000);

    const transferSym = xdr.ScVal.scvSymbol("transfer").toXDR("base64");
    const settleSym   = xdr.ScVal.scvSymbol("settle").toXDR("base64");
    const contractIds = [this.contract.contractId()];

    // Normalise scValToNative address fields: they may be Address objects (with
    // .toString()) or plain strings depending on sdk version. Always compare as
    // strings to avoid silent identity-comparison failures.
    const addrStr = (v: unknown): string => String(v);

    // Find the latest ledger at which this address settled, to avoid
    // re-counting notes that are already in local balance.
    let fromLedger = windowStart;
    try {
      const settleResp = await this.rpc.getEvents({
        startLedger: windowStart,
        filters: [{ type: "contract", contractIds, topics: [[settleSym]] }],
        limit: 200,
      });
      for (const ev of settleResp.events) {
        const data = scValToNative(ev.value) as { user: unknown };
        if (addrStr(data.user) === recipientAddress) {
          fromLedger = Math.max(fromLedger, Number(ev.ledger));
        }
      }
    } catch (e) {
      console.error("[piilo] settle events query failed:", e);
    }

    try {
      const resp = await this.rpc.getEvents({
        startLedger: Math.max(windowStart, fromLedger),
        filters: [{ type: "contract", contractIds, topics: [[transferSym]] }],
        limit: 200,
      });
      const results: Array<{ from: string; encryptedNote: Uint8Array; r_e: JubJubPoint; a_enc: bigint }> = [];
      for (const ev of resp.events) {
        try {
          const data = scValToNative(ev.value) as {
            from: unknown;
            to: unknown;
            encrypted_note: Uint8Array | Buffer;
            r_e: { x: Uint8Array | Buffer; y: Uint8Array | Buffer };
            a_enc: Uint8Array | Buffer;
          };
          if (addrStr(data.to) !== recipientAddress) continue;
          results.push({
            from: addrStr(data.from),
            encryptedNote: new Uint8Array(data.encrypted_note),
            r_e: [bytesToDec(data.r_e.x), bytesToDec(data.r_e.y)],
            a_enc: bytesToBigInt(data.a_enc),
          });
        } catch (e) {
          console.error("[piilo] malformed transfer event:", e);
        }
      }
      return results;
    } catch (e) {
      console.error("[piilo] transfer events query failed:", e);
      return [];
    }
  }

  async getPendingNotes(
    address: string
  ): Promise<Array<{ from: string; encryptedNote: Uint8Array }>> {
    const dummyKeypair = Keypair.random();
    const dummyAccount = await this.rpc.getAccount(dummyKeypair.publicKey()).catch(() => ({
      id: dummyKeypair.publicKey(), sequenceNumber: () => "0",
      incrementSequenceNumber: () => {}, accountId: () => dummyKeypair.publicKey(),
      sequence: "0", subentryCount: 0, inflationDest: null, homeDomain: "",
      thresholds: { lowThreshold: 0, medThreshold: 0, highThreshold: 0 },
      flags: { authRequired: false, authRevocable: false, authImmutable: false },
      balances: [], signers: [], data: {},
    } as never));

    const tx = new TransactionBuilder(dummyAccount as never, {
      fee: "100", networkPassphrase: this.networkPassphrase(),
    })
      .addOperation(this.contract.call("get_pending_notes", nativeToScVal(address, { type: "address" })))
      .setTimeout(5)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim) || !sim.result) return [];

    const val = scValToNative(sim.result.retval);
    if (!Array.isArray(val)) return [];
    return val.map((note: { from: unknown; encrypted_note: Uint8Array | Buffer }) => ({
      from: String(note.from),
      encryptedNote: new Uint8Array(note.encrypted_note),
    }));
  }

  async getNotePubkey(address: string): Promise<Uint8Array | null> {
    const dummyKeypair = Keypair.random();
    const dummyAccount = await this.rpc
      .getAccount(dummyKeypair.publicKey())
      .catch(() => ({
        id: dummyKeypair.publicKey(),
        sequenceNumber: () => "0",
        incrementSequenceNumber: () => {},
        accountId: () => dummyKeypair.publicKey(),
        sequence: "0",
        subentryCount: 0,
        inflationDest: null,
        homeDomain: "",
        thresholds: { lowThreshold: 0, medThreshold: 0, highThreshold: 0 },
        flags: { authRequired: false, authRevocable: false, authImmutable: false },
        balances: [],
        signers: [],
        data: {},
      } as never));

    const tx = new TransactionBuilder(dummyAccount as never, {
      fee: "100",
      networkPassphrase: this.networkPassphrase(),
    })
      .addOperation(
        this.contract.call(
          "get_note_pubkey",
          nativeToScVal(address, { type: "address" })
        )
      )
      .setTimeout(5)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) return null;
    if (!sim.result) return null;

    const val = scValToNative(sim.result.retval);
    if (!val) return null;
    // val is Uint8Array (BytesN<32> from the contract)
    return val instanceof Uint8Array ? val : null;
  }
}
