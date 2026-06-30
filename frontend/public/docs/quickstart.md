# Quickstart

This guide walks you from zero to a working confidential transfer on Stellar testnet in under 5 minutes.

## Prerequisites

- Node.js 18+
- A Stellar testnet account with XLM (use [Stellar Laboratory](https://lab.stellar.org) to fund one)
- [Freighter](https://freighter.app) browser extension (or a custom `WalletAdapter`)

## 1. Install

```bash
npm install @neylanxyz/piilo
```

The package ships with TypeScript types. No separate `@types/` install required.

Circuit files (WASM provers and zkeys) are loaded from jsDelivr CDN by default — no setup required.

## 2. Configure and instantiate

```typescript
import { Piilo } from '@neylanxyz/piilo'

// WalletAdapter wraps any Stellar wallet.
// See the Freighter guide for a ready-made adapter.
const wallet = {
  async publicKey() {
    return window.freighter.getPublicKey()
  },
  async signTransaction(xdr, opts) {
    return window.freighter.signTransaction(xdr, opts)
  },
  async signMessage(message) {
    const result = await window.freighter.signMessage(message)
    return { signature: result.signature }
  },
}

const piilo = new Piilo({
  network: 'testnet',
  asset:   'XLM',    // resolves the Piilo contract from the on-chain registry
  wallet,
})
```

## 3. Deposit

The first operation is always a deposit. The amount is in **stroops** (1 XLM = 10,000,000 stroops):

```typescript
// Deposit 5 XLM
await piilo.deposit(50_000_000n)

console.log('Balance:', await piilo.getBalance())
// → 50000000n
```

The deposit transaction is public. After it settles, your balance is tracked locally as a Pedersen commitment; no further operations reveal the amount.

## 4. Transfer privately

```typescript
// Send 2 XLM to another address
await piilo.transfer({
  to:     'GABC…recipient',
  amount: 20_000_000n,
})
```

This will:
1. Generate a Groth16 proof in your browser (~2–5 seconds)
2. Encrypt a payment note for the recipient
3. Submit the transfer transaction

The recipient's on-chain commitment is updated homomorphically — the contract adds the commitment point without learning the amount.

## 5. Settle incoming transfers

Recipients must call `settleIfPending` to merge received notes into their balance:

```typescript
const result = await piilo.settleIfPending()

if (result) {
  console.log('Received:', result.received, 'stroops')
}
```

This decrypts all pending notes and calls `settle_pending` on-chain, which merges the accumulated commitment into the recipient's balance commitment.

## 6. Withdraw

To exit the protocol and receive XLM back to your Stellar account:

```typescript
await piilo.withdraw()
```

This generates a Groth16 proof of balance knowledge, submits it on-chain, and the contract releases the XLM. Your local state is reset to zero.

## 7. Back up your state

Your balance and blinding factor live only in `localStorage`. Back them up after every significant operation:

```typescript
const backup = await piilo.exportBackup()
// Store this string securely — treat it like a private key.
// Anyone with this backup can see your balance.
localStorage.setItem('piilo-backup', backup)
```

To restore on a new device:

```typescript
const json = localStorage.getItem('piilo-backup')
await piilo.importBackup(json)
```

`importBackup` verifies that the restored state opens to the current on-chain commitment before writing anything. It will throw if the backup is corrupted or belongs to a different address.

## Full example

```typescript
import { Piilo } from '@neylanxyz/piilo'

const piilo = new Piilo({ network: 'testnet', asset: 'XLM', wallet })

// Deposit 10 XLM
await piilo.deposit(100_000_000n)

// Send 3 XLM to a friend
await piilo.transfer({ to: 'GABC…', amount: 30_000_000n })

// Check your remaining balance (local, no network call)
const balance = await piilo.getBalance()
console.log(balance) // 70000000n

// Withdraw everything
await piilo.withdraw()
```

## Self-hosting circuit files

By default, circuit files are loaded from jsDelivr CDN. For production deployments where you want full control, pass a `circuitsUrl` pointing to your own server:

```typescript
const piilo = new Piilo({
  network:     'testnet',
  asset:       'XLM',
  wallet,
  circuitsUrl: 'https://your-cdn.example.com/circuits',
})
```

Download `transfer_1.zkey`, `transfer_js/transfer.wasm`, `withdraw_1.zkey`, and `withdraw_js/withdraw.wasm` from the [GitHub releases page](https://github.com/neylanxyz/piilo/releases) and serve them at the path above. The SDK verifies their SHA-256 hashes before use, so swapped files are rejected.

## Next steps

- [Architecture](./concepts/architecture.md) — understand how the ZK proofs and commitments work
- [Privacy Model](./concepts/privacy-model.md) — what is and isn't hidden
- [Freighter Integration](./guides/freighter.md) — production-ready wallet adapter
- [Security Guide](./guides/security.md) — protect your blinding factor
