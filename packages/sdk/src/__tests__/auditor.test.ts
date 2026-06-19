import { test } from "node:test";
import assert from "node:assert/strict";
import { decryptAuditorNote } from "../auditor.js";
import { H, modFr, scalarMul } from "../jubjub.js";
import type { JubJubPoint } from "../proof.js";

// ── Test helpers (mirror exactly what the prover does in Piilo.ts) ─────────────

function auditorPubkey(k_aud: bigint): JubJubPoint {
  const [x, y] = scalarMul(k_aud, H);
  return [x.toString(), y.toString()];
}

function ephemeralPubkey(r_e: bigint): JubJubPoint {
  const [x, y] = scalarMul(r_e, H);
  return [x.toString(), y.toString()];
}

function encryptAmount(A: bigint, r_e: bigint, K_aud: JubJubPoint): bigint {
  const [s_x] = scalarMul(r_e, [BigInt(K_aud[0]), BigInt(K_aud[1])]);
  return modFr(A + s_x);
}

// Fixed test keys — small scalars, well below FR_Q.
const K_AUD_PRIV = 12345678901234567890n;
const K_AUD = auditorPubkey(K_AUD_PRIV);

// ── Tests ──────────────────────────────────────────────────────────────────────

test("round-trip: decrypts a normal transfer amount", () => {
  const r_e = 98765432109876543210n;
  const A = 500_000_000n;
  const R_e = ephemeralPubkey(r_e);
  const A_enc = encryptAmount(A, r_e, K_AUD);

  assert.strictEqual(decryptAuditorNote(K_AUD_PRIV, R_e, A_enc), A);
});

test("round-trip: decrypts A = 0", () => {
  const r_e = 11111111111111111111n;
  const R_e = ephemeralPubkey(r_e);
  const A_enc = encryptAmount(0n, r_e, K_AUD);

  assert.strictEqual(decryptAuditorNote(K_AUD_PRIV, R_e, A_enc), 0n);
});

test("round-trip: decrypts a large amount", () => {
  const r_e = 22222222222222222222n;
  const A = 1_000_000_000_000n;
  const R_e = ephemeralPubkey(r_e);
  const A_enc = encryptAmount(A, r_e, K_AUD);

  assert.strictEqual(decryptAuditorNote(K_AUD_PRIV, R_e, A_enc), A);
});

test("different r_e values produce different A_enc for the same amount", () => {
  const A = 100_000n;
  const A_enc1 = encryptAmount(A, 111n, K_AUD);
  const A_enc2 = encryptAmount(A, 222n, K_AUD);

  // Each decrypts correctly with the right R_e.
  assert.strictEqual(decryptAuditorNote(K_AUD_PRIV, ephemeralPubkey(111n), A_enc1), A);
  assert.strictEqual(decryptAuditorNote(K_AUD_PRIV, ephemeralPubkey(222n), A_enc2), A);

  // A_enc values differ — fresh r_e gives semantic security.
  assert.notStrictEqual(A_enc1, A_enc2);
});

test("wrong k_aud does not recover the amount", () => {
  const r_e = 33333333333333333333n;
  const A = 250_000_000n;
  const R_e = ephemeralPubkey(r_e);
  const A_enc = encryptAmount(A, r_e, K_AUD);

  assert.notStrictEqual(decryptAuditorNote(K_AUD_PRIV + 1n, R_e, A_enc), A);
});

test("ECDH symmetry: r_e * K_aud equals k_aud * R_e", () => {
  // The prover computes S = r_e * K_aud; the auditor computes S = k_aud * R_e.
  // Both must land on the same point for decryption to work.
  const r_e = 44444444444444444444n;
  const s_prover  = scalarMul(r_e, [BigInt(K_AUD[0]), BigInt(K_AUD[1])]);
  const s_auditor = scalarMul(K_AUD_PRIV, scalarMul(r_e, H));

  assert.strictEqual(s_prover[0], s_auditor[0]);
  assert.strictEqual(s_prover[1], s_auditor[1]);
});
