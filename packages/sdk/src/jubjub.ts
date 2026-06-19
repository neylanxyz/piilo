// JubJub curve arithmetic (BLS12-381-embedded twisted Edwards).
// Curve equation: -x² + y² = 1 + d·x²·y², a = -1.
// Coordinates are Fr elements (BLS12-381 scalar field).
// Used by both Piilo.ts (prover) and auditor.ts (decryption).

export const FR_Q =
  52435875175126190479447740508185965837690552500527637822603658699938581184513n;

const D =
  19257038036680949359750312669786877991949435402254120286184196891950884077233n;

// Generator G: base point for value component of Pedersen commitments.
export const G: [bigint, bigint] = [
  52011214036797608008763021134739816867182510661071949920602030138765591619595n,
  36017543053724001483519641180346241195937746995850157919072206337752529044138n,
];

// Generator H: base point for blinding component of Pedersen commitments.
// Also used as ECDH base: K_aud = k_aud * H, R_e = r_e * H.
export const H: [bigint, bigint] = [
  2641322346204092426446313763048872749581807614122456322352786044536967383341n,
  12433362859382302755418372944023213970869823563090304431189761096447391844644n,
];

export function modFr(v: bigint): bigint {
  return ((v % FR_Q) + FR_Q) % FR_Q;
}

function modInv(a: bigint): bigint {
  // Extended Euclidean over FR_Q.
  let [old_r, r] = [a, FR_Q];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return modFr(old_s);
}

// Complete twisted Edwards addition (a = -1, denominator never zero).
export function edwardsAdd(
  [x1, y1]: [bigint, bigint],
  [x2, y2]: [bigint, bigint]
): [bigint, bigint] {
  const b    = modFr(x1 * y2);
  const c    = modFr(y1 * x2);
  const dTau = modFr(D * modFr(b * c));
  const xOut = modFr(modFr(b + c) * modInv(modFr(1n + dTau)));
  const yOut = modFr(modFr(modFr(y1 * y2) + modFr(x1 * x2)) * modInv(modFr(1n - dTau)));
  return [xOut, yOut];
}

// Double-and-add scalar multiplication.
export function scalarMul(scalar: bigint, point: [bigint, bigint]): [bigint, bigint] {
  let acc: [bigint, bigint] = [0n, 1n]; // identity: (0, 1)
  let cur = point;
  let s = scalar;
  while (s > 0n) {
    if (s & 1n) acc = edwardsAdd(acc, cur);
    cur = edwardsAdd(cur, cur);
    s >>= 1n;
  }
  return acc;
}
