// Client-side Groth16 proving via snarkjs (WASM, runs in browser and Node).
// Circuit files are fetched from `circuitsUrl` and their SHA-256 hashes
// verified before any private input reaches the prover.

import * as snarkjs from "snarkjs";
import { CIRCUIT_HASHES } from "./circuit-hashes.js";

// Point on JubJub curve: [x, y] as decimal strings (Fr field elements).
export type JubJubPoint = [string, string];

export interface TransferInput {
  // Private witnesses
  B: bigint;        // sender's plaintext balance
  r_B: bigint;      // sender's balance blinding factor
  A: bigint;        // transfer amount
  r_A: bigint;      // amount blinding factor
  r_new: bigint;    // new balance blinding factor (chosen fresh by sender)
  r_e: bigint;      // ephemeral ECDH scalar — must be non-zero (A0 constraint)
  // Public inputs — balance/amount (unchanged)
  C_B: JubJubPoint;
  C_A: JubJubPoint;
  C_new: JubJubPoint;
  // Public inputs — auditor ECDH
  K_aud: JubJubPoint; // auditor's JubJub public key (from contract)
  R_e: JubJubPoint;   // ephemeral public key = r_e * H (pre-computed by caller)
  A_enc: bigint;      // encrypted amount = A + (r_e * K_aud).x mod q
}

export interface WithdrawInput {
  r_B: bigint;
  C_B: JubJubPoint;
  B: bigint;
}

// snarkjs proof format → flat arrays for Soroban
export interface GrothProof {
  pi_a: [string, string];
  pi_b: [[string, string], [string, string]];
  pi_c: [string, string];
}

// Fetch a circuit file, verify its SHA-256 against the pinned hash, and return
// a URL that snarkjs can load. In the browser this is a Blob URL (same-origin,
// no re-fetch latency). In Node it is the original filesystem path.
async function fetchAndVerify(url: string, rel: string): Promise<string> {
  const expected = CIRCUIT_HASHES[rel];
  if (!expected) throw new Error(`No pinned hash for circuit file: ${rel}`);

  if (typeof window === "undefined") {
    // Node.js: read from disk and verify with built-in crypto.
    const [fs, nodeCrypto] = await Promise.all([import("fs"), import("crypto")]);
    const data = fs.default.readFileSync(url);
    const actual = nodeCrypto.default.createHash("sha256").update(data).digest("hex");
    if (actual !== expected) {
      throw new Error(`Circuit integrity check failed for ${rel}: expected ${expected}, got ${actual}`);
    }
    return url;
  }

  // Browser: fetch, verify with SubtleCrypto, return a Blob URL so snarkjs
  // can re-read it without a second network round-trip.
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch circuit ${url}: ${res.status} ${res.statusText}`);
  const buf = await res.arrayBuffer();

  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const actual = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (actual !== expected) {
    throw new Error(`Circuit integrity check failed for ${rel}: expected ${expected}, got ${actual}`);
  }

  const mime = rel.endsWith(".wasm") ? "application/wasm" : "application/octet-stream";
  return URL.createObjectURL(new Blob([buf], { type: mime }));
}

// Resolve the URL (browser) or filesystem path (Node) for a circuit asset.
function circuitUrl(base: string, rel: string): string {
  if (typeof window !== "undefined") {
    return `${base.replace(/\/$/, "")}/${rel}`;
  }
  // Node.js (tests): resolve relative to the repo root.
  const repoRoot = new URL("../../../", import.meta.url);
  return new URL(`circuits/build/${rel}`, repoRoot).pathname;
}

function bigintToField(v: bigint): string { return v.toString(); }
function pointToFields(p: JubJubPoint): [string, string] { return [p[0], p[1]]; }

export async function proveTransfer(input: TransferInput, circuitsBase: string): Promise<GrothProof> {
  const [wasmUrl, zkeyUrl] = await Promise.all([
    fetchAndVerify(circuitUrl(circuitsBase, "transfer_js/transfer.wasm"), "transfer_js/transfer.wasm"),
    fetchAndVerify(circuitUrl(circuitsBase, "transfer_1.zkey"),           "transfer_1.zkey"),
  ]);

  const { proof } = await snarkjs.groth16.fullProve(
    {
      B:     bigintToField(input.B),
      r_B:   bigintToField(input.r_B),
      A:     bigintToField(input.A),
      r_A:   bigintToField(input.r_A),
      r_new: bigintToField(input.r_new),
      r_e:   bigintToField(input.r_e),
      C_B:   pointToFields(input.C_B),
      C_A:   pointToFields(input.C_A),
      C_new: pointToFields(input.C_new),
      K_aud: pointToFields(input.K_aud),
      R_e:   pointToFields(input.R_e),
      A_enc: bigintToField(input.A_enc),
    },
    wasmUrl,
    zkeyUrl,
  );

  return {
    pi_a: [proof.pi_a[0], proof.pi_a[1]],
    pi_b: [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]],
    pi_c: [proof.pi_c[0], proof.pi_c[1]],
  };
}

export async function proveWithdraw(input: WithdrawInput, circuitsBase: string): Promise<GrothProof> {
  const [wasmUrl, zkeyUrl] = await Promise.all([
    fetchAndVerify(circuitUrl(circuitsBase, "withdraw_js/withdraw.wasm"), "withdraw_js/withdraw.wasm"),
    fetchAndVerify(circuitUrl(circuitsBase, "withdraw_1.zkey"),           "withdraw_1.zkey"),
  ]);

  const { proof } = await snarkjs.groth16.fullProve(
    {
      r_B: bigintToField(input.r_B),
      C_B: pointToFields(input.C_B),
      B:   bigintToField(input.B),
    },
    wasmUrl,
    zkeyUrl,
  );

  return {
    pi_a: [proof.pi_a[0], proof.pi_a[1]],
    pi_b: [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]],
    pi_c: [proof.pi_c[0], proof.pi_c[1]],
  };
}
