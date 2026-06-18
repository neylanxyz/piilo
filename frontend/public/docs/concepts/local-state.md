# Local State

Piilo stores your plaintext balance and blinding factor locally — in `localStorage` in the browser. The Soroban contract stores only commitment points. This section explains why, what it means for you, and how to manage it.

## Why local state is necessary

A Pedersen commitment `C = v·G + r·H` is a one-way function. Given only `C` (what's on-chain), you cannot recover `v` (your balance) or `r` (the blinding factor) without already knowing at least one of them.

The contract holds `C` — the commitment. You hold `v` and `r` — the opening. Both are required to:
- Generate a transfer proof (circuit needs `v`, `r_B` as private inputs)
- Generate a withdrawal proof (circuit needs `v`, `r_B`)
- Know your balance (`getBalance()` reads local state, no network call)

## What is stored locally

```typescript
interface LocalState {
  balance:      bigint    // plaintext balance in stroops
  r:            bigint    // current blinding factor (field element)
  pendingNotes: Note[]    // received-but-unsettled transfer notes
}
```

Stored in `localStorage` under the key `piilo:state:<stellar-address>`.

## When local state is updated

| Operation | State change |
|---|---|
| `deposit(amount)` | `balance += amount`, `r = (r + r_dep) mod JubJub_H_order` |
| `transfer({ to, amount })` | `balance -= amount`, `r = r_new` (fresh random) |
| `settleIfPending()` | `balance += sum(notes)`, `r += sum(note.r_A)`, `pendingNotes = []` |
| `withdraw()` | `balance = 0`, `r = 0`, `pendingNotes = []` |
| `importBackup(json)` | Overwritten with backup values (verified against chain first) |

## Blinding factor arithmetic

Blinding factors accumulate mod `JUBJUB_H_ORDER` (the group order of the `H` generator):

```
JUBJUB_H_ORDER = 26217937587563095239723870254092982918823685063489269125461436649568733016796n
```

This is ~4× smaller than the BLS12-381 field order. Reducing mod this value ensures the accumulated blinding factor always fits in 255 bits, which is required by the circuit's `Num2Bits(255)` decomposition.

## Backup and recovery

The local state is not backed up automatically. You must call `exportBackup()` and store the result securely.

```typescript
const json = await piilo.exportBackup()
// {"version":1,"address":"G...","balance":"50000000","r":"1234..."}
```

**Treat this like a seed phrase.** Anyone who obtains your backup can:
- Learn your exact balance
- Compute the blinding factor, open your commitment

`importBackup(json)` verifies the backup opens to the current on-chain commitment before writing. If your balance changed since the backup (e.g., you received a transfer and settled it), the import will fail with a mismatch error. In that case you need a more recent backup.

## Recovery from event window

If you lose your backup, you have a ~7-day window to recover your state from RPC events:

1. All incoming transfer notes are stored on-chain as encrypted blobs
2. Your note keypair is derived deterministically from your wallet's signing key
3. A recovery scan re-fetches all transfer events directed at your address, decrypts the notes, and reconstructs your pending balance

This only recovers transfers received within the RPC event retention window (~7 days / 100,000 ledgers). Balances older than that without a backup are **irrecoverable**.

## Multi-device usage

Local state is per-browser. If you open Piilo in a second browser or on a second device, it starts with an empty state — it will see your on-chain commitment but not know the opening.

**To use Piilo on multiple devices:**
1. Export a backup after every operation on device A
2. Import it on device B before operating

Do not operate from two devices simultaneously. Each device tracks its own blinding factor; running operations concurrently will cause them to diverge from the on-chain state.
