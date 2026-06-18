# Introduction

Piilo is a zero-knowledge private payments protocol built on Stellar. It lets you deposit XLM, transfer it privately, and withdraw — without any observer on-chain being able to determine your balance or the amount of any individual transfer.

## What Piilo does

When you deposit XLM into the Piilo contract, the amount is recorded publicly **once** — this is unavoidable; the XLM has to move from your account. From that moment on, all subsequent operations are private:

- **Balances** are stored as [Pedersen commitments](./concepts/architecture.md#pedersen-commitments) — elliptic curve points on the JubJub curve. The chain sees a point, not a number.
- **Transfers** produce a [Groth16 ZK proof](./concepts/architecture.md#groth16-proofs) generated entirely in the user's browser. The recipient receives an encrypted note — only their key can open it.
- **Withdrawals** require the user to generate a proof of balance knowledge. The contract verifies the proof and releases XLM. No trusted party sees the plaintext balance.

## What Piilo does NOT do

- **Piilo is not a mixer.** There is no anonymity pool, no unlinkability between depositor and withdrawer. The contract knows which address holds which commitment; it doesn't know the value.
- **Piilo does not hide who you send to.** The recipient address of a transfer is on-chain. Piilo hides the amount, not the counterparty.
- **Piilo does not provide forward secrecy.** If your local state (blinding factor `r`) is compromised, an attacker can compute your balance from the on-chain commitment.

See [Privacy Model](./concepts/privacy-model.md) for the full threat model.

## The SDK

The `@piilo/sdk` package exposes a single class, `Piilo`, with five public methods:

| Method | What it does |
|---|---|
| `deposit(amount)` | Deposit XLM, create a Pedersen commitment |
| `transfer({ to, amount })` | Send privately with a ZK proof + encrypted note |
| `settleIfPending()` | Merge incoming transfers into your balance |
| `withdraw()` | Prove balance knowledge, receive XLM |
| `exportBackup()` / `importBackup(json)` | Back up and restore local state |

## Quick links

- [Quickstart](./quickstart.md) — install, configure, first transfer in 5 minutes
- [Architecture](./concepts/architecture.md) — how the ZK proof and commitment system works
- [API Reference](./api/piilo-class.md) — full method signatures and options
- [Freighter Integration](./guides/freighter.md) — connect to Freighter wallet
- [Security Guide](./guides/security.md) — how to protect the blinding factor
