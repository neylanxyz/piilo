#![cfg(test)]
extern crate std;

// Two kinds of real-proof tests:
// 1. A golden test using Stellar's own published, externally-generated
//    Circom proof for a*b=c (data/{proof,verification_key,public}.json in
//    stellar/soroban-examples/groth16_verifier) — confirms this ported
//    contract behaves identically to the official one against a proof we
//    didn't generate ourselves.
// 2. A flexible N-public-input test using mainline ark-groth16 (no
//    Circom/snarkjs needed for this) — matches the shapes Piilo actually
//    needs (6 inputs for transfer, 3 for withdraw).

use super::*;
use ark_bls12_381::{Bls12_381, Fq, Fq2, Fr as ArkFr};
use ark_ff::{BigInteger, PrimeField};
use ark_groth16::{Groth16, Proof as ArkProof, ProvingKey};
use ark_relations::gr1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError, Variable};
use ark_serialize::CanonicalSerialize;
use ark_std::rand::{rngs::StdRng, SeedableRng};
use core::str::FromStr;
use soroban_sdk::{crypto::bls12_381::{G1_SERIALIZED_SIZE, G2_SERIALIZED_SIZE}, BytesN, U256};

fn g1_from_coords(env: &Env, x: &str, y: &str) -> G1Affine {
    let ark_g1 = ark_bls12_381::G1Affine::new(Fq::from_str(x).unwrap(), Fq::from_str(y).unwrap());
    let mut buf = [0u8; G1_SERIALIZED_SIZE];
    ark_g1.serialize_uncompressed(&mut buf[..]).unwrap();
    G1Affine::from_array(env, &buf)
}

fn g2_from_coords(env: &Env, x1: &str, x2: &str, y1: &str, y2: &str) -> G2Affine {
    let x = Fq2::new(Fq::from_str(x1).unwrap(), Fq::from_str(x2).unwrap());
    let y = Fq2::new(Fq::from_str(y1).unwrap(), Fq::from_str(y2).unwrap());
    let ark_g2 = ark_bls12_381::G2Affine::new(x, y);
    let mut buf = [0u8; G2_SERIALIZED_SIZE];
    ark_g2.serialize_uncompressed(&mut buf[..]).unwrap();
    G2Affine::from_array(env, &buf)
}

fn create_client(e: &Env) -> Groth16VerifierClient<'_> {
    Groth16VerifierClient::new(e, &e.register(Groth16Verifier {}, ()))
}

