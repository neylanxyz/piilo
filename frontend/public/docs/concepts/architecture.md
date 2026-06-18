# Architecture

Piilo combines three cryptographic building blocks: Pedersen commitments on the JubJub curve, Groth16 ZK proofs verified on-chain by a Soroban smart contract, and NaCl box encryption for payment notes.

## System overview

```
User browser                    Stellar / Soroban
────────────────────            ──────────────────────────────
Local state                     Contract storage
  balance: bigint         ←→      balance_commitment: Point
  r: bigint (blinding)            pending_commitment: Point
  pendingNotes: Note[]            note_pubkey: Bytes<32>
                                  pending_notes: Vec<EncNote>

SDK operations
  deposit()      →   Stellar tx: deposit(amount, r, note_pubkey)
  transfer()     →   Stellar tx: transfer(to, C_A, C_new, proof, enc_note)
  settleIfPending() → Stellar tx: settle_pending(user)
  withdraw()     →   Stellar tx: withdraw(amount, proof)
```

## Pedersen commitments

A Pedersen commitment to a value `v` with blinding factor `r` is:

```
C = v·G + r·H
```

where `G` and `H` are independent generators on the JubJub twisted Edwards curve, and `·` denotes scalar multiplication.

**Properties:**
- **Hiding:** `C` reveals nothing about `v` without `r`
- **Binding:** you cannot open the same `C` to two different `(v, r)` pairs
- **Additively homomorphic:** `C(v₁, r₁) + C(v₂, r₂) = C(v₁+v₂, r₁+r₂)`

The homomorphic property is why transfers can accumulate without decryption — the contract adds commitment points, and the user's local state accumulates the corresponding blinding factors.

### JubJub curve

Piilo uses a custom JubJub parameterization defined in `circuits/jubjub.circom`:

```
// Generator G (for value)
G = (
  52011214036797608008763021134739816867182510661071949920602030138765591619595,
  36017543053724001483519641180346241195937746995850157919072206337752529044138
)

// Generator H (for blinding)
H = (
  2641322346204092426446313763048872749581807614122456322352786044536967383341,
  12433362859382302755418372944023213970869823563090304431189761096447391844644
)
```

These generators are chosen with no known discrete log relationship between them (the "nothing up my sleeve" requirement for Pedersen commitments).

## Groth16 ZK proofs

Piilo uses two Circom circuits compiled to Groth16 SNARKs:

### Transfer circuit (`circuits/transfer.circom`)

**Public inputs:** `C_B`, `C_A`, `C_new` (three JubJub points = 6 field elements)

