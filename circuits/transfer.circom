pragma circom 2.0.0;
// Compile for the BLS12-381 prime, not Circom's BN254 default:
// circom transfer.circom --r1cs --wasm --sym --prime bls12381

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "jubjub.circom";

// Proves a valid balance update without revealing amounts: sender owns
// >= the transferred amount, and the new balance commitment correctly
// opens to (B - A). G, H are Piilo's fixed Pedersen generators (hardcoded
// here, not public inputs — they're a deployment-wide constant, not
// per-call data; see jubjub.circom for how they were derived).
template Transfer(n) {
    // Private inputs — never leave the client
    signal input B;        // sender's plaintext balance
    signal input r_B;      // sender's balance blinding factor
    signal input A;        // transfer amount
    signal input r_A;      // amount blinding factor
    signal input r_new;    // new balance blinding factor (sender chooses fresh)

    // Public inputs — verified on-chain
    signal input C_B[2];    // current on-chain balance commitment (x, y)
    signal input C_A[2];    // amount commitment (submitted with tx, added to recipient pending)
    signal input C_new[2];  // new sender balance commitment (written to chain)

    var G[2] = PiiloGeneratorG();
    var H[2] = PiiloGeneratorH();

    // 0. Range check B itself, not just A. GreaterEqThan/LessThan in
    // circomlib assume both inputs already fit in n bits — without this,
    // a B near the field modulus makes the comparator's internal
    // n+1-bit decomposition wrap and produce a meaningless result.
    // (Binding makes a forged B computationally infeasible to find, but
    // the comparator's precondition should be enforced explicitly, not
    // left to an inductive argument about how B could have arisen.)
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
}

component main {public [C_B, C_A, C_new]} = Transfer(64);