/// Stellar's own test vectors, copied verbatim from
/// stellar/soroban-examples/groth16_verifier/src/test.rs (data/*.json
/// there): a Circom circuit proving a*b=c for a=3, b=11, c=33, c public.
#[test]
fn matches_stellars_own_published_proof() {
    let env = Env::default();

    let vk = VerificationKey {
        alpha: g1_from_coords(
            &env,
            "851850525556173310373115880154698084608631105506432893865500290442025919078535925294035153152030470398262539759609",
            "2637289349983507610125993281171282870664683328789064436670091381805667870657250691837988574635646688089951719927247",
        ),
        beta: g2_from_coords(
            &env,
            "1312620381151154625549413690218290437739613987001512553647554932245743783919690104921577716179019375920325686841943",
            "1853421227732662200477195678252233549930451033531229987959164216695698667330234953033341200627605777603511819497457",
            "3215807833988244618006117550809420301978856703407297742347804415291049013404133666905173282837707341742014140541018",
            "812366606879346135498483310623227330050424196838294715759414425317592599094348477520229174120664109186562798527696",
        ),
        gamma: g2_from_coords(
            &env,
            "352701069587466618187139116011060144890029952792775240219908644239793785735715026873347600343865175952761926303160",
            "3059144344244213709971259814753781636986470325476647558659373206291635324768958432433509563104347017837885763365758",
            "1985150602287291935568054521177171638300868978215655730859378665066344726373823718423869104263333984641494340347905",
            "927553665492332455747201965776037880757740193453592970025027978793976877002675564980949289727957565575433344219582",
        ),
        delta: g2_from_coords(
            &env,
            "2981843938988033214458466658185878126396080429969635248100956025957789319926032198626745120548947333202362392267114",
            "2236695112259305382987038341098587500598216646308901956168137697892380899086228863246537938263638056666003066263342",
            "717163810166643254871951856655865822196000925757284470845197358532703820821048809982340614428800986999944933231635",
            "3496058064578305387608803828034117220735807855182872031001942587835768203820179263722136810383631418598310938506798",
        ),
        ic: Vec::from_array(
            &env,
            [
                g1_from_coords(
                    &env,
                    "829685638389803071404995253486571779300247099942205634643821309129201420207693030476756893332812706176564514055395",
                    "3455508165409829148751617737772894557887792278044850553785496869183933597103951941805834639972489587640583544390358",
                ),
                g1_from_coords(
                    &env,
                    "2645559270376031734407122278942646687260452979296081924477586893972449945444985371392950465676350735694002713633589",
                    "2241039659097418315097403108596818813895651201896886552939297756980670248638746432560267634304593609165964274111037",
                ),
            ],
        ),
    };

    let proof = Proof {
        a: g1_from_coords(
            &env,
            "314442236668110257304682488877371582255161413673331360366570443799415414639292047869143313601702131653514009114222",
            "2384632327855835824635705027009217874826122107057894594162233214798350178691568018290025994699762298534539543934607",
        ),
        b: g2_from_coords(
            &env,
            "428844167033934720609657613212495751617651348480870890908850335525890280786532876634895457032623422366474694342656",
            "3083139526360252775789959298805261067575555607578161553873977966165446991459924053189383038704105379290158793353905",
            "1590919422794657666432683000821892403620510405626533455397042191265963587891653562867091397248216891852168698286910",
            "3617931039814164588401589536353142503544155307022467123698224064329647390280346725086550997337076315487486714327146",
        ),
        c: g1_from_coords(
            &env,
            "3052934797502613468327963344215392478880720823583493172692775426011388142569325036386650708808320216973179639719187",
            "2028185281516938724429867827057869371578022471499780916652824405212207527699373814371051328341613972789943854539597",
        ),
    };

    let client = create_client(&env);

    let correct_output = Vec::from_array(&env, [Fr::from_u256(U256::from_u32(&env, 33))]);
    assert_eq!(client.verify_proof(&vk, &proof, &correct_output), true);

    let wrong_output = Vec::from_array(&env, [Fr::from_u256(U256::from_u32(&env, 22))]);
    assert_eq!(client.verify_proof(&vk, &proof, &wrong_output), false);
}

/// Ties N public inputs to a witness via one R1CS constraint, same minimal
/// pattern used elsewhere in this repo for generating real proofs of
/// arbitrary shape without Circom.
#[derive(Clone)]
struct NInputCircuit<const N: usize> {
    inputs: [ArkFr; N],
}

impl<const N: usize> ConstraintSynthesizer<ArkFr> for NInputCircuit<N> {
    fn generate_constraints(self, cs: ConstraintSystemRef<ArkFr>) -> Result<(), SynthesisError> {
        let first = cs.new_input_variable(|| Ok(self.inputs[0]))?;
        for i in 1..N {
            let _ = cs.new_input_variable(|| Ok(self.inputs[i]))?;
        }
        let witness = cs.new_witness_variable(|| Ok(self.inputs[0]))?;
        cs.enforce_r1cs_constraint(|| witness.into(), || Variable::One.into(), || first.into())?;
        Ok(())
    }
}

fn g1_to_sdk(env: &Env, p: ark_bls12_381::G1Affine) -> G1Affine {
    let mut buf = [0u8; G1_SERIALIZED_SIZE];
    p.serialize_uncompressed(&mut buf[..]).unwrap();
    G1Affine::from_array(env, &buf)
}

fn g2_to_sdk(env: &Env, p: ark_bls12_381::G2Affine) -> G2Affine {
    let mut buf = [0u8; G2_SERIALIZED_SIZE];
    p.serialize_uncompressed(&mut buf[..]).unwrap();
    G2Affine::from_array(env, &buf)
}

fn fr_to_sdk(env: &Env, value: ArkFr) -> Fr {
    let mut buf = [0u8; 32];
    buf.copy_from_slice(&value.into_bigint().to_bytes_be());
    Fr::from_bytes(BytesN::from_array(env, &buf))
}

