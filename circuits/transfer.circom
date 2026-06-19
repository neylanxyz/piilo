pragma circom 2.0.0;
// Compile for the BLS12-381 prime, not Circom's BN254 default:
// circom transfer.circom --r1cs --wasm --sym --prime bls12381

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "jubjub.circom";

// Proves a valid balance update without revealing amounts (same as before),
// and additionally proves that the transfer amount A is encrypted for the
// auditor via ECDH — so the auditor can always read amounts, but nobody
// else can. The auditor holds a JubJub private key k_aud; K_aud = k_aud*H
// is stored on-chain and passed here as a public input.
//
// ECDH scheme: prover picks fresh ephemeral scalar r_e, publishes R_e =
// r_e*H, computes shared secret S = r_e*K_aud. Auditor recovers S as
// k_aud*R_e. Encryption is A_enc = A + S.x (additive OTP in Fr — safe
// because r_e is fresh per transfer and S.x is pseudorandom under ECDH).
template Transfer(n) {
    // Private inputs — never leave the client
    signal input B;        // sender's plaintext balance
    signal input r_B;      // sender's balance blinding factor
    signal input A;        // transfer amount
    signal input r_A;      // amount blinding factor
    signal input r_new;    // new balance blinding factor (sender chooses fresh)
    signal input r_e;      // ephemeral ECDH scalar — must be non-zero

    // Public inputs — balance / amount
    signal input C_B[2];    // current on-chain balance commitment (x, y)
    signal input C_A[2];    // amount commitment (added to recipient pending)
    signal input C_new[2];  // new sender balance commitment (written to chain)

    // Public inputs — auditor ECDH
    signal input K_aud[2];  // auditor's JubJub public key (x, y)
    signal input R_e[2];    // ephemeral public key = r_e * H (emitted on-chain)
    signal input A_enc;     // encrypted amount = A + (r_e * K_aud).x (emitted on-chain)

    var G[2] = PiiloGeneratorG();
    var H[2] = PiiloGeneratorH();

    // 0. Range check B itself, not just A. GreaterEqThan/LessThan in
    // circomlib assume both inputs already fit in n bits — without this,
    // a B near the field modulus makes the comparator's internal
    // n+1-bit decomposition wrap and produce a meaningless result.
    component bits_B = Num2Bits(n);
    bits_B.in <== B;

    // 1. Verify sender owns this balance: C_B opens to (B, r_B).
    component com_B = PedersenCommit(n);
    com_B.value <== B;
    com_B.blinding <== r_B;
    com_B.gX <== G[0]; com_B.gY <== G[1];
    com_B.hX <== H[0]; com_B.hY <== H[1];
    C_B[0] === com_B.outX;
    C_B[1] === com_B.outY;

    // 2. Verify amount commitment is well-formed: C_A opens to (A, r_A).
    component com_A = PedersenCommit(n);
    com_A.value <== A;
    com_A.blinding <== r_A;
    com_A.gX <== G[0]; com_A.gY <== G[1];
    com_A.hX <== H[0]; com_A.hY <== H[1];
    C_A[0] === com_A.outX;
    C_A[1] === com_A.outY;

    // 3. Range check: B >= A (no overdraft)
    component gte = GreaterEqThan(n);
    gte.in[0] <== B;
    gte.in[1] <== A;
    gte.out === 1;

    // 4. Range check: A >= 0 (constrain to n-bit unsigned)
    component bits_A = Num2Bits(n);
    bits_A.in <== A;

    // 5. Verify new balance commitment is correct: C_new opens to (B-A, r_new).
    component com_new = PedersenCommit(n);
    com_new.value <== B - A;
    com_new.blinding <== r_new;
    com_new.gX <== G[0]; com_new.gY <== G[1];
    com_new.hX <== H[0]; com_new.hY <== H[1];
    C_new[0] === com_new.outX;
    C_new[1] === com_new.outY;

    // ── Auditor ECDH block ───────────────────────────────────────────────────

    // A0. r_e != 0: if r_e = 0, then R_e = identity and S = identity, so
    //     S.x = 0 and A_enc = A — the amount leaks in plaintext. Checked
    //     first so the scalar-mul components below never receive zero.
    component r_e_zero = IsZero();
    r_e_zero.in <== r_e;
    r_e_zero.out === 0;

    // A1. K_aud lies on the JubJub curve. An off-curve auditor key would
    //     make the ECDH shared-secret computation undefined (the scalar-mul
    //     formula assumes a valid curve point), breaking auditor decryption
    //     soundness without failing proof verification.
    component k_aud_on_curve = IsOnJubJub();
    k_aud_on_curve.x <== K_aud[0];
    k_aud_on_curve.y <== K_aud[1];

    // A2. K_aud is not the identity (0, 1) or the 2-torsion element (0, -1);
    //     both have x = 0 and both would give S = identity regardless of r_e,
    //     leaking A. Checking x != 0 excludes both.
    component k_aud_x_nonzero = IsZero();
    k_aud_x_nonzero.in <== K_aud[0];
    k_aud_x_nonzero.out === 0;

    // A3. Decompose r_e once; the same bits drive both A4 and A5.
    component r_e_bits = Num2Bits(255);
    r_e_bits.in <== r_e;

    // A4. R_e = r_e * H — proves the published ephemeral key was formed from r_e.
    component r_e_mul = EdwardsMulScalar(255);
    r_e_mul.baseX <== H[0];
    r_e_mul.baseY <== H[1];
    for (var i = 0; i < 255; i++) { r_e_mul.e[i] <== r_e_bits.out[i]; }
    R_e[0] === r_e_mul.xout;
    R_e[1] === r_e_mul.yout;

    // A5. S = r_e * K_aud (ECDH). Auditor recovers this as k_aud * R_e.
    component s_mul = EdwardsMulScalar(255);
    s_mul.baseX <== K_aud[0];
    s_mul.baseY <== K_aud[1];
    for (var i = 0; i < 255; i++) { s_mul.e[i] <== r_e_bits.out[i]; }

    // A6. A_enc = A + S.x — additive OTP. Auditor decrypts: A = A_enc - S.x.
    A_enc === A + s_mul.xout;
}

component main {public [C_B, C_A, C_new, K_aud, R_e, A_enc]} = Transfer(64);
