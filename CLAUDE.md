# Piilo — Confidential Payments on Stellar

Finnish for *hiding place*. Piilo is a privacy protocol for Stellar that hides transfer amounts and balances while keeping wallet addresses public — the right model for institutional compliance.

```
Addresses: public   (AML/KYC — by design)
Amounts:   hidden   (Pedersen commitments + Groth16 ZK proofs)
Balances:  hidden   (Pedersen commitments on-chain)
```

---

## Why this design

**Account-based, not UTXO.** Other Stellar privacy implementations (Nethermind SPP, SDF prototype) use a UTXO/shielded-pool model that maximizes unlinkability — you can't trace which deposit maps to which withdrawal. That's a mixer. Institutions can't use mixers.

Piilo uses an account model: each user has one account with one encrypted balance. Addresses are public. You always know who sent to whom. You never know how much. This is what "private by default, transparent by permission" means for a bank.

**No anonymity set dependency.** UTXO pools need volume to provide privacy — a pool with 3 users is trivially deanonymizable. Piilo's privacy holds from day one with one user, because it hides amounts via cryptographic commitments, not via mixing with a crowd.

**No indexer needed.** UTXO models need to reconstruct Merkle trees from historical events. Stellar RPC retains events for only 7 days — a production blocker. Piilo stores balance commitments directly in each account. State is always queryable on-chain. No event history needed.

**Groth16 is already on Stellar.** Protocol 25 "X-Ray" added BLS12-381 host functions to Soroban (CAP-0059, **Accepted** — more mature than BN254's CAP-0074, which is still status-sensitive/proposed). SDF ships and maintains its own reference Groth16 verifier for exactly this curve (`stellar/soroban-examples/groth16_verifier`), which Piilo's verifier contract is ported from directly — using Stellar's own example, not a third-party reuse, was a deliberate choice once we confirmed it. Measured real cost for a Groth16 pairing check on a 1-public-input circuit (from that example's own test output): ~41M of a 100M CPU-instruction budget, dominated by `Bls12381Pairing` (~30.3M). See Performance below for Piilo's own measured numbers.

**Groth16 over Bulletproofs.** Pedersen commitments are proof-system agnostic — the choice of how to *prove* statements about them (range checks, opening knowledge) is separate. Bulletproofs are attractive in other confidential-tx designs (Monero, Mimblewimble, Zether) because they need no trusted setup. We don't get that benefit here because we're already reusing an existing Powers-of-Tau ceremony and an existing, working, tested verifier contract, so the "no setup" win is moot. BLS12-381's host module does expose `g1_msm` (multi-scalar multiplication, which Bulletproofs verification is built from) unlike BN254's — so the old "Soroban can't do MSM" argument against Bulletproofs no longer strictly holds for this curve. But it doesn't matter here: we'd be throwing away a real, tested, ported verifier contract and the range checks (`B >= A`, `A >= 0`) are already free inside the Groth16 circuit as R1CS constraints — switching to Bulletproofs would mean running two proof systems to solve a problem one already solves, for a benefit (no trusted setup) we don't need.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                FRONTEND (React)                   │
│  Freighter wallet · Deposit · Transfer · Withdraw │
│  Uses @piilo/sdk — no direct crypto calls        │
└────────────────┬─────────────────────────────────┘
                 │ uses
                 ▼
┌──────────────────────────────────────────────────┐
│              @piilo/sdk (TypeScript)              │  ← main product
│  deposit · transfer · settleIfPending · withdraw  │
│  Client-side Groth16 proving (snarkjs WASM)      │
│  Local state: plaintext balance + blinding factor │
│  Payment note encrypt / decrypt                  │
│  Stellar transaction building                    │
└────────────────┬─────────────────────────────────┘
                 │ RPC + transactions
                 ▼
