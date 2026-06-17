//! Real Groth16 verifier, imported directly from its compiled WASM (see
//! ../../verifier — built via `stellar contract build --package verifier`
//! before this crate can build). No mock, no hand-defined trait: this is
//! the actual deployed contract's bytecode and ABI.
//!
//! The verifier is stateless (matches stellar/soroban-examples'
//! `groth16_verifier` design): one generic deployment serves both circuits
//! (transfer, withdraw) since each call carries its own VerificationKey —
//! Piilo holds both VKs and passes the right one per call.

pub mod verifier_contract {
    soroban_sdk::contractimport!(file = "../../target/wasm32v1-none/release/verifier.wasm");
}

pub use verifier_contract::{Client as VerifierClient, Proof, VerificationKey};
