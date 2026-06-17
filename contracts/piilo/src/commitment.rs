//! Pedersen commitments over JubJub (Zcash's twisted Edwards curve,
//! embedded in BLS12-381's scalar field Fr), using the native
//! fr_add/fr_sub/fr_mul/fr_inv host functions (CAP-0059).
//!
//! This is the design CLAUDE.md originally wanted for BN254/Baby JubJub,
//! but Soroban's BN254 module doesn't expose generic Fr arithmetic — only
//! G1/G2 point ops and pairing_check. BLS12-381's module does expose
//! fr_add/fr_sub/fr_mul/fr_pow/fr_inv directly, so the original "cheap
//! on-chain AND cheap in-circuit" design is achievable for real here: a
//! commitment's (x, y) coordinates are themselves Fr elements, matching
//! the Groth16 circuit's native field exactly.
//!
//! Curve: -x^2 + y^2 = 1 + d*x^2*y^2 (a = -1), d =
//! 19257038036680949359750312669786877991949435402254120286184196891950884077233
//! (= -(10240/10241) mod q, Zcash's JubJub parameters — verified by direct
//! computation against the BLS12-381 Fr modulus, not copied blind from a
//! search result). Identity (neutral element) is (0, 1).
//!
//! Point addition uses extended coordinates (X:Y:T:Z) and the
//! 'add-2008-hwcd-3' unified formula (Hisil-Wong-Carter-Dawson,
//! "Twisted Edwards Curves Revisited", valid because a = -1) instead of
//! plain affine addition. This matters a lot in practice: affine addition
//! needs 2 modular inversions per call, and naive double-and-add scalar
//! multiplication calls addition ~256 times — that's >500 fr_inv calls,
//! which blew Soroban's compute budget outright in testing (every single
//! test failed with Error(Budget, ExceededLimit), not just the slow ones).
//! Extended coordinates make addition inversion-free; only converting back
//! to affine at the very end needs one inversion. ~256x fewer inversions
//! per scalar_mul.