┌──────────────────────────────────────────────────┐
│           SOROBAN CONTRACTS (Stellar)             │
│  piilo: account management, vault XLM            │
│  verifier: Groth16/BLS12-381 (from Stellar)      │
│  On-chain JubJub point addition via real Fr      │
│  arithmetic (X-Ray BLS12-381 fr_add/fr_mul/...)  │
└──────────────────────────────────────────────────┘
```

No worker. No relay required for core operations. Everything is either done client-side (proof generation) or on-chain (proof verification, commitment arithmetic). The relay is an optional UX helper for fee payment — it holds no secrets and has no special trust.

Caveat: "optional" is about trust, not about onboarding. A brand-new Stellar account needs its base reserve funded in XLM before it exists at all, and needs spendable XLM to pay tx fees before it can call `deposit` for the first time — so for a user with zero XLM, fee sponsorship (a relay submitting a fee-bumped or sponsored-reserve transaction) is the only path in, not a nice-to-have. Plan for this in onboarding even though it's not part of the trust model.

---

## Cryptographic Design

### Pedersen Commitments

Commitments use **JubJub** (Zcash's twisted Edwards curve, embedded in BLS12-381's scalar field Fr) — this went through two iterations before landing here, worth knowing the history of:

1. First draft specified **Baby JubJub** (the BN254-embedded equivalent) — cheap to prove in-circuit, since its coordinates are Fr elements matching a BN254 circuit's native field.
2. Verified against real `soroban-sdk` source that BN254's X-Ray module (`crypto::bn254`) only exposes `g1_add`, `g1_mul`, `pairing_check` — no generic Fr field arithmetic, so Baby JubJub couldn't be implemented on-chain without hand-rolling 254-bit modular arithmetic from `U256` (overflow-prone, and exactly the kind of novel unaudited crypto code most dangerous in a fund-custodying contract). Moved commitments to **BN254's own G1 group** instead, accepting that the (not-yet-built) circuit would need non-native Fq-in-Fr arithmetic to prove G1 commitment openings.
3. Moving the *verifier* to BLS12-381 (to use Stellar's own official example — see Groth16 Proofs below) revealed that BLS12-381's X-Ray module *does* expose real `fr_add`/`fr_sub`/`fr_mul`/`fr_pow`/`fr_inv` directly. That removes the reason step 2 existed: JubJub (BLS12-381's analog of Baby JubJub) can now be implemented on-chain for real, using genuine host calls, with coordinates that are *already* Fr elements — cheap on-chain AND cheap in-circuit, the combination step 1 wanted but couldn't get on BN254.

```
C = B·G + r·H
```

- `B` — plaintext value (balance or amount), kept private
- `r` — blinding factor (random scalar), kept private
- `G`, `H` — public JubJub generator points (stored in contract)
- `C` — commitment: a JubJub point, (x, y) each a 32-byte Fr element, stored on-chain. Identity (neutral element) is `(0, 1)` — twisted Edwards curves don't have a "point at infinity" the way Weierstrass/G1 curves do.

**Curve parameters** (Zcash's JubJub, not invented for this project): twisted Edwards `-x² + y² = 1 + d·x²·y²`, `a = -1`, `d = 19257038036680949359750312669786877991949435402254120286184196891950884077233` (`= -(10240/10241) mod q`). Verified by direct computation against BLS12-381's Fr modulus (`q = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001`), not copied blind from a search result.

**Implementation detail that matters in practice**: naive affine point addition needs 2 modular inversions per call, and double-and-add scalar multiplication calls addition ~256 times — that's 500+ `fr_inv` calls per `scalar_mul`, which blew Soroban's compute budget outright (every single test failed with `Error(Budget, ExceededLimit)`, not just the slow ones). `commitment.rs` uses **extended coordinates** (X:Y:T:Z) and the `add-2008-hwcd-3` unified addition formula (Hisil-Wong-Carter-Dawson, valid for `a = -1` curves), which is inversion-free — only the final conversion back to affine needs one inversion. ~256x fewer inversions per `scalar_mul`. See Performance below for what this costs in practice now.

**Homomorphic property** — point addition equals value addition:
```
C(a) + C(b) = C(a + b)
```

This means the contract can compute `new_pending = pending + amount` without knowing either value, by adding EC points using X-Ray. Verified directly in `commitment.rs`'s tests against **genuine on-curve points** (not arbitrary off-curve `(x, y)` pairs) — commutativity, identity, and doubling all happen to hold algebraically for off-curve inputs too, but the homomorphism specifically does not, which is exactly the property that matters most here. An earlier test draft used off-curve dummy points and silently passed every check except this one.

**Hiding**: Without knowing `r`, observing `C` reveals nothing about `B`.
**Binding**: Computationally infeasible to find `B' ≠ B` with a valid opening.

