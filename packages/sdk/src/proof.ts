// Client-side Groth16 proving via snarkjs (WASM, runs in browser and Node).
// Loads the compiled transfer/withdraw circuits and zkeys from the repo's
// circuits/build/ directory. In a deployed app these would be fetched from
// a CDN; the paths here assume the SDK is used from the repo root.

import * as snarkjs from "snarkjs";

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

// Resolve the circuit asset path for both Node.js (tests) and the browser.
function assetPath(rel: string): string {
  // Browser (dev + Vercel): served from public/circuits/ at the server root.
  if (typeof window !== "undefined") return `/circuits/${rel}`;

  // Node.js (tests): resolve to the filesystem path.
  // Two-step construction prevents Vite from seeing a template literal with
  // import.meta.url and glob-bundling every file in circuits/build/.
  const repoRoot = new URL("../../../", import.meta.url);
  return new URL(`circuits/build/${rel}`, repoRoot).pathname;
}

function bigintToField(v: bigint): string {
  return v.toString();
}

function pointToFields(p: JubJubPoint): [string, string] {
  return [p[0], p[1]];
}

export async function proveTransfer(input: TransferInput): Promise<GrothProof> {
  const snarkInput = {
    B: bigintToField(input.B),
    r_B: bigintToField(input.r_B),
    A: bigintToField(input.A),
    r_A: bigintToField(input.r_A),
    r_new: bigintToField(input.r_new),
    r_e: bigintToField(input.r_e),
    C_B: pointToFields(input.C_B),
    C_A: pointToFields(input.C_A),
    C_new: pointToFields(input.C_new),
    K_aud: pointToFields(input.K_aud),
    R_e: pointToFields(input.R_e),
    A_enc: bigintToField(input.A_enc),
  };

  const { proof } = await snarkjs.groth16.fullProve(
    snarkInput,
    assetPath("transfer_js/transfer.wasm"),
    assetPath("transfer_1.zkey")
  );

  return {
    pi_a: [proof.pi_a[0], proof.pi_a[1]],
    pi_b: [
      [proof.pi_b[0][0], proof.pi_b[0][1]],
      [proof.pi_b[1][0], proof.pi_b[1][1]],
    ],
    pi_c: [proof.pi_c[0], proof.pi_c[1]],
  };
}

export async function proveWithdraw(input: WithdrawInput): Promise<GrothProof> {
  const snarkInput = {
    r_B: bigintToField(input.r_B),
    C_B: pointToFields(input.C_B),
    B: bigintToField(input.B),
  };

  const { proof } = await snarkjs.groth16.fullProve(
    snarkInput,
    assetPath("withdraw_js/withdraw.wasm"),
    assetPath("withdraw_1.zkey")
  );

  return {
    pi_a: [proof.pi_a[0], proof.pi_a[1]],
    pi_b: [
      [proof.pi_b[0][0], proof.pi_b[0][1]],
      [proof.pi_b[1][0], proof.pi_b[1][1]],
    ],
    pi_c: [proof.pi_c[0], proof.pi_c[1]],
  };
}