**Private inputs:** `B` (sender's balance), `r_B` (balance blinding), `A` (transfer amount), `r_A` (amount blinding), `r_new` (new balance blinding)

**Constraints proven:**
1. `C_B = B·G + r_B·H` — the sender knows the opening of their balance commitment
2. `C_A = A·G + r_A·H` — the amount commitment is correctly formed
3. `C_new = (B-A)·G + r_new·H` — the new balance commitment is correctly formed
4. `B ≥ A` — sender has sufficient funds (no underflow)

The contract verifies this proof and then:
- Updates the sender's commitment to `C_new`
- Adds `C_A` to the recipient's `pending_commitment`

### Withdraw circuit (`circuits/withdraw.circom`)

**Public inputs:** `C_B`, `B` (the withdrawal amount, which equals the full balance)

**Private inputs:** `r_B` (balance blinding)

**Constraints proven:**
1. `C_B = B·G + r_B·H` — the user knows the opening of their commitment

The contract verifies this proof and releases `B` stroops to the caller's address.

### Proof generation

Proofs are generated client-side using `snarkjs.groth16.fullProve()` with the compiled WASM witness generator and the `.zkey` file from the trusted setup.

Generation takes approximately 2–5 seconds on a modern laptop.

### On-chain verification

The Soroban contract at `contracts/verifier/` implements BLS12-381 pairing-based proof verification in Rust. It verifies Groth16 proofs against the verification key (`*_vk.json`) that was committed at deploy time.

The verification key contains the toxic waste from the trusted setup ceremony. Once destroyed, no false proofs can be constructed.

## Note encryption

When Alice sends to Bob, Bob needs to know:
1. The amount `A` (to update his local balance)
2. The blinding factor `r_A` (to later participate in his own transfers)

This is transmitted via an encrypted **payment note**:

### Key derivation

```typescript
// Sign a domain-separation string with the wallet's Ed25519 key
const { signature } = await wallet.signMessage("piilo-note-v1")
// Hash to 32 bytes
const seed = await crypto.subtle.digest("SHA-256", signature)
// Derive NaCl box keypair
const keypair = nacl.box.keyPair.fromSecretKey(seed)
```

The note keypair is deterministic from the wallet's signing key — no additional key material needs to be stored or backed up.

### Encryption

```typescript
// Encrypt the note for the recipient
const note = nacl.box(
  JSON.stringify({ amount, r_A }),
  nonce,
  recipientPublicKey,   // fetched from contract storage
  senderKeypair.secretKey
)
```

Uses NaCl box: X25519 key exchange + XSalsa20 stream cipher + Poly1305 MAC.

### On-chain storage

The encrypted note is serialized as:

```
[1 byte version][24 bytes nonce][32 bytes sender_pubkey][N bytes ciphertext]
```

and stored in the contract's `pending_notes` queue for the recipient. It is cleared when the recipient calls `settle_pending`.

## State model

### On-chain (public, in Soroban contract storage)

| Field | Type | Description |
|---|---|---|
| `balance_commitment` | `Point` | JubJub point: `C(balance, r)` |
| `pending_commitment` | `Point` | Accumulated incoming transfer commitments |
| `has_pending` | `bool` | Whether any pending transfers exist |
| `nonce` | `u64` | Replay protection for withdraw proofs |
| `note_pubkey` | `Bytes<32>` | Recipient's NaCl public key |
| `pending_notes` | `Vec<EncNote>` | Encrypted payment notes from senders |

### Off-chain (local, in `localStorage`)

| Field | Type | Description |
|---|---|---|
| `balance` | `bigint` | Plaintext balance in stroops |
| `r` | `bigint` | Current blinding factor |
| `pendingNotes` | `Note[]` | Decrypted but unsettled received notes |

**The blinding factor `r` must be kept secret.** It is the only information needed to open the on-chain commitment. If lost, the XLM is locked until recovery via the 7-day RPC event window.

## Deposit flow (detailed)

```
1. User calls piilo.deposit(amount)
2. SDK generates random r ← Fr
3. SDK calls PiiloStellar.deposit(wallet, amount, r, notePubkey)
4. Contract: commitment = amount·G + r·H
           if account exists: balance_commitment += commitment  (homomorphic add)
           else: create account with balance_commitment = commitment
5. SDK: saveState(applyDeposit(state, amount, r))
        new_balance = old_balance + amount
        new_r       = (old_r + r) mod JubJub_H_order
```

## Transfer flow (detailed)

```
1. User calls piilo.transfer({ to, amount })
2. SDK fetches current on-chain C_B for sender
3. SDK generates r_A, r_new ← Fr (fresh random blinding factors)
4. SDK computes C_A = amount·G + r_A·H  (locally, for proof)
                C_new = (balance-amount)·G + r_new·H
5. SDK calls snarkjs.groth16.fullProve({ B, r_B, A, r_A, r_new, C_B, C_A, C_new })
   → Groth16 proof π
6. SDK fetches recipient's note_pubkey from contract
7. SDK encrypts note: NaCl.box({ amount, r_A }, recipientPubkey, senderKeypair)
8. SDK submits: contract.transfer(sender, recipient, C_A, C_new, π, encrypted_note)
9. Contract verifies π
   Updates sender's balance_commitment = C_new
   Adds C_A to recipient's pending_commitment
   Stores encrypted_note in recipient's pending_notes
10. SDK: saveState(applySend(state, amount, r_new))
```

## Settle flow (detailed)

```
1. User calls piilo.settleIfPending()
2. SDK checks contract: has_pending?
3. If yes, SDK calls contract.get_pending_notes(address)
4. SDK decrypts each note: { amount, r_A } = NaCl.open(enc_note, senderPubkey, myKeypair)
5. SDK calls contract.settle_pending(address)
   Contract: balance_commitment += pending_commitment
             pending_commitment = identity
             has_pending = false
             pending_notes = []
6. SDK: update local state
   new_balance += sum(note.amount)
   new_r = (old_r + sum(note.r_A)) mod JubJub_H_order
```