### Groth16 Proofs

Proof system: **Groth16** over **BLS12-381** (CAP-0059, Accepted).
Circuit language: **Circom 2.0**, compiled for the BLS12-381 prime (`circom --prime bls12381`) rather than Circom's BN254 default.
Client-side proving: **snarkjs** (WASM, runs in browser).
On-chain verification: **Soroban verifier ported from `stellar/soroban-examples/groth16_verifier`** (SDF's own official example — Apache-2.0, see `contracts/verifier/LICENSE`/`NOTICE`). Stateless by design: the verification key is a call argument, not contract state, so one deployed verifier instance serves both circuits (transfer, withdraw) — Piilo holds both VKs itself and passes the right one per call.

Trusted setup: use an existing Powers of Tau ceremony sized for BLS12-381 (hermez's BN254-only ceremonies don't apply here — confirm a BLS12-381-compatible ptau source before Phase 1). Run circuit-specific setup (`snarkjs groth16 setup`) during build.

### Performance (measured, not estimated)

Real numbers from `cargo test -p piilo single_deposit_fits_real_mainnet_resource_limits -- --nocapture` and `transfer_real_cost_measurement`, against actual mainnet resource limits (`InvocationResourceLimits::mainnet()`, 100M CPU instructions):

| Operation | CPU instructions used | % of 100M budget |
|---|---|---|
| `deposit` (2 `scalar_mul` + 1 `add`) | 75,184,122 | 75% |
| `transfer` (1 `add` + cross-contract verify, 6 public inputs) | 59,050,277 | 59% |

Both fit, but `deposit` leaves only 25% headroom for everything else a real transaction needs (envelope overhead, signature checks, base fees) — tight, not broken. The dominant cost is surprising: `Bls12381FrFromU256` (37.6M) and `Bls12381FrToU256` (10.9M) — the byte↔Fr *conversion* overhead — dwarf the actual arithmetic (`Bls12381FrMul`: 1.6M, `Bls12381FrInv`: 142K). Future optimization should target round-tripping fewer Fr host objects (e.g. windowed precomputed tables for the fixed G/H generators, avoiding rebuilding constants like `d`/`k` on every call) before reducing arithmetic call count further — not needed for this MVP, since both operations currently fit.

---

## Circuits

### `transfer.circom`

The only complex circuit. Proves a valid balance update without revealing amounts.

```circom
pragma circom 2.0.0;
// Compile for the BLS12-381 prime, not Circom's BN254 default:
// circom transfer.circom --r1cs --wasm --sym --prime bls12381

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

// C = value·G + blinding·H, where G, H, C are JubJub points (see
// Cryptographic Design above). JubJub's coordinates are Fr elements —
// BLS12-381's scalar field, which is also this circuit's native field
// (it's a Groth16-over-BLS12-381 circuit) — so unlike the BN254/G1
// detour this doc went through earlier, this is plain native-field
// arithmetic: two fixed-base scalar mults + one point add, the same
// shape as circomlib's EscalarMulFix/BabyAdd for Baby JubJub, just with
// JubJub's curve parameters (a = -1, d = see Cryptographic Design) and
// compiled for the bls12381 prime. circomlib's babyjub.circom is
// BN254-specific, so this needs JubJub-parameterized gadgets — NOT
// sketched here, since exact gate counts are circuit-phase work, but
// the technique itself is the simple, well-trodden one, not custom
// foreign-field math.
template PedersenCommit(n) {
    signal input value;     // assumed already range-checked by caller
    signal input blinding;
    signal output out[2];  // out[0..1] = resulting JubJub point (x, y)

    // TODO(circuit phase): JubJub-parameterized EscalarMulFix-equivalent
    // (for G and H) + point-add-equivalent, native Fr arithmetic.
}

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

    // 0. Range check B itself, not just A. GreaterEqThan/LessThan in
    // circomlib assume both inputs already fit in n bits — without this,
    // a B near the field modulus makes the comparator's internal
    // n+1-bit decomposition wrap and produce a meaningless result.
    // (Binding makes a forged B computationally infeasible to find, but
    // the comparator's precondition should be enforced explicitly, not
    // left to an inductive argument about how B could have arisen.)
    component bits_B = Num2Bits(n);
    bits_B.in <== B;

    // 1. Verify sender owns this balance
    component com_B = PedersenCommit(n);
    com_B.value <== B;
    com_B.blinding <== r_B;
    C_B[0] === com_B.out[0];
    C_B[1] === com_B.out[1];

    // 2. Verify amount commitment is well-formed
    component com_A = PedersenCommit(n);
    com_A.value <== A;
    com_A.blinding <== r_A;
    C_A[0] === com_A.out[0];
    C_A[1] === com_A.out[1];

    // 3. Range check: B >= A (no overdraft)
    component gte = GreaterEqThan(n);
    gte.in[0] <== B;
    gte.in[1] <== A;
    gte.out === 1;

    // 4. Range check: A >= 0 (constrain to n-bit unsigned)
    component bits_A = Num2Bits(n);
    bits_A.in <== A;

    // 5. Verify new balance commitment is correct
    component com_new = PedersenCommit(n);
    com_new.value <== B - A;
    com_new.blinding <== r_new;
    C_new[0] === com_new.out[0];
    C_new[1] === com_new.out[1];
}

component main {public [C_B, C_A, C_new]} = Transfer(64);
```

### `withdraw.circom`

Proves ownership of a balance before revealing it. Voluntary privacy exit.

```circom
pragma circom 2.0.0;

include "circomlib/circuits/bitify.circom";

// Same PedersenCommit(n) template as transfer.circom (JubJub native
// arithmetic — see above) — share one file.
template Withdraw(n) {
    // Private
    signal input r_B;   // blinding factor

    // Public
    signal input C_B[2]; // on-chain commitment
    signal input B;      // revealed plaintext balance (chain sees this)

    component com = PedersenCommit(n);
    com.value <== B;
    com.blinding <== r_B;
    C_B[0] === com.out[0];
    C_B[1] === com.out[1];
}

component main {public [C_B, B]} = Withdraw(64);
```

### Deposit — no circuit

User sends N XLM to the contract. N is visible on-chain (it's a payment). User provides blinding factor `r`. Contract computes `C = N·G + r·H` on-chain using X-Ray EC operations and stores it. No ZK proof needed — N is already public.

---

## On-Chain Account Struct

```rust
// Soroban storage key: ("account", Address)
pub struct ConfidentialAccount {
    pub owner: Address,
    pub balance_commitment: (u256, u256),   // JubJub point (x, y) — see Cryptographic Design
    pub pending_commitment: (u256, u256),   // accumulated incoming transfers
    pub has_pending: bool,
    pub nonce: u64,                          // incremented on each balance write
}

// Global contract state
pub struct PiiloState {
    pub g: (u256, u256),    // generator G (JubJub)
    pub h: (u256, u256),    // generator H (JubJub)
    pub vault_balance: i128, // total XLM held
    pub verifier: Address,            // the (stateless) Groth16 verifier contract
    pub transfer_vk: VerificationKey, // verification key for transfer.circom
    pub withdraw_vk: VerificationKey, // verification key for withdraw.circom
}
```

One verifier *contract*, not two — Stellar's official `groth16_verifier` example (which Piilo's verifier is ported from) is stateless: the verification key is a call argument, not contract state. A Groth16 VK is still specific to one circuit (transfer and withdraw need different VKs), but since the verifier doesn't store one, that just means Piilo holds both VKs itself and passes the right one per call, rather than deploying two separate verifier instances. An earlier draft of this doc had two `verifier: Address` fields (assuming a stateful, VK-baked-in verifier per circuit) — corrected once the contract was actually wired up to a real, stateless verifier.

---

## Operations

### Deposit
```
1. User sends N XLM via Stellar payment to contract
2. User chooses random r, computes C = N·G + r·H locally
3. User calls deposit(C, r) — contract verifies N·G + r·H == C using X-Ray
4. If first deposit: account.balance_commitment = C
   Else: account.balance_commitment = balance_commitment + C  (EC point add)
   vault_balance += N
5. SDK: local_balance += N, local_r = r (if first deposit)
         local_r = combine(local_r, r)  (additive: r_new = r_old + r_deposit)
```

Deposit amounts are visible on-chain (the XLM payment is public). This is the voluntary entry point — same as a bank deposit being visible. All transfers after deposit are private.

### Transfer
```
1. Alice: locally knows (B, r_B)
2. Alice: chooses A (amount), fresh r_A and r_new
3. Alice: computes C_A = A·G + r_A·H
4. Alice: computes C_new = (B-A)·G + r_new·H
5. Alice: generates Groth16 proof π with public [C_B, C_A, C_new]
6. Alice: encrypts (A, r_A) under Bob's note key → encrypted_note
7. Alice: submits transfer(C_A, C_new, π, recipient=Bob, encrypted_note)
8. Contract: verifies π against public inputs [C_B=alice.balance, C_A, C_new]
9. Contract: alice.balance_commitment = C_new, alice.nonce++
10. Contract: bob.pending_commitment += C_A  (EC point add), bob.has_pending = true
11. Alice SDK: local_balance = B - A, local_r = r_new

── Bob receives (when online) ─────────────────────────────────

12. Bob: sees has_pending = true
13. Bob: decrypts encrypted_note → learns (A, r_A)
14. Bob: calls settle_pending()
15. Contract: balance_commitment += pending_commitment  (EC point add)
              pending_commitment = zero, has_pending = false
              (zero = JubJub identity (0, 1) — twisted Edwards, not (0, 0))
16. Bob SDK: local_balance += A, local_r += r_A  (blinding factors add)
```

### Settle Pending
```
Owner-only. Contract adds pending_commitment to balance_commitment (EC point addition).
No ZK proof needed — homomorphism handles correctness.
```

### Withdraw (voluntary privacy exit)
```
1. User: knows (B, r_B) from local state
2. User: generates Groth16 proof π with public [C_B, B]
3. User: submits withdraw(B, π)
4. Contract: verifies π, checks B <= vault_balance
5. Contract: sends B XLM to user, zeroes balance_commitment, vault_balance -= B
6. User SDK: local_balance = 0

B is visible on-chain. This is intentional — user chose to exit privacy.
```

---

## Local State (SDK-managed)

Each user's SDK instance maintains plaintext state in localStorage:

```typescript
interface LocalState {
  balance: bigint        // plaintext balance B
  r: bigint              // current blinding factor r_B
  pendingNotes: Note[]   // received but not yet settled
}

interface Note {
  from: string           // sender address
  amount: bigint         // A
  r_A: bigint            // blinding factor for pending commitment
}
```

**State updates:**
- After deposit N with blinding r_dep: `balance += N; r = r + r_dep` (if existing) or `r = r_dep` (if first)
- After sending A with r_new: `balance -= A; r = r_new`
- After receiving (from note): add to pendingNotes
- After settle_pending: `balance += sum(notes.amount); r += sum(notes.r_A); pendingNotes = []`

**State recovery:** If local state is lost, user cannot open their commitment without r. Recovery path: contact the relay with a signed message — relay decrypts nothing (it has no private key), but can help the user identify their commitments from on-chain events within the 7-day RPC window. Full recovery requires either keeping local state backed up or using a cloud sync (future).

---

## Encrypted Payment Note

Alice sends Bob the amount and blinding factor he needs to settle, encrypted so only Bob can read it.

**Key derivation:**
```typescript
const noteKey = await deriveNoteKey(wallet)
// wallet.sign("piilo-note-v1") → deterministic keypair
// No extra key storage needed
```

This assumes the wallet can sign an arbitrary message, not just a transaction XDR. Confirm Freighter's installed version supports SEP-53 `signMessage` — if not, fall back to signing a fixed dummy transaction and deriving the note key from that signature instead. Ed25519 signing is deterministic either way, so the derived key is still stable across calls.

**Note format (on-chain, encrypted):**
```
{ amount: bigint, r_A: bigint }  →  encrypt under bob.noteKey.pubkey  →  bytes
```

Bob decrypts on settle: `{ amount, r_A } = decrypt(note, bob.noteKey.privkey)`

---

## Replay Protection

The transfer circuit takes `C_B` (the current on-chain balance) as a public input. After a successful transfer, `alice.balance_commitment = C_new`. A replayed proof would present the old `C_B` — the contract checks `public_C_B == alice.balance_commitment` and rejects if they don't match.

This `C_B` check alone is already sufficient for replay protection — `nonce` is not load-bearing for it. Keep `nonce` only if something else needs a monotonic counter (e.g. an off-chain indexer ordering events within the 7-day RPC retention window); otherwise drop it from `ConfidentialAccount` to avoid implying it does more than it does.

---

## Trust Model

| Property | Piilo |
|---|---|
| Balance confidentiality | ✅ Pedersen hiding |
| Amount confidentiality | ✅ Commitment + ZK proof |
| Sender/receiver identity | ❌ Public (by design — compliance) |
| Balance integrity | ✅ On-chain commitments, user holds blinding factors |
| Relay censorship | ⚠️ Relay can refuse to submit — user can submit directly |
| Withdraw correctness | ✅ ZK proof verified on-chain — no trusted party |
| Key compromise | ✅ No global key — each user holds their own r |
| Cold-start privacy | ✅ Privacy holds from day one — no anonymity set needed |

No global secret key. No worker. Trustless for all operations.

---

## SDK — `@piilo/sdk`

```typescript
import { Piilo } from '@piilo/sdk'

const piilo = new Piilo({
  network: 'testnet' | 'mainnet',
  wallet,              // FreighterAPI or any Stellar WalletAdapter
  relayUrl?: string,   // optional relay for fee abstraction
})

// Deposit XLM into confidential account
await piilo.deposit(xlmAmount: bigint)

// Send privately — generates proof client-side
await piilo.transfer({
  to: string,    // Stellar address
  amount: bigint,
})

// Check for pending incoming transfers and settle
// Returns { received: bigint } | null
await piilo.settleIfPending()

// Reveal balance and withdraw all XLM (voluntary privacy exit)
await piilo.withdraw()

// Current local plaintext balance
piilo.getBalance(): bigint
```

---

## What to Reuse

| Component | Source | Reuse how |
|---|---|---|
| `contracts/verifier/` | `stellar/soroban-examples` (`groth16_verifier`, Apache-2.0 — see `contracts/verifier/LICENSE`/`NOTICE`) | **Done.** SDF's own official Groth16/BLS12-381 verifier, ported directly — same algorithm, same stateless design (VK is a call argument, not contract state). Chosen over a third-party port specifically to stay on Stellar's own reference implementation. |
| Trusted setup tooling | Nethermind SPP (`NethermindEth/stellar-private-payments`), Apache-2.0 | `scripts/ceremony-cli` pattern — still relevant for Phase 1, not yet pulled in |
| Circom build pipeline | Either project | Copy `package.json` scripts for `circom`, `snarkjs` — note Piilo needs `circom --prime bls12381`, not the BN254 default both these projects use |
| Stellar wallet connection | Either project | Frontend patterns for Freighter |

Piilo's own contract (`contracts/piilo`) calls the real verifier via `soroban_sdk::contractimport!` against its compiled WASM — no mock, no hand-defined trait standing in for it. Tests exercise it with genuinely valid Groth16 proofs generated in Rust via mainline `ark-groth16`/`ark-bls12-381` (no Circom/snarkjs needed for *that* — see `contracts/verifier/src/test.rs`, which also includes a golden test against Stellar's own published, externally-generated proof). The trivial test circuit used elsewhere doesn't encode the real transfer/withdraw soundness relation, since transfer.circom/withdraw.circom don't exist yet — what it proves is that Piilo's contract logic correctly forwards proofs and acts on genuine accept/reject outcomes from the real verifier.

