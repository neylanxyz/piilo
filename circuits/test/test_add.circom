pragma circom 2.0.0;

include "../jubjub.circom";

component main {public [x1, y1, x2, y2]} = EdwardsAdd();
