# withdraw()

```typescript
async withdraw(): Promise<void>
```

Withdraws the full balance. Generates a ZK proof of balance knowledge, submits it on-chain, and receives XLM back to the Stellar account.

## What happens

1. Reads local `balance` and `r` from state
2. Fetches the current on-chain commitment `C_B`
3. Generates a Groth16 withdrawal proof `π`:
   - Proves: `C_B = balance·G + r·H` (knowledge of opening)
4. Submits `contract.withdraw(user, balance, π)` on-chain
5. The contract:
   - Verifies `π`
   - Transfers `balance` stroops to the user's Stellar account
   - Deletes the user's account entry from contract storage
6. Local state is reset: `{ balance: 0n, r: 0n, pendingNotes: [] }`

## Throws

| Error | Cause |
|---|---|
| `"no balance to withdraw"` | `balance === 0n` |
| `"no on-chain account"` | Account entry does not exist on-chain |
| snarkjs error | Proof generation failed |
| Stellar RPC error | Proof verification failed, transaction rejected |

## Example

```typescript
const balance = await piilo.getBalance()
console.log(`Withdrawing ${balance / 10_000_000n} XLM`)

await piilo.withdraw()

console.log('Withdrawal complete. Local balance:', await piilo.getBalance())
// → 0n
```

## Partial withdrawal

The current implementation withdraws the **full balance** only. Partial withdrawals are not supported in this version. To send a partial amount to another Stellar account, use `transfer()` to send privately to yourself and then `withdraw()` from that second account.

## After withdrawal

After a successful withdrawal:
- The contract deletes your account entry (frees Soroban storage)
- Your local state is reset to zero
- You can deposit again to start a new confidential session

## Duration

Proof generation takes approximately 2–5 seconds (same as transfer). The withdrawal proof is slightly faster than the transfer proof because it has fewer constraints.

## Pending transfers

If you have pending incoming transfers (`has_pending = true`), you should call `settleIfPending()` before `withdraw()`. Otherwise you will withdraw only your settled balance, and the pending amounts remain locked in the `pending_commitment` but your account entry is deleted.

The contract does not prevent withdrawing with a non-zero `pending_commitment` — it is the caller's responsibility to settle first.
