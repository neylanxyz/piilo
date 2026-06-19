pragma circom 2.0.0;

// JubJub (Zcash's twisted Edwards curve, embedded in BLS12-381's scalar
// field Fr) point arithmetic gadgets. circomlib's babyjub.circom /
// escalarmulany.circom are hardcoded for Baby JubJub's parameters
// (a = 168700, d = 168696) over BN254 — not parameterized for another
// curve, so this file reimplements the same structure with JubJub's real
// parameters instead, to be compiled with `circom --prime bls12381`.
//
// a = -1, d = 19257038036680949359750312669786877991949435402254120286184196891950884077233
// (= -(10240/10241) mod q, Zcash's JubJub — same constants used in
// contracts/piilo/src/commitment.rs, verified there by direct
// computation against the BLS12-381 Fr modulus).
//
// Unlike commitment.rs (which needed extended coordinates to avoid
// expensive on-chain modular inversions), this circuit uses plain affine
// addition throughout, including for doubling: in Circom, a field
// inversion is just one extra multiplication constraint (the witness
// computes 1/x off-circuit; the circuit only constrains inv*x === 1), so
// there's no "budget" pressure the way there was on Soroban — only
// constraint *count* matters, and one extra constraint per inversion is
// cheap. This is safe to do unconditionally (no exceptional/degenerate
// inputs) specifically because a = -1 is a quadratic residue mod q and d
// is a non-residue (verified computationally, not assumed) — this is
// exactly the Bernstein-Lange-Farashahi condition for a *complete*
// twisted Edwards addition law: the formula below never divides by zero,
// for any pair of valid curve points, including the identity and
// including doubling (P + P). No Montgomery-curve conversion (which
// circomlib's EscalarMulAny uses to dodge incomplete-addition edge cases
// on Baby JubJub) is needed here.

include "circomlib/circuits/bitify.circom";

// Piilo's Pedersen commitment generators G, H. Derived via a
// nothing-up-my-sleeve hash-to-curve procedure (SHA-256 of a fixed,
// domain-separated label, try-and-increment until the result is a valid
// curve point) — NOT picked as related points (e.g. H = k*G for a known
// k), which would let whoever knows k break the hiding property of every
// commitment using them. Computed and verified independently in Python;
// must match exactly whatever G/H the deployed contract's constructor is
// given (see CLAUDE.md).
function PiiloGeneratorG() {
    var g[2] = [
        52011214036797608008763021134739816867182510661071949920602030138765591619595,
        36017543053724001483519641180346241195937746995850157919072206337752529044138
    ];
    return g;
}

function PiiloGeneratorH() {
    var h[2] = [
        2641322346204092426446313763048872749581807614122456322352786044536967383341,
        12433362859382302755418372944023213970869823563090304431189761096447391844644
    ];
    return h;
}

// Twisted Edwards point addition: (x1,y1) + (x2,y2) = (xout,yout).
// Same algebraic identity as commitment.rs's `add`, refactored into
// beta/gamma/delta/tau the same way circomlib's BabyAdd is (fewer
// multiplication gates), just with JubJub's a, d instead of Baby JubJub's.
template EdwardsAdd() {
    signal input x1;
    signal input y1;
    signal input x2;
    signal input y2;
    signal output xout;
    signal output yout;

    signal beta;
    signal gamma;
    signal delta;
    signal tau;

    var a = -1;
    var d = 19257038036680949359750312669786877991949435402254120286184196891950884077233;

    beta <== x1 * y2;
    gamma <== y1 * x2;
    delta <== (-a * x1 + y1) * (x2 + y2);
    tau <== beta * gamma;

    xout <-- (beta + gamma) / (1 + d * tau);
    (1 + d * tau) * xout === (beta + gamma);

    yout <-- (delta + a * beta - gamma) / (1 - d * tau);
    (1 - d * tau) * yout === (delta + a * beta - gamma);
}

