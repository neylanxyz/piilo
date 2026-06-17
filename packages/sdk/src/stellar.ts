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

function encodePoint(p: JubJubPoint): xdr.ScVal {
  // Point { x: BytesN<32>, y: BytesN<32> } stored as a Soroban struct (map).
  const xBytes = Buffer.from(BigInt(p[0]).toString(16).padStart(64, "0"), "hex");
  const yBytes = Buffer.from(BigInt(p[1]).toString(16).padStart(64, "0"), "hex");
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("x"),
      val: xdr.ScVal.scvBytes(xBytes),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("y"),
      val: xdr.ScVal.scvBytes(yBytes),
    }),
  ]);
}

function encodeG1(coords: [string, string]): xdr.ScVal {
  // G1Affine (uncompressed, 96 bytes): x || y, each 48 bytes big-endian Fq.
  const x = Buffer.from(BigInt(coords[0]).toString(16).padStart(96, "0"), "hex");
  const y = Buffer.from(BigInt(coords[1]).toString(16).padStart(96, "0"), "hex");
  return xdr.ScVal.scvBytes(Buffer.concat([x, y]));
}

function encodeG2(
  coords: [[string, string], [string, string]]
): xdr.ScVal {
  // G2Affine (uncompressed, 192 bytes): x_c0 || x_c1 || y_c0 || y_c1, each 48 bytes.
  const parts = [coords[0][0], coords[0][1], coords[1][0], coords[1][1]];
  const buf = Buffer.concat(
    parts.map((c) => Buffer.from(BigInt(c).toString(16).padStart(96, "0"), "hex"))
  );
  return xdr.ScVal.scvBytes(buf);
}

function encodeProof(proof: GrothProof): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("a"),
      val: encodeG1(proof.pi_a),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("b"),
      val: encodeG2(proof.pi_b),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("c"),
      val: encodeG1(proof.pi_c),
    }),
  ]);
}

function encodeBlinding(r: bigint): xdr.ScVal {
  const buf = Buffer.alloc(32);
  const hex = r.toString(16).padStart(64, "0");
  Buffer.from(hex, "hex").copy(buf);
  return xdr.ScVal.scvBytes(buf);
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
    r: bigint
  ): Promise<void> {
    const user = await wallet.publicKey();
    await this.buildAndSend(wallet, "deposit", [
      nativeToScVal(user, { type: "address" }),
      nativeToScVal(amount, { type: "i128" }),
      encodeBlinding(r),
    ]);
  }

  async transfer(
    wallet: WalletAdapter,
    recipientAddress: string,
    c_a: JubJubPoint,
    c_new: JubJubPoint,
    proof: GrothProof,
    encryptedNote: Uint8Array
  ): Promise<void> {
    const sender = await wallet.publicKey();
    await this.buildAndSend(wallet, "transfer", [
      nativeToScVal(sender, { type: "address" }),
      nativeToScVal(recipientAddress, { type: "address" }),
      encodePoint(c_a),
      encodePoint(c_new),
      encodeProof(proof),
      xdr.ScVal.scvBytes(Buffer.from(encryptedNote)),
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

    return {
      balance_commitment: [String(val.balance_commitment.x), String(val.balance_commitment.y)],
      pending_commitment: [String(val.pending_commitment.x), String(val.pending_commitment.y)],
      has_pending: Boolean(val.has_pending),
      nonce: BigInt(val.nonce ?? 0),
    };
  }
}