Do NOT reuse from Nethermind SPP: the UTXO contracts, Merkle tree logic, nullifier tracking, ASP circuits. Those are for the mixer model — different architecture entirely.

---

## Monorepo Structure

```
piilo/
  circuits/
    transfer.circom
    withdraw.circom
    build/              — compiled R1CS, WASM, zkey (generated)
  contracts/
    piilo/              — main Soroban contract (Rust)
      src/lib.rs        — entrypoints, storage, errors, events
      src/commitment.rs — Pedersen commitments over JubJub (real fr_* host calls)
      src/verifier.rs   — contractimport! against the real verifier.wasm
      src/test.rs       — tests against the real verifier + real Groth16 proofs
                           + real-mainnet-budget measurement tests
    verifier/           — Groth16/BLS12-381 verifier (ported from Stellar's
                           official example, Apache-2.0), stateless (VK is a
                           call argument)
      src/lib.rs        — pairing-check verifier
      src/test.rs       — golden test vs. Stellar's own published proof +
                           real proof generation via ark-groth16 (accept/reject)
      LICENSE, NOTICE   — Apache-2.0 attribution to stellar/soroban-examples
  packages/
    sdk/                — @piilo/sdk
      src/
        Piilo.ts
        state.ts        — local balance / blinding factor
        proof.ts        — snarkjs prover wrapper
        note.ts         — payment note encrypt/decrypt
        stellar.ts      — transaction builders
    frontend/           — React demo
  scripts/
    setup.sh            — trusted setup (ptau + circuit-specific)
  Cargo.toml
  package.json
```