// Scalar multiplication of an arbitrary (typically fixed) base point by an
// n-bit scalar, double-and-add, LSB-first (e[0] = least significant bit).
// Computes both the doubled-base and the conditional add unconditionally
// every iteration and selects with the bit (the standard technique —
// matches circomlib's BitElementMulAny/Multiplexor2 pattern), since Circom
// has no mutable loop state, only SSA-style signals.
template EdwardsMulScalar(n) {
    signal input e[n];
    signal input baseX;
    signal input baseY;
    signal output xout;
    signal output yout;

    signal accX[n + 1];
    signal accY[n + 1];
    signal curX[n + 1];
    signal curY[n + 1];

    component adders[n];
    component doublers[n];

    // Identity (0, 1) — twisted Edwards, not (0, 0).
    accX[0] <== 0;
    accY[0] <== 1;
    curX[0] <== baseX;
    curY[0] <== baseY;

    for (var i = 0; i < n; i++) {
        adders[i] = EdwardsAdd();
        adders[i].x1 <== accX[i];
        adders[i].y1 <== accY[i];
        adders[i].x2 <== curX[i];
        adders[i].y2 <== curY[i];

        accX[i + 1] <== accX[i] + e[i] * (adders[i].xout - accX[i]);
        accY[i + 1] <== accY[i] + e[i] * (adders[i].yout - accY[i]);

        doublers[i] = EdwardsAdd();
        doublers[i].x1 <== curX[i];
        doublers[i].y1 <== curY[i];
        doublers[i].x2 <== curX[i];
        doublers[i].y2 <== curY[i];
        curX[i + 1] <== doublers[i].xout;
        curY[i + 1] <== doublers[i].yout;
    }

    xout <== accX[n];
    yout <== accY[n];
}

// Checks that (x, y) lies on the JubJub curve: -x^2 + y^2 = 1 + d*x^2*y^2.
// Used to validate auditor public keys supplied as public inputs — the
// verifier contract doesn't check curve membership on its own, so an
// off-curve K_aud would silently break the ECDH soundness (the shared
// secret would not correspond to the auditor's private key).
template IsOnJubJub() {
    signal input x;
    signal input y;
    signal x2 <== x * x;
    signal y2 <== y * y;
    signal x2y2 <== x2 * y2;
    var d = 19257038036680949359750312669786877991949435402254120286184196891950884077233;
    y2 - x2 - 1 - d * x2y2 === 0;
}

// C = value*G + blinding*H. `value` is range-checked to n bits by the
// caller's own Num2Bits (transfer/withdraw circuits need that check
// anyway, for the no-overdraft relation) — PedersenCommit just consumes
// the same decomposition. `blinding` is decomposed to the full 255 bits
// needed to cover any BLS12-381 Fr element without failure (q has bit
// length exactly 255 and q < 2^255 — verified computationally; using
// fewer bits, e.g. 253, would make some valid blinding factors silently
// unprovable).
template PedersenCommit(n) {
    signal input value;
    signal input blinding;
    signal input gX;
    signal input gY;
    signal input hX;
    signal input hY;
    signal output outX;
    signal output outY;

    component vBits = Num2Bits(n);
    vBits.in <== value;

    component rBits = Num2Bits(255);
    rBits.in <== blinding;

    component vMul = EdwardsMulScalar(n);
    vMul.baseX <== gX;
    vMul.baseY <== gY;
    for (var i = 0; i < n; i++) {
        vMul.e[i] <== vBits.out[i];
    }

    component rMul = EdwardsMulScalar(255);
    rMul.baseX <== hX;
    rMul.baseY <== hY;
    for (var i = 0; i < 255; i++) {
        rMul.e[i] <== rBits.out[i];
    }

    component sum = EdwardsAdd();
    sum.x1 <== vMul.xout;
    sum.y1 <== vMul.yout;
    sum.x2 <== rMul.xout;
    sum.y2 <== rMul.yout;

    outX <== sum.xout;
    outY <== sum.yout;
}
