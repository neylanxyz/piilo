# settleIfPending()

```typescript
async settleIfPending(): Promise<{ received: bigint } | null>
```

Merges incoming transfers into the local balance. Must be called before received funds can be spent or withdrawn.

## What happens

1. Checks the on-chain account: is `has_pending = true`?
2. If no pending transfers, returns `null` immediately
3. Fetches all encrypted notes from `contract.get_pending_notes(address)`
4. Decrypts each note using the user's note keypair
5. Calls `contract.settle_pending(address)` on-chain, which:
   - Adds `pending_commitment` to `balance_commitment`
   - Clears `pending_commitment` and `pending_notes`
   - Sets `has_pending = false`
6. Updates local state:
   - `balance += sum(note.amount)`
   - `r = (r + sum(note.r_A)) mod JubJub_H_order`
   - `pendingNotes = []`
7. Returns `{ received: totalAmount }`

## Returns

- `{ received: bigint }` — total stroops received across all settled notes, if there were pending transfers
- `null` — if no transfers were pending

## Throws

| Error | Cause |
|---|---|
| Stellar RPC error | Transaction failed |
| Note decryption error | Malformed or tampered encrypted note (logged, skipped) |

## Example

```typescript
// Poll for incoming transfers
const result = await piilo.settleIfPending()

if (result === null) {
  console.log('No incoming transfers')
} else {
  console.log(`Received ${result.received / 10_000_000n} XLM`)
  console.log('New balance:', await piilo.getBalance())
}
```

## Polling pattern

For a wallet UI that wants to show incoming transfers in real-time:

```typescript
// Check on page load and every 30 seconds
async function checkForIncoming() {
  const result = await piilo.settleIfPending()
  if (result) {
    showNotification(`Received ${result.received / 10_000_000n} XLM`)
    refreshBalanceDisplay()
  }
}

checkForIncoming()
setInterval(checkForIncoming, 30_000)
```

## Note on atomicity

`settle_pending` is a single Stellar transaction. Either all pending notes are settled together, or none are. There is no partial settlement.

If a note cannot be decrypted (e.g., corrupted data), the SDK logs an error and skips that note. The remaining notes are still settled. This is a best-effort approach — in practice, note corruption should not occur under normal conditions.
