# Privacy Model

Piilo provides **amount privacy** for transfers on Stellar. This document defines exactly what is hidden, what is visible, and the threat model.

## What is hidden

| Information | Hidden from whom |
|---|---|
| Your current balance | Everyone except you |
| Transfer amounts | Everyone except sender and recipient |
| Your blinding factor `r` | Everyone except you |

## What is visible

| Information | Visible to |
|---|---|
| That you deposited XLM | Public (Stellar network) |
| The deposit amount | Public (initial deposit only) |
| Who you send to | Public (recipient address) |
| That a transfer occurred | Public (transfer tx, but not the amount) |
| That you withdrew XLM | Public |
| The withdrawal amount | Public |

**The deposit and withdrawal amounts are public.** If you deposit 5 XLM and later withdraw 3 XLM, an observer knows you sent at least 2 XLM in private transfers — but not to whom, and not in how many separate payments.

## Threat model

### Honest-but-curious chain observer

An observer watching the Stellar ledger sees:
- Your account address
- The smart contract address you interacted with
- The block explorers showing "transfer" events with no amounts
- The on-chain commitment point (an opaque elliptic curve point)

They **cannot** determine your balance, the amount of any private transfer, or the amounts you sent to specific recipients.

### Recipient collusion

If a recipient colludes with an observer, they can reveal the amount they received. They cannot reveal your balance or other transfers.

### Contract operator

Piilo's Soroban contract has no admin key, no upgradeability after deployment, and no backdoor. The contract operator has no special access to user data.

### Lost local state

If `localStorage` is cleared (or you switch devices without a backup), you lose your local `balance` and blinding factor `r`. The XLM is still in the contract — you cannot withdraw it without `r`.

Recovery options:
1. **Backup file** (recommended): see [exportBackup](../api/backup.md)
2. **RPC event window**: within ~7 days of your last deposit, the RPC node retains events that contain your encrypted notes. A recovery tool could re-derive your state from events using your wallet signing key.

There is no recovery beyond these two options. The blinding factor is not reconstructible from the blockchain alone.

### Compromised browser / device

If an attacker has access to your `localStorage` they can read your balance and blinding factor. Piilo does not defend against a compromised execution environment.

### ZK proof soundness

The security of Piilo's amount-hiding relies on the soundness of the Groth16 proof system. A soundness break would allow a malicious user to forge proofs and withdraw more XLM than they deposited. The proof system is considered secure under the knowledge-of-exponent assumption.

The trusted setup for the Groth16 circuits (`transfer_1.zkey`, `withdraw_1.zkey`) was generated using `snarkjs` phase 2 ceremony. The security of the ceremony relies on at least one participant having destroyed their toxic waste. See the ceremony details in the repository.

## Summary

Piilo is not a full privacy protocol. It is best described as:

> **Confidential transfers on Stellar** — the amounts of individual transfers and current balances are hidden, but the graph of who sends to whom is not.

If you need sender/recipient anonymity in addition to amount privacy, Piilo alone is not sufficient.
