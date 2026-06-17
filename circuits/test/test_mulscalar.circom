pragma circom 2.0.0;

include "../jubjub.circom";

template Test(n) {
    signal input e[n];
    signal input baseX;
    signal input baseY;
    signal output xout;
    signal output yout;

    component m = EdwardsMulScalar(n);
    m.baseX <== baseX;
    m.baseY <== baseY;
    for (var i = 0; i < n; i++) {
        m.e[i] <== e[i];
    }
    xout <== m.xout;
    yout <== m.yout;
}

component main {public [e, baseX, baseY]} = Test(8);
