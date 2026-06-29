# @neylanxyz/piilo

Confidential payments SDK for Stellar. Hides transfer amounts and balances using Pedersen commitments and Groth16 ZK proofs — while keeping wallet addresses public for compliance.

```
Addresses: public   (AML/KYC — by design)
Amounts:   hidden   (Pedersen commitments + Groth16 ZK proofs)
Balances:  hidden   (Pedersen commitments on-chain)
```

Live on Stellar Testnet — registry: `CCZIRPOS5ERY2KYVNI6SP4SRUGP7NNKWPAKDFBZMPUPERWHS64DCPRTC`

## Install

```bash
npm install @neylanxyz/piilo
```

## Quick start

```typescript
import { Piilo } from '@neylanxyz/piilo'

const piilo = new Piilo({
  network: 'testnet',
  asset:   'XLM',    // or 'USDC' — resolves contract from on-chain registry
  wallet,            // any WalletAdapter + WalletSigner
})

await piilo.deposit(50_000_000n)          // 5 XLM (in stroops)
await piilo.transfer({ to: 'G…', amount: 20_000_000n })
await piilo.settleIfPending()             // receive incoming transfers
await piilo.withdraw()                    // exit privacy, receive XLM back
```

## WalletAdapter

```typescript
// Freighter example
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
```

## API

### `new Piilo(config)`

| Field | Type | Description |
|---|---|---|
| `network` | `'testnet' \| 'mainnet'` | Stellar network |
| `asset` | `string` | Token symbol (`'XLM'`, `'USDC'`). Defaults to `'XLM'`. Resolves contract from on-chain registry. |
| `contractId` | `string` | Explicit contract address override. Bypasses registry. |
| `wallet` | `WalletAdapter & WalletSigner` | Wallet for signing |
| `circuitsUrl` | `string` | Base URL for WASM circuit files. Defaults to `'/circuits'`. |

### Methods

| Method | Description |
|---|---|
| `deposit(amount: bigint)` | Deposit stroops into confidential account. Amount is publicly visible on-chain. |
| `transfer({ to, amount })` | Send privately. Generates Groth16 proof client-side (~2–5s). |
| `settleIfPending()` | Decrypt and settle incoming transfers. Returns `{ received }` or `null`. |
| `withdraw()` | Reveal balance and withdraw all XLM. Voluntary privacy exit. |
| `getBalance()` | Local plaintext balance (no network call). |
| `getAccount(address)` | Fetch on-chain commitment state for any address. |
| `exportBackup()` | Export local state as JSON string. Treat like a private key. |
| `importBackup(json)` | Restore local state. Verifies against on-chain commitment. |

## How it works

Each user has an on-chain account storing a **Pedersen commitment** `C = B·G + r·H` on the JubJub curve (embedded in BLS12-381). The contract manipulates commitments homomorphically — it can add them without learning the underlying values.

Transfers submit a **Groth16 proof** (generated client-side) proving: the sender knows their balance, the amount is non-negative, and the new balance commitment is correctly formed. The verifier contract (ported from Stellar's official `soroban-examples`) checks the proof on-chain.

The blinding factor `r` never leaves the client. If `localStorage` is lost, use `exportBackup` to recover.

## License

Apache-2.0
