# exportBackup() / importBackup()

## exportBackup()

```typescript
async exportBackup(): Promise<string>
```

Exports the current local state as a JSON string.

```typescript
const json = await piilo.exportBackup()
// → '{"version":1,"address":"G...","balance":"50000000","r":"4291873..."}'
```

### Backup format

```typescript
{
  version: 1
  address: string   // Stellar address this backup belongs to
  balance: string   // balance in stroops (bigint serialized as string)
  r:       string   // blinding factor (bigint serialized as string)
}
```

> **Security warning:** The backup contains your plaintext balance and blinding factor. Store it as securely as a private key. Anyone who obtains your backup can determine your balance. The SDK does not encrypt the backup — do so yourself if needed (e.g., encrypt with the user's password before storing).

### When to export

Export after every state-changing operation:
- After `deposit()`
- After `transfer()`
- After `settleIfPending()` (if it returned non-null)

The `pendingNotes` array is intentionally excluded from the backup — it is reconstructed from on-chain event data during recovery.

---

## importBackup()

```typescript
async importBackup(json: string): Promise<{ balance: bigint }>
```

Restores local state from a backup string. Verifies the backup matches the current on-chain commitment before writing.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `json` | `string` | A JSON string previously produced by `exportBackup()` |

### Returns

`{ balance: bigint }` — the restored balance in stroops.

### Throws

| Error | Cause |
|---|---|
| `"Unknown backup version N"` | Unsupported backup format |
| `"Backup belongs to ..., connected wallet is ..."` | Address mismatch |
| `"No on-chain account — deposit first, then restore"` | No commitment on-chain for verification |
| `"Backup does not match on-chain commitment"` | Balance or `r` in the backup differ from what opens the current commitment |

### Verification

Before writing anything, `importBackup` computes the commitment locally:

```typescript
const [cx, cy] = await localCommit(balance, r)
```

and compares it against the on-chain `balance_commitment`. If they differ, the backup is rejected. This prevents accidentally overwriting a valid local state with a stale backup.

### When to use

- Switching devices: export on device A, import on device B
- After clearing browser storage (cookies, localStorage)
- Restoring from disaster recovery

### Example

```typescript
// Export (do this after every operation)
const backup = await piilo.exportBackup()
await secureStorage.save('piilo-backup', backup)

// Import on a new device
const json = await secureStorage.load('piilo-backup')
const { balance } = await piilo.importBackup(json)
console.log(`Restored balance: ${balance / 10_000_000n} XLM`)
```

### Stale backups

If you made operations after exporting the backup, the backup will not match the current on-chain commitment and import will fail. You need the most recent backup.

If you have no recent backup and no recovery path, see [Local State — Recovery from event window](../concepts/local-state.md#recovery-from-event-window).
