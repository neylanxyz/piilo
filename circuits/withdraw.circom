pragma circom 2.0.0;
// circom withdraw.circom --r1cs --wasm --sym --prime bls12381

include "circomlib/circuits/bitify.circom";
include "jubjub.circom";

// Proves ownership of a balance before revealing it. Voluntary privacy
// exit. Same PedersenCommit(n) and generators as transfer.circom.
template Withdraw(n) {
    // Private
    signal input r_B;   // blinding factor

    // Public
    signal input C_B[2]; // on-chain commitment
    signal input B;      // revealed plaintext balance (chain sees this)

    var G[2] = PiiloGeneratorG();
    var H[2] = PiiloGeneratorH();

    component com = PedersenCommit(n);
    com.value <== B;
    com.blinding <== r_B;
    com.gX <== G[0]; com.gY <== G[1];
    com.hX <== H[0]; com.hY <== H[1];
    C_B[0] === com.outX;
    C_B[1] === com.outY;
}

component main {public [C_B, B]} = Withdraw(64);
