# transfer()

```typescript
async transfer(params: {
  to:     string
  amount: bigint
}): Promise<void>
```

Sends `amount` stroops privately to `to`. The amount is never revealed on-chain — only a ZK proof attesting to its validity.

## What happens

1. The current on-chain commitment `C_B` is fetched for the sender
2. Fresh blinding factors `r_A` and `r_new` are generated
3. Commitment points are computed:
   - `C_A = amount·G + r_A·H` — the transfer amount commitment
   - `C_new = (balance - amount)·G + r_new·H` — the sender's new balance commitment
4. A Groth16 proof `π` is generated in the browser:
   - Proves: `C_B`, `C_A`, `C_new` are correctly formed and `balance ≥ amount`
5. The recipient's note public key is fetched from the contract
6. A payment note `{ amount, r_A }` is encrypted for the recipient via NaCl box
7. The transaction `transfer(sender, recipient, C_A, C_new, π, encrypted_note)` is submitted
8. The contract:
   - Verifies `π` on-chain
   - Sets `sender.balance_commitment = C_new`
   - Adds `C_A` to `recipient.pending_commitment`
   - Stores the encrypted note in `recipient.pending_notes`
9. Local state: `balance -= amount`, `r = r_new`

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `to` | `string` | Recipient Stellar address (G-address) |
| `amount` | `bigint` | Amount in stroops. Must be positive and ≤ balance. |

## Throws

| Error | Cause |
|---|---|
| `"amount must be positive"` | `amount <= 0n` |
| `"insufficient balance"` | `amount > local balance` |
| `"no on-chain account — deposit first"` | Sender has no on-chain commitment |
| `"Recipient ... has not deposited yet"` | Recipient's note pubkey is not on-chain |
| snarkjs error | Proof generation failed |
| Stellar RPC error | Transaction rejected (e.g., proof verification failed) |

## Duration

Proof generation takes approximately **2–5 seconds** on a modern laptop and up to 10–15 seconds on a low-end mobile device. The Groth16 proof is computed using WebAssembly in the browser — no server is involved.

## Example

```typescript
// Send 2 XLM to a recipient
await piilo.transfer({
  to:     'GABC123...',
  amount: 20_000_000n,
})

// The recipient must call settleIfPending() to access the funds
```

## What the recipient must do

The recipient does not automatically receive the funds in their local balance. They must call `settleIfPending()` to:
1. Fetch and decrypt the payment note
2. Call `settle_pending` on-chain (merges the pending commitment into their balance commitment)
3. Update their local state

Until `settleIfPending()` is called, the recipient's local `balance` and the on-chain `balance_commitment` do not include the received funds.

## Privacy properties

- **Amount:** hidden. Only the sender and recipient know the amount (via the encrypted note).
- **Recipient address:** visible on-chain.
- **Sender address:** visible on-chain (required for Stellar authorization).
- **Proof:** visible on-chain, but the proof reveals nothing about `amount`, `balance`, or blinding factors.

## Multiple pending transfers

A recipient can have multiple pending transfers from different senders. All pending commitments accumulate homomorphically:

```
pending_commitment += C_A_1 + C_A_2 + ...
```

All pending notes are decrypted and settled together in a single `settleIfPending()` call.
