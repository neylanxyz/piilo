# Freighter Integration

[Freighter](https://freighter.app) is the most widely used browser wallet for Stellar. This guide provides a complete, production-ready `WalletAdapter` for Freighter.

## Install

Freighter exposes a browser global `window.freighter`. For TypeScript type safety, install the API package:

```bash
npm install @stellar/freighter-api
```

## Complete adapter

```typescript
import {
  isConnected,
  getPublicKey,
  signTransaction,
  signMessage,
} from '@stellar/freighter-api'
import type { WalletAdapter, WalletSigner } from '@piilo/sdk'

export async function createFreighterAdapter(): Promise<WalletAdapter & WalletSigner> {
  // Check that Freighter is installed
  const { isConnected: connected } = await isConnected()
  if (!connected) {
    throw new Error('Freighter is not installed. Install it at freighter.app')
  }

  return {
    async publicKey() {
      const { publicKey, error } = await getPublicKey()
      if (error) throw new Error(error)
      return publicKey
    },

    async signTransaction(xdr, opts) {
      const { signedTransaction, error } = await signTransaction(xdr, {
        networkPassphrase: opts?.networkPassphrase,
      })
      if (error) throw new Error(error)
      return signedTransaction
    },

    async signMessage(message) {
      const { signedMessage, error } = await signMessage(message)
      if (error) throw new Error(error)
      // Freighter returns signedMessage as a hex string; convert to Uint8Array
      const hex = signedMessage
      const bytes = new Uint8Array(hex.length / 2)
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
      }
      return { signature: bytes }
    },
  }
}
```

## Usage

```typescript
import { Piilo } from '@piilo/sdk'
import { createFreighterAdapter } from './freighterAdapter'

async function initPiilo() {
  const wallet = await createFreighterAdapter()

  const piilo = new Piilo({
    network:    'testnet',
    contractId: 'C...',
    wallet,
  })

  return piilo
}
```

## Handling the `signMessage` prompt

When `transfer()` or `deposit()` is called for the first time, Piilo calls `wallet.signMessage("piilo-note-v1")` to derive the note encryption keypair. This triggers a Freighter signing prompt.

This prompt is **deterministic** — signing the same domain string always produces the same keypair. It only appears:
- The first time Piilo is used in a session (the keypair is cached in memory)
- If the page is refreshed

To minimize friction, consider calling `piilo.deposit()` only after the user has explicitly initiated an action.

## React hook example

```tsx
import { useState, useCallback } from 'react'
import { Piilo } from '@piilo/sdk'
import { createFreighterAdapter } from './freighterAdapter'

export function usePiilo(contractId: string) {
  const [piilo, setPiilo] = useState<Piilo | null>(null)
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const wallet = await createFreighterAdapter()
      setPiilo(new Piilo({ network: 'testnet', contractId, wallet }))
    } finally {
      setConnecting(false)
    }
  }, [contractId])

  return { piilo, connect, connecting }
}
```

## Network detection

Freighter can be connected to mainnet or testnet. Make sure the network in your `PiiloConfig` matches what Freighter is configured for:

```typescript
import { getNetworkDetails } from '@stellar/freighter-api'

async function detectNetwork(): Promise<'testnet' | 'mainnet'> {
  const { networkPassphrase } = await getNetworkDetails()
  if (networkPassphrase === 'Test SDF Network ; September 2015') return 'testnet'
  if (networkPassphrase === 'Public Global Stellar Network ; September 2015') return 'mainnet'
  throw new Error(`Unknown network: ${networkPassphrase}`)
}
```

## Troubleshooting

**"signMessage is not a function"**
Your version of `@stellar/freighter-api` may be outdated. Update to the latest version:
```bash
npm install @stellar/freighter-api@latest
```

**User sees repeated signing prompts**
The `NoteKeypair` is cached in memory on the `Piilo` instance. Create one `Piilo` instance per session and reuse it. Do not create a new `Piilo` on every operation.

**Transaction rejected: "account not found"**
The user's Stellar account may not be funded. Direct them to the [Stellar Laboratory](https://lab.stellar.org) or a faucet to fund their testnet account.
