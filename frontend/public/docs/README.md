# Piilo SDK Documentation

Zero-knowledge private payments on Stellar.

## Getting started

- [Introduction](./introduction.md) — what Piilo is and isn't
- [Quickstart](./quickstart.md) — first transfer in 5 minutes

## Concepts

- [Architecture](./concepts/architecture.md) — ZK proofs, Pedersen commitments, note encryption, full flow diagrams
- [Privacy Model](./concepts/privacy-model.md) — what is hidden, what is visible, threat model
- [Local State](./concepts/local-state.md) — why state lives in the browser, backup and recovery

## API Reference

- [Piilo class](./api/piilo-class.md) — constructor, all methods
- [deposit()](./api/deposit.md)
- [transfer()](./api/transfer.md)
- [settleIfPending()](./api/settle.md)
- [withdraw()](./api/withdraw.md)
- [exportBackup() / importBackup()](./api/backup.md)
- [Types](./api/types.md) — all exported TypeScript types

## Guides

- [Freighter Integration](./guides/freighter.md) — production WalletAdapter for Freighter
- [Self-hosting Circuit Files](./guides/self-hosting.md) — serve .wasm and .zkey from your own CDN
- [Security Guide](./guides/security.md) — protect the blinding factor, dependency audit, risk matrix
