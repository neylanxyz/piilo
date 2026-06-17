// Client-side Groth16 proving via snarkjs (WASM, runs in browser and Node).
// Loads the compiled transfer/withdraw circuits and zkeys from the repo's
// circuits/build/ directory. In a deployed app these would be fetched from
// a CDN; the paths here assume the SDK is used from the repo root.

import * as snarkjs from "snarkjs";

// Point on JubJub curve: [x, y] as decimal strings (Fr field elements).
export type JubJubPoint = [string, string];

export interface TransferInput {
  B: bigint;        // sender's plaintext balance
  r_B: bigint;      // sender's balance blinding factor
  A: bigint;        // transfer amount
  r_A: bigint;      // amount blinding factor
  r_new: bigint;    // new balance blinding factor (chosen fresh by sender)
  C_B: JubJubPoint; // current on-chain balance commitment
  C_A: JubJubPoint; // amount commitment (to be stored on-chain)
  C_new: JubJubPoint; // new sender balance commitment
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

// Resolve paths relative to this file (works in both Node and bundlers that
// support import.meta.url, e.g. Vite).
function assetPath(rel: string): string {
  // In browser bundlers, override PIILO_ASSET_BASE via build config to point
  // at your CDN or public/ directory.
  const base =
    typeof process !== "undefined"
      ? new URL("../../../circuits/build/", import.meta.url).pathname
      : "/circuits/build/";
  return `${base}${rel}`;
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
    C_B: pointToFields(input.C_B),
    C_A: pointToFields(input.C_A),
    C_new: pointToFields(input.C_new),
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
