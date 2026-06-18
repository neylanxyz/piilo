# deposit()

```typescript
async deposit(amount: bigint): Promise<void>
```

Deposits `amount` stroops into the Piilo contract. This is the entry point into the confidential system.

## What happens

1. A random blinding factor `r` is generated: `r ← Fr` (random field element)
2. The commitment `C = amount·G + r·H` is computed locally
3. A Stellar transaction is submitted calling `deposit(user, amount, r, note_pubkey)` on the contract
4. The contract updates (or creates) the user's `balance_commitment`:
   - **First deposit:** `balance_commitment = C`
   - **Subsequent deposits:** `balance_commitment = old_commitment + C` (homomorphic addition)
5. Local state is updated: `balance += amount`, `r = (old_r + r_dep) mod JubJub_H_order`

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `amount` | `bigint` | Amount to deposit, in stroops. Must be positive. |

## Throws

| Error | Cause |
|---|---|
| `"amount must be positive"` | `amount <= 0n` |
| Stellar RPC error | Insufficient XLM balance, simulation failure, transaction rejection |

## Visibility

The deposit amount is **publicly visible** on the Stellar ledger. This is the only moment in the Piilo lifecycle where an amount is observable on-chain. All subsequent transfers and the final balance are hidden.

## Example

```typescript
// Deposit 10 XLM (in stroops)
await piilo.deposit(100_000_000n)

// Multiple deposits accumulate homomorphically
await piilo.deposit(50_000_000n)

const balance = await piilo.getBalance()
// → 150_000_000n (15 XLM)
```

## Blinding factor accumulation

Each deposit generates a fresh random `r_dep`. The stored blinding factor accumulates:

```
new_r = (old_r + r_dep) mod JUBJUB_H_ORDER
```

This preserves the homomorphic property: the on-chain commitment is always `balance·G + r·H`, where `r` is the accumulated sum of all deposit blinding factors (minus any spent via transfer or withdraw).

## Note public key

On the first deposit, the SDK registers the user's NaCl note public key on-chain. This key allows others to send encrypted payment notes to this address. The note keypair is derived deterministically from `wallet.signMessage("piilo-note-v1")` — no extra key storage is needed.
