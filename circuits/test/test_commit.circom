pragma circom 2.0.0;

include "../jubjub.circom";

component main {public [value, blinding, gX, gY, hX, hY]} = PedersenCommit(64);