fn vk_to_sdk(env: &Env, vk: &ark_groth16::VerifyingKey<Bls12_381>) -> VerificationKey {
    let mut ic = Vec::new(env);
    for p in vk.gamma_abc_g1.iter() {
        ic.push_back(g1_to_sdk(env, *p));
    }
    VerificationKey {
        alpha: g1_to_sdk(env, vk.alpha_g1),
        beta: g2_to_sdk(env, vk.beta_g2),
        gamma: g2_to_sdk(env, vk.gamma_g2),
        delta: g2_to_sdk(env, vk.delta_g2),
        ic,
    }
}

fn proof_to_sdk(env: &Env, proof: &ArkProof<Bls12_381>) -> Proof {
    Proof {
        a: g1_to_sdk(env, proof.a),
        b: g2_to_sdk(env, proof.b),
        c: g1_to_sdk(env, proof.c),
    }
}

fn setup<const N: usize>(rng: &mut StdRng) -> ProvingKey<Bls12_381> {
    let dummy = NInputCircuit::<N> { inputs: [ArkFr::from(1u64); N] };
    Groth16::<Bls12_381>::generate_random_parameters_with_reduction(dummy, rng).expect("groth16 setup")
}

#[test]
fn accepts_a_genuinely_valid_proof_with_six_inputs() {
    let env = Env::default();
    let mut rng = StdRng::seed_from_u64(7);
    let pk = setup::<6>(&mut rng);

    let inputs = [
        ArkFr::from(1u64),
        ArkFr::from(2u64),
        ArkFr::from(3u64),
        ArkFr::from(4u64),
        ArkFr::from(5u64),
        ArkFr::from(6u64),
    ];
    let proof = Groth16::<Bls12_381>::create_random_proof_with_reduction(
        NInputCircuit { inputs },
        &pk,
        &mut rng,
    )
    .expect("groth16 prove");

    let vk = vk_to_sdk(&env, &pk.vk);
    let sdk_proof = proof_to_sdk(&env, &proof);
    let mut public_inputs = Vec::new(&env);
    for v in inputs {
        public_inputs.push_back(fr_to_sdk(&env, v));
    }

    let client = create_client(&env);
    assert_eq!(client.verify_proof(&vk, &sdk_proof, &public_inputs), true);
}

#[test]
fn rejects_a_proof_for_the_wrong_statement() {
    let env = Env::default();
    let mut rng = StdRng::seed_from_u64(7);
    let pk = setup::<3>(&mut rng);

    let inputs = [ArkFr::from(1u64), ArkFr::from(2u64), ArkFr::from(3u64)];
    let proof = Groth16::<Bls12_381>::create_random_proof_with_reduction(
        NInputCircuit { inputs },
        &pk,
        &mut rng,
    )
    .expect("groth16 prove");

    let vk = vk_to_sdk(&env, &pk.vk);
    let sdk_proof = proof_to_sdk(&env, &proof);
    let mut wrong_inputs = Vec::new(&env);
    for v in [ArkFr::from(1u64), ArkFr::from(2u64), ArkFr::from(999u64)] {
        wrong_inputs.push_back(fr_to_sdk(&env, v));
    }

    let client = create_client(&env);
    assert_eq!(client.verify_proof(&vk, &sdk_proof, &wrong_inputs), false);
}

#[test]
fn rejects_wrong_public_input_count() {
    let env = Env::default();
    let mut rng = StdRng::seed_from_u64(7);
    let pk = setup::<3>(&mut rng);

    let inputs = [ArkFr::from(1u64), ArkFr::from(2u64), ArkFr::from(3u64)];
    let proof = Groth16::<Bls12_381>::create_random_proof_with_reduction(
        NInputCircuit { inputs },
        &pk,
        &mut rng,
    )
    .expect("groth16 prove");

    let vk = vk_to_sdk(&env, &pk.vk);
    let sdk_proof = proof_to_sdk(&env, &proof);
    let mut short_inputs = Vec::new(&env);
    short_inputs.push_back(fr_to_sdk(&env, ArkFr::from(1u64)));

    let client = create_client(&env);
    let result = client.try_verify_proof(&vk, &sdk_proof, &short_inputs);
    assert_eq!(result, Err(Ok(Groth16Error::MalformedVerifyingKey)));
}