---

## Build Plan

### Phase 1 — Circuits (Day 1)

1. Install Circom 2.0, snarkjs, download circomlib
2. Write `transfer.circom` and `withdraw.circom`
3. Compile: `circom transfer.circom --r1cs --wasm --sym`
4. Trusted setup:
   ```bash
   snarkjs powersoftau new bn128 14 pot14_0.ptau   # or use hermez-11 ptau
   snarkjs groth16 setup transfer.r1cs pot14_final.ptau transfer_0.zkey
   snarkjs zkey export verificationkey transfer_0.zkey transfer_vk.json
   ```
5. Test proof generation and verification locally

**Done when**: `snarkjs groth16 prove` produces a valid proof and `groth16 verify` passes.

### Phase 2 — Soroban Contracts (Day 1–2)

1. ~~`cargo new --lib contracts/piilo`~~ done
2. ~~Implement account struct + storage~~ done
3. ~~Implement `deposit`: accept XLM payment, compute `C = N·G + r·H` using real JubJub Fr arithmetic, store~~ done
4. ~~Implement `transfer`: call verifier contract, update balance and pending commitments~~ done
5. ~~Implement `settle_pending`: EC point addition on-chain~~ done
6. ~~Implement `withdraw`: call verifier contract, release XLM~~ done
7. ~~Port Stellar's official `groth16_verifier` example (adapt to BLS12-381, stateless VK-as-argument design)~~ done — `contracts/verifier`
8. Deploy both (piilo + the one stateless verifier instance) to Stellar testnet — **not done**, blocked on real circuit VKs (Phase 1)