use soroban_sdk::{contracttype, crypto::bls12_381::Fr, BytesN, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Point {
    pub x: BytesN<32>,
    pub y: BytesN<32>,
}

impl Point {
    pub fn from_fr(x: Fr, y: Fr) -> Self {
        Point { x: x.to_bytes(), y: y.to_bytes() }
    }

    pub fn x_fr(&self) -> Fr {
        Fr::from_bytes(self.x.clone())
    }

    pub fn y_fr(&self) -> Fr {
        Fr::from_bytes(self.y.clone())
    }
}

/// Extended twisted Edwards coordinates: affine (x, y) = (X/Z, Y/Z), with
/// T maintaining the invariant T = XY/Z.
struct ExtPoint {
    x: Fr,
    y: Fr,
    z: Fr,
    t: Fr,
}

fn fr_from_u64(env: &Env, v: u64) -> Fr {
    let mut buf = [0u8; 32];
    buf[24..32].copy_from_slice(&v.to_be_bytes());
    Fr::from_bytes(BytesN::from_array(env, &buf))
}

const fn jubjub_d_bytes() -> [u8; 32] {
    // 19257038036680949359750312669786877991949435402254120286184196891950884077233
    // = 0x2a9318e74bfa2b48f5fd9207e6bd7fd4292d7f6d37579d2601065fd6d6343eb1
    [
        0x2a, 0x93, 0x18, 0xe7, 0x4b, 0xfa, 0x2b, 0x48, 0xf5, 0xfd, 0x92, 0x07, 0xe6, 0xbd, 0x7f,
        0xd4, 0x29, 0x2d, 0x7f, 0x6d, 0x37, 0x57, 0x9d, 0x26, 0x01, 0x06, 0x5f, 0xd6, 0xd6, 0x34,
        0x3e, 0xb1,
    ]
}

/// k = 2*d, the constant the hwcd-3 addition formula is parameterized by.
fn jubjub_k(env: &Env) -> Fr {
    let d = Fr::from_bytes(BytesN::from_array(env, &jubjub_d_bytes()));
    env.crypto().bls12_381().fr_add(&d, &d)
}

pub fn identity(env: &Env) -> Point {
    let zero = [0u8; 32];
    let mut one = [0u8; 32];
    one[31] = 1;
    Point {
        x: BytesN::from_array(env, &zero),
        y: BytesN::from_array(env, &one),
    }
}

fn ext_identity(env: &Env) -> ExtPoint {
    ExtPoint {
        x: fr_from_u64(env, 0),
        y: fr_from_u64(env, 1),
        z: fr_from_u64(env, 1),
        t: fr_from_u64(env, 0),
    }
}

fn to_ext(env: &Env, p: &Point) -> ExtPoint {
    let x = p.x_fr();
    let y = p.y_fr();
    let t = env.crypto().bls12_381().fr_mul(&x, &y);
    ExtPoint { x, y, z: fr_from_u64(env, 1), t }
}

fn to_affine(env: &Env, p: &ExtPoint) -> Point {
    let bls = env.crypto().bls12_381();
    let z_inv = bls.fr_inv(&p.z);
    let x = bls.fr_mul(&p.x, &z_inv);
    let y = bls.fr_mul(&p.y, &z_inv);
    Point::from_fr(x, y)
}

/// 'add-2008-hwcd-3': strongly unified (doubling is just P+P, no special
/// case needed), inversion-free. Valid for a = -1 twisted Edwards curves,
/// which JubJub is.
fn ext_add(env: &Env, p1: &ExtPoint, p2: &ExtPoint, k: &Fr) -> ExtPoint {
    let bls = env.crypto().bls12_381();

    let a = bls.fr_mul(&bls.fr_sub(&p1.y, &p1.x), &bls.fr_sub(&p2.y, &p2.x));
    let b = bls.fr_mul(&bls.fr_add(&p1.y, &p1.x), &bls.fr_add(&p2.y, &p2.x));
    let c = bls.fr_mul(&bls.fr_mul(&p1.t, k), &p2.t);
    let d = bls.fr_mul(&bls.fr_add(&p1.z, &p1.z), &p2.z);

    let e = bls.fr_sub(&b, &a);
    let f = bls.fr_sub(&d, &c);
    let g = bls.fr_add(&d, &c);
    let h = bls.fr_add(&b, &a);

    ExtPoint {
        x: bls.fr_mul(&e, &f),
        y: bls.fr_mul(&g, &h),
        t: bls.fr_mul(&e, &h),
        z: bls.fr_mul(&f, &g),
    }
}

pub fn add(env: &Env, p1: &Point, p2: &Point) -> Point {
    let k = jubjub_k(env);
    let sum = ext_add(env, &to_ext(env, p1), &to_ext(env, p2), &k);
    to_affine(env, &sum)
}

/// Double-and-add scalar multiplication, MSB-first over the scalar's
/// 32-byte big-endian encoding, entirely in extended coordinates — only
/// the final result gets converted back to affine. Precomputed windowed
/// tables for the fixed G/H generators would cut this further but aren't
/// needed for the MVP.
pub fn scalar_mul(env: &Env, p: &Point, scalar: &Fr) -> Point {
    let k = jubjub_k(env);
    let base = to_ext(env, p);
    let bytes: [u8; 32] = scalar.to_bytes().to_array();
    let mut acc = ext_identity(env);
    for byte in bytes.iter() {
        for bit in (0..8u8).rev() {
            acc = ext_add(env, &acc, &acc, &k);
            if (byte >> bit) & 1 == 1 {
                acc = ext_add(env, &acc, &base, &k);
            }
        }
    }
    to_affine(env, &acc)
}

/// C = value*G + blinding*H
pub fn commit(env: &Env, value: &Fr, blinding: &Fr, g: &Point, h: &Point) -> Point {
    let vg = scalar_mul(env, g, value);
    let rh = scalar_mul(env, h, blinding);
    add(env, &vg, &rh)
}

/// Encodes a non-negative i128 (a balance or transfer amount) as an Fr
/// element. Caller is responsible for ensuring v >= 0 — amounts are
/// range-checked by the Groth16 circuit before they ever reach here; this
/// is just the on-chain encoding, not a security boundary.
pub fn fr_from_i128(env: &Env, v: i128) -> Fr {
    let mut buf = [0u8; 32];
    buf[16..32].copy_from_slice(&(v as u128).to_be_bytes());
    Fr::from_bytes(BytesN::from_array(env, &buf))
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::Env;

    /// soroban-sdk 25 enforces mainnet per-invocation resource limits in
    /// Env::default() by default. A single commit()/scalar_mul() call fits
    /// fine (confirmed separately in lib.rs's tests); these unit tests
    /// call commit()/add() several times in a row against one Env without
    /// going through separate contract invocations, which has no
    /// invocation boundary to reset the budget at — not representative of
    /// real usage, where each deposit/transfer is its own transaction with
    /// its own fresh budget. Disabling limits here tests the *math*, not
    /// the gas profile; windowed precomputed tables for the fixed G/H
    /// generators would be the real optimization before mainnet, not
    /// needed for this MVP.
    fn unmetered_env() -> Env {
        let env = Env::default();
        env.cost_estimate().disable_resource_limits();
        env.cost_estimate().budget().reset_unlimited();
        env
    }

    /// A genuine point on the JubJub curve: y = 3, x solved from the curve
    /// equation and verified via Tonelli-Shanks modular sqrt (computed and
    /// checked independently in Python, not copied from an unverified
    /// source — see commitment.rs's module doc for the d/q derivation
    /// approach this follows). Using an actually-on-curve point matters:
    /// the additive *homomorphism* (unlike commutativity or doubling)
    /// isn't guaranteed by the addition formula alone for arbitrary
    /// off-curve (x, y) pairs — it's a property of the curve's genuine
    /// group structure. An earlier version of this test used arbitrary
    /// off-curve dummy points and silently passed every property *except*
    /// the homomorphism check, which is the one that actually matters.
    fn base_point(env: &Env) -> Point {
        let x = BytesN::from_array(
            env,
            &[
                0x71, 0xd5, 0x66, 0x03, 0x4f, 0x97, 0x98, 0x31, 0x17, 0x11, 0xae, 0x45, 0xd3,
                0x6b, 0x76, 0xbb, 0x0c, 0xa1, 0x09, 0xd6, 0x62, 0xff, 0x23, 0xf9, 0xd5, 0xca,
                0x97, 0x9f, 0xee, 0x80, 0x18, 0x97,
            ],
        );
        let y = fr_from_u64(env, 3).to_bytes();
        Point { x, y }
    }

    fn rand_point(env: &Env, seed: u64) -> Point {
        scalar_mul(env, &base_point(env), &fr_from_u64(env, seed))
    }

    #[test]
    fn identity_is_neutral() {
        let env = unmetered_env();
        let p = rand_point(&env, 7);
        let id = identity(&env);
        assert_eq!(add(&env, &p, &id), p);
        assert_eq!(add(&env, &id, &p), p);
    }

    #[test]
    fn addition_is_commutative() {
        let env = unmetered_env();
        let p = rand_point(&env, 11);
        let q = rand_point(&env, 23);
        assert_eq!(add(&env, &p, &q), add(&env, &q, &p));
    }

    #[test]
    fn scalar_mul_two_equals_doubling() {
        let env = unmetered_env();
        let p = rand_point(&env, 31);
        let two = fr_from_u64(&env, 2);
        assert_eq!(scalar_mul(&env, &p, &two), add(&env, &p, &p));
    }

    #[test]
    fn scalar_mul_three_equals_triple_add() {
        let env = unmetered_env();
        let p = rand_point(&env, 41);
        let three = fr_from_u64(&env, 3);
        let expected = add(&env, &add(&env, &p, &p), &p);
        assert_eq!(scalar_mul(&env, &p, &three), expected);
    }

    #[test]
    fn scalar_mul_zero_is_identity() {
        let env = unmetered_env();
        let p = rand_point(&env, 53);
        let zero = fr_from_u64(&env, 0);
        assert_eq!(scalar_mul(&env, &p, &zero), identity(&env));
    }

    #[test]
    fn commit_is_additively_homomorphic() {
        let env = unmetered_env();
        let g = rand_point(&env, 61);
        let h = rand_point(&env, 67);

        let v1 = fr_from_u64(&env, 30);
        let r1 = fr_from_u64(&env, 101);
        let v2 = fr_from_u64(&env, 12);
        let r2 = fr_from_u64(&env, 202);

        let c1 = commit(&env, &v1, &r1, &g, &h);
        let c2 = commit(&env, &v2, &r2, &g, &h);
        let sum_commitments = add(&env, &c1, &c2);

        let bls = env.crypto().bls12_381();
        let v_sum = bls.fr_add(&v1, &v2);
        let r_sum = bls.fr_add(&r1, &r2);
        let commitment_of_sum = commit(&env, &v_sum, &r_sum, &g, &h);

        assert_eq!(sum_commitments, commitment_of_sum);
    }
}

/// Temporary, standalone cross-check (not part of the permanent suite):
/// confirms Rust's extended-coordinate `add` agrees with both an
/// independent plain-affine computation in Python and the Circom
/// EdwardsAdd gadget, on the exact same on-curve point (y = 3) used
/// throughout. All three computing the same result is strong evidence
/// the curve constants and formulas line up across contract and circuit.
#[cfg(test)]
mod cross_check {
    use super::*;
    use soroban_sdk::Env;

    fn cross_check_base_point(env: &Env) -> Point {
        let x_buf: [u8; 32] = [
            0x71, 0xd5, 0x66, 0x03, 0x4f, 0x97, 0x98, 0x31, 0x17, 0x11, 0xae, 0x45, 0xd3, 0x6b,
            0x76, 0xbb, 0x0c, 0xa1, 0x09, 0xd6, 0x62, 0xff, 0x23, 0xf9, 0xd5, 0xca, 0x97, 0x9f,
            0xee, 0x80, 0x18, 0x97,
        ];
        Point {
            x: BytesN::from_array(env, &x_buf),
            y: fr_from_u64(env, 3).to_bytes(),
        }
    }

    #[test]
    fn doubling_matches_independent_python_and_circuit_computation() {
        let env = Env::default();
        env.cost_estimate().disable_resource_limits();
        env.cost_estimate().budget().reset_unlimited();

        let p = cross_check_base_point(&env);
        let doubled = add(&env, &p, &p);

        let expected_x: [u8; 32] = [
            0x29, 0x6a, 0x27, 0x8e, 0xa1, 0xec, 0x26, 0x2a, 0x80, 0x8e, 0x33, 0x5a, 0xc7, 0x3f,
            0x7e, 0xcd, 0x26, 0x11, 0x88, 0x22, 0xbc, 0x95, 0x42, 0x13, 0x78, 0x4d, 0x08, 0x38,
            0x4f, 0x25, 0x79, 0xa5,
        ];
        let expected_y: [u8; 32] = [
            0x56, 0x91, 0xd7, 0x49, 0x7f, 0xc0, 0xf9, 0x79, 0x1c, 0xa7, 0xe3, 0xe0, 0x10, 0x27,
            0xc5, 0x11, 0x40, 0x45, 0x4b, 0xbe, 0x2f, 0x86, 0xf4, 0xce, 0xe1, 0xf3, 0x4f, 0xcd,
            0x52, 0x73, 0x77, 0xc1,
        ];
        assert_eq!(doubled.x.to_array(), expected_x, "x mismatch vs Python/circuit cross-check");
        assert_eq!(doubled.y.to_array(), expected_y, "y mismatch vs Python/circuit cross-check");
    }

    #[test]
    fn scalar_mul_three_matches_independent_python_and_circuit_computation() {
        let env = Env::default();
        env.cost_estimate().disable_resource_limits();
        env.cost_estimate().budget().reset_unlimited();

        let p = cross_check_base_point(&env);
        let three = fr_from_u64(&env, 3);
        let tripled = scalar_mul(&env, &p, &three);

        let expected_x: [u8; 32] = [
            0x07, 0x6f, 0x0a, 0x70, 0x50, 0xc5, 0xb6, 0xdb, 0xa4, 0x31, 0xe8, 0x19, 0x49, 0x8b,
            0x44, 0xec, 0xc8, 0xab, 0x39, 0x61, 0x65, 0x1a, 0xfc, 0xa0, 0x38, 0x5a, 0x19, 0x84,
            0x0d, 0x17, 0x6b, 0xc6,
        ];
        let expected_y: [u8; 32] = [
            0x52, 0x58, 0x06, 0xb4, 0x72, 0xfb, 0xfd, 0xa5, 0xfe, 0x2c, 0x5a, 0xd1, 0xa0, 0x60,
            0xfc, 0x57, 0x79, 0x5e, 0xe0, 0x24, 0xa3, 0xd0, 0x38, 0x9a, 0x21, 0xf9, 0x71, 0x4c,
            0x49, 0xa9, 0x44, 0xca,
        ];
        assert_eq!(tripled.x.to_array(), expected_x, "x mismatch vs Python/circuit cross-check");
        assert_eq!(tripled.y.to_array(), expected_y, "y mismatch vs Python/circuit cross-check");
    }

    /// The critical one: confirms commit() — the actual function `deposit`
    /// calls — produces byte-identical output to the real PedersenCommit
    /// circuit (circuits/jubjub.circom) for the same (value, blinding, G,
    /// H), cross-validated independently in Python first. If circuit and
    /// contract ever disagree on this, every proof the SDK generates would
    /// be rejected on-chain — this is what catches that before it ships.
    #[test]
    fn commit_matches_independent_python_and_circuit_computation() {
        let env = Env::default();
        env.cost_estimate().disable_resource_limits();
        env.cost_estimate().budget().reset_unlimited();

        let g = cross_check_base_point(&env);
        let h_x: [u8; 32] = [
            0x2e, 0xc9, 0x6f, 0x18, 0x58, 0xb8, 0xba, 0x39, 0x43, 0x25, 0xe9, 0x72, 0x63, 0x02,
            0x91, 0x77, 0x90, 0x12, 0x45, 0xd2, 0x54, 0x93, 0x46, 0xf6, 0xee, 0x7d, 0xfc, 0x7a,
            0xb6, 0xe5, 0xb0, 0x61,
        ];
        let h_y: [u8; 32] = [
            0x3c, 0x7f, 0xad, 0xa8, 0xb6, 0xc7, 0x37, 0x5e, 0x4e, 0xcb, 0x26, 0xc1, 0xbf, 0x4b,
            0x1a, 0x52, 0x5a, 0x4c, 0xcf, 0x0f, 0x8b, 0x3e, 0x2f, 0x7f, 0x38, 0x35, 0x0a, 0x3b,
            0x68, 0x39, 0x5a, 0xac,
        ];
        let h = Point {
            x: BytesN::from_array(&env, &h_x),
            y: BytesN::from_array(&env, &h_y),
        };

        let value = fr_from_i128(&env, 500);
        let blinding = fr_from_u64(&env, 777);
        let c = commit(&env, &value, &blinding, &g, &h);

        let expected_x: [u8; 32] = [
            0x72, 0x16, 0x03, 0xac, 0xc9, 0x5d, 0xac, 0x17, 0xd7, 0xe5, 0xf4, 0xdb, 0x52, 0xdc,
            0xc8, 0xf9, 0x88, 0x5c, 0x02, 0x50, 0x40, 0x11, 0xac, 0x51, 0xce, 0xe9, 0x66, 0x65,
            0x04, 0x14, 0x3a, 0x4c,
        ];
        let expected_y: [u8; 32] = [
            0x4a, 0xe2, 0x19, 0xa0, 0x0b, 0x17, 0xba, 0xf7, 0xd9, 0x60, 0x8e, 0xd1, 0x27, 0x01,
            0x47, 0x7d, 0x94, 0x7a, 0xc2, 0x3b, 0x8d, 0x14, 0x4d, 0x7b, 0xd4, 0x50, 0x6e, 0x10,
            0x7e, 0x34, 0xe3, 0xa0,
        ];
        assert_eq!(c.x.to_array(), expected_x, "x mismatch vs Python/circuit cross-check");
        assert_eq!(c.y.to_array(), expected_y, "y mismatch vs Python/circuit cross-check");
    }
}
