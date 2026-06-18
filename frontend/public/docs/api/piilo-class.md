# Piilo class

The main entry point of the SDK. Coordinates local state, proof generation, note encryption, and Stellar transaction submission.

## Import

```typescript
import { Piilo } from '@piilo/sdk'
import type { PiiloConfig, WalletAdapter, Network } from '@piilo/sdk'
```

## Constructor

```typescript
new Piilo(config: PiiloConfig)
```

### PiiloConfig

```typescript
interface PiiloConfig {
  /** "testnet" or "mainnet" */
  network: Network

  /** Deployed Piilo contract address (starts with "C") */
  contractId: string

  /** Wallet adapter that provides signing capabilities */
  wallet: WalletAdapter & WalletSigner

  /**
   * Optional relay URL for fee sponsorship.
   * If provided, the relay sponsors transaction fees.
   * The relay cannot access funds — it only covers fees.
   */
  relayUrl?: string
}
```

### WalletAdapter

```typescript
interface WalletAdapter {
  /** Returns the Stellar public key (G-address) of the connected account */
  publicKey(): Promise<string>

  /**
   * Signs a Stellar transaction XDR.
   * @param xdr   Base64-encoded transaction XDR
   * @param opts  Optional signing options
   * @returns     Base64-encoded signed transaction XDR
   */
  signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string }
  ): Promise<string>
}
```

### WalletSigner

```typescript
interface WalletSigner {
  /**
   * Signs an arbitrary message string.
   * Used to derive the note encryption keypair.
   * Must be deterministic — same message must always produce the same signature.
   *
   * For Freighter: use `signMessage()`.
   */
  signMessage(message: string): Promise<{ signature: Uint8Array }>
}
```

### Network

```typescript
type Network = 'testnet' | 'mainnet'
```

## Methods

### getBalance()

```typescript
async getBalance(): Promise<bigint>
```

Returns the current local plaintext balance in stroops. Does **not** make a network call — reads from `localStorage`.

```typescript
const balance = await piilo.getBalance()
console.log(`${balance / 10_000_000n} XLM`)
```

---

### deposit()

```typescript
async deposit(amount: bigint): Promise<void>
```

Deposits `amount` stroops into the confidential account. Generates a random blinding factor, computes the commitment, and submits the deposit transaction.

The deposit amount is **publicly visible** on-chain. This is unavoidable for the initial entry into the protocol.

**Parameters:**
- `amount` — amount in stroops (1 XLM = 10,000,000n stroops). Must be positive.

**Throws:**
- If `amount <= 0n`
- If the Stellar transaction fails (insufficient balance, etc.)

See [deposit](./deposit.md) for full details.

---

### transfer()

```typescript
async transfer(params: { to: string; amount: bigint }): Promise<void>
```

Sends `amount` privately to `to`. Generates a Groth16 proof, encrypts the payment note for the recipient, and submits the transfer transaction.

**Parameters:**
- `to` — recipient's Stellar address (G-address). Must have called `deposit()` at least once (their note public key must be on-chain).
- `amount` — amount in stroops. Must be positive and ≤ current balance.

**Throws:**
- If `amount <= 0n`
- If `amount > balance`
- If recipient has no on-chain account (never deposited)
- If proof generation fails

**Duration:** 2–5 seconds (proof generation) + transaction submission time.

See [transfer](./transfer.md) for full details.

---

### settleIfPending()

```typescript
async settleIfPending(): Promise<{ received: bigint } | null>
```

Checks for pending incoming transfers. If found, decrypts the payment notes, calls `settle_pending` on-chain, and updates local state.

Returns `{ received: bigint }` (total stroops received) if there were pending transfers, or `null` if nothing was pending.

```typescript
const result = await piilo.settleIfPending()
if (result) {
  console.log('Received:', result.received)
}
```

Must be called before funds from incoming transfers are accessible for transfer or withdrawal.

See [settleIfPending](./settle.md) for full details.

---

### withdraw()

```typescript
async withdraw(): Promise<void>
```

Withdraws the full balance. Generates a Groth16 proof of balance knowledge, submits the withdrawal transaction, and resets local state to zero.

**Throws:**
- If balance is 0
- If there is no on-chain account (never deposited)

After a successful withdrawal, the local state is cleared (`balance = 0n`, `r = 0n`).

See [withdraw](./withdraw.md) for full details.

---

### exportBackup()

```typescript
async exportBackup(): Promise<string>
```

Returns a JSON string containing the current local state. Store this securely — it is the only way to recover your balance if `localStorage` is lost.

```typescript
const backup = await piilo.exportBackup()
// '{"version":1,"address":"G...","balance":"50000000","r":"4291..."}'
```

**Warning:** The backup contains your plaintext balance and blinding factor. Treat it like a private key.

---

### importBackup()

```typescript
async importBackup(json: string): Promise<{ balance: bigint }>
```

Restores local state from a backup JSON string. Verifies that the restored `(balance, r)` pair opens to the current on-chain commitment before writing.

**Throws:**
- If the JSON is malformed or has an unknown version
- If the backup belongs to a different address
- If the backup does not match the on-chain commitment (balance changed since backup was taken)
- If there is no on-chain account

Returns `{ balance }` — the restored balance in stroops.

See [backup](./backup.md) for full details.