**Done when**: all four instructions work against the real verifier on testnet via CLI. Currently: all four work against the real verifier in unit tests (real pairing-check cryptography, real Groth16 proofs from a placeholder circuit — see Performance above for measured real-mainnet-budget numbers) — testnet deployment needs Phase 1's actual transfer/withdraw circuits and their verification keys first.

### Phase 3 — SDK (Day 2–3)

1. Scaffold `packages/sdk` (TypeScript, no framework deps)
2. `state.ts` — localStorage-backed balance and blinding factor
3. `proof.ts` — load WASM prover, generate transfer and withdraw proofs
4. `note.ts` — derive note keypair from wallet signature, encrypt/decrypt
5. `stellar.ts` — build and submit Soroban transactions
6. `Piilo.ts` — wire together into `deposit`, `transfer`, `settleIfPending`, `withdraw`

**Done when**: full deposit → transfer → settle → withdraw loop works from TypeScript without any direct crypto calls in the test.

### Phase 4 — Frontend (Day 3–4)

1. React + Vite, `@stellar/freighter-api` for wallet
2. Single-page app:
   - Connect Freighter
   - Balance display (local counter)
   - Deposit panel
   - Transfer panel (address + amount)
   - Pending indicator + settle button
   - Withdraw button
3. Show Stellar Testnet Explorer side-by-side: the commitment on-chain vs the plaintext amount the user sees locally. This is the demo moment.

