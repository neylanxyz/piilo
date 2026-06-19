// Auditor-side decryption of transfer amounts from on-chain events.
//
// The auditor holds private scalar k_aud whose public key K_aud = k_aud * H
// is registered in the Piilo contract. Every transfer emits:
//   R_e   = r_e * H          (ephemeral public key, chosen fresh per transfer)
//   A_enc = A + (r_e * K_aud).x  (additive OTP encryption of the amount)
//
// Decryption: S = k_aud * R_e  (same shared secret as r_e * K_aud, by ECDH)
//             A = A_enc - S.x  (mod Fr)
//
// Nobody else can compute S without either k_aud or r_e, both of which remain
// private to their respective holders.

import type { JubJubPoint } from "./proof.js";
import { scalarMul, modFr } from "./jubjub.js";

/**
 * Decrypt a transfer amount from the on-chain TransferEvent fields.
 *
 * @param k_aud  Auditor's private scalar — keep secret
 * @param R_e    Ephemeral public key from the event (r_e * H)
 * @param A_enc  Encrypted amount from the event (A + S.x mod q)
 * @returns      Plaintext transfer amount A
 */
export function decryptAuditorNote(
  k_aud: bigint,
  R_e: JubJubPoint,
  A_enc: bigint
): bigint {
  const [s_x] = scalarMul(k_aud, [BigInt(R_e[0]), BigInt(R_e[1])]);
  return modFr(A_enc - s_x);
}