**Done when**: full flow works in browser on testnet.

---

## Key Libraries

| Package | Purpose |
|---|---|
| `circom` + `circomlib` | ZK circuit language + standard primitives (compile with `--prime bls12381`) |
| `snarkjs` | Groth16 prove/verify, WASM export |
| `@stellar/stellar-sdk` | Stellar RPC + transaction building |
| `@stellar/freighter-api` | Freighter wallet connection |
| `stellar/soroban-examples` `groth16_verifier` | Soroban Groth16/BLS12-381 verifier contract (ported, see `contracts/verifier`) |
| `ark-bls12-381`, `ark-groth16`, `ark-relations` (Rust, test-only) | Generating real Groth16 proofs in contract tests without Circom/snarkjs |

---

## Known Limitations (acceptable for MVP)

1. Local state loss = cannot open commitment (recovery needs backup or relay help)
2. Deposit amounts are visible on-chain (entry point privacy)
3. Withdraw reveals final balance (voluntary exit — by design)
4. Trusted setup requires a ceremony before mainnet (need a BLS12-381-compatible ptau — hermez's is BN254-only, confirm a source before Phase 1)
5. Client-side proving adds 2–5s latency (acceptable; snarkjs WASM in browser)
6. Single 2-in/1-out transfer model (no multi-transfer in one proof — future)
7. `deposit` uses 75% of the real mainnet per-invocation CPU budget (measured, see Performance) — fits, but leaves only 25% headroom for transaction envelope overhead. Acceptable for MVP; windowed precomputed tables for the fixed G/H generators would be the optimization before scaling usage.

---

## Running Locally

```bash
# 1. Install dependencies
npm install
cargo build

# 2. Build circuits (first time only — takes a few minutes)
npm run circuits:build   # compiles circom, runs trusted setup, exports WASM

# 3. Deploy contracts to testnet
stellar contract deploy --network testnet

# 4. Start frontend
cd packages/frontend && npm run dev
```

Circuit WASM artifacts are committed to the repo after build. Users do not need Circom installed to run the app.
