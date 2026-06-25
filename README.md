# Piilo — Confidential Payments on Stellar

> Finnish for *hiding place.*

Piilo is a privacy protocol for Stellar that hides transfer **amounts** and **balances** while keeping wallet **addresses** public — the right model for institutional compliance.

```
Addresses: public   (AML/KYC — by design)
Amounts:   hidden   (Pedersen commitments + Groth16 ZK proofs)
Balances:  hidden   (Pedersen commitments on-chain)
```

Live on Stellar Testnet:
- **Registry** — `CCZIRPOS5ERY2KYVNI6SP4SRUGP7NNKWPAKDFBZMPUPERWHS64DCPRTC`
- **XLM** — `CBWSNSCQAHVH53MMQBYV5M5EEYMFZVKBDHF2ZPP6NKYFDLA66ZLPTQIB`
- **USDC** — `CDYO7CD5DJ3YVB4GOZ5BYPFOM7TMGUALP6AYMSYSAYWOS6WWIZL6NBKW`

---

## Why Piilo

Most Stellar privacy proposals use a UTXO shielded pool — a mixer. Institutions can't use mixers.

Piilo uses an **account model**: each user has one account with one encrypted balance. You always know *who* sent to whom. You never know *how much*. This is what "private by default, transparent by permission" means for a bank.

| Property | Mixer (UTXO) | Piilo (account) |
|---|---|---|
| Hides sender/receiver | ✅ | ❌ (by design) |
| Hides amounts | ✅ | ✅ |
| Works from day one (no anonymity set) | ❌ | ✅ |
| No indexer / event history needed | ❌ | ✅ |
| Compliant for institutions | ❌ | ✅ |

**No indexer needed.** Stellar RPC retains events for only 7 days. UTXO models that reconstruct Merkle trees from events hit this wall in production. Piilo stores balance commitments directly on each account — state is always queryable on-chain.

**Groth16 is already on Stellar.** Protocol 25 added BLS12-381 host functions to Soroban (CAP-0059). SDF ships and maintains a reference Groth16 verifier for this curve. Piilo's verifier contract is ported directly from that official example.

**Multi-token.** One contract instance per token (XLM, USDC, …). Same WASM, different constructor args. Independent fee rates per token.

**Compliance hook built in.** Every transfer encrypts the amount under a registered auditor public key (JubJub ECDH). The auditor can decrypt amounts without touching private keys or halting the protocol.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│            confidential-wallet (React)            │
│  Freighter · Deposit · Transfer · Withdraw        │
│  Auditor console (decrypt amounts with k_aud)    │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│              @neylanxyz/piilo (TypeScript)              │
│  deposit · transfer · settleIfPending · withdraw  │
│  Client-side Groth16 proving (snarkjs WASM)      │
│  Local state: plaintext balance + blinding factor │
│  Payment note encrypt / decrypt (ChaCha20-Poly)  │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│           Soroban Contracts (Stellar)             │
│  piilo     — account state, vault, fee logic      │
│  verifier  — Groth16/BLS12-381 (from Stellar)    │
│  JubJub point addition via BLS12-381 fr_* calls  │
└──────────────────────────────────────────────────┘
```

No worker process. No relay required for core operations. Everything is either client-side (proof generation) or on-chain (verification, commitment arithmetic).

---

## Cryptography

**Commitments** — `C = B·G + r·H` on the JubJub curve (BLS12-381 embedded). The contract adds commitments homomorphically using X-Ray `fr_*` host functions — no trusted party needed to update balances.

**Proofs** — Groth16 over BLS12-381, compiled with `circom --prime bls12381`. The `transfer` circuit proves: sender knows their balance, the amount is non-negative, and the new balance commitment is correctly formed — without revealing any of those values.

**Auditor ECDH** — each transfer encrypts the amount as `A_enc = A + (r_e · K_aud).x` where `K_aud` is the auditor's registered public key. The auditor recovers `A` from `k_aud · R_e`. Nobody else can.

**Performance (real mainnet budget, 100M instructions):**

| Operation | CPU instructions | % of budget |
|---|---|---|
| `deposit` | 75,184,122 | 75% |
| `transfer` | 59,050,277 | 59% |

---

## Protocol Fees

| Operation | Fee |
|---|---|
| Deposit | 0.1% of deposited amount |
| Transfer | 0.1 XLM flat (from public wallet) |
| Withdraw | 0.3% of withdrawn amount |

Fees are collected in the deposited token (XLM fee on XLM deposits, USDC fee on USDC deposits) and sent to the treasury address set at deployment.

---

## Repo Structure

```
piilo/
  circuits/
    transfer.circom       — balance-update proof
    withdraw.circom       — balance-reveal proof
    build/                — compiled R1CS, WASM, zkey (committed)
  contracts/
    piilo/                — main Soroban contract
    verifier/             — Groth16/BLS12-381 verifier (ported from stellar/soroban-examples)
    registry/             — on-chain token → Piilo contract address registry
  packages/
    sdk/                  — @neylanxyz/piilo (TypeScript)
  examples/
    confidential-wallet/  — single-user wallet demo
    confidential-payroll/ — multi-recipient private payroll demo
  scripts/
    deploy.mjs            — deploy any token to testnet/mainnet
```

---

## Running Locally

```bash
# Install dependencies
npm install
cargo build

# Confidential wallet
cd examples/confidential-wallet && npm run dev

# Confidential payroll
cd examples/confidential-payroll && npm run dev
```

Open `http://localhost:5173`, connect Freighter (set to Testnet), and deposit XLM or USDC.

Circuit WASM and zkey files are committed to the repo — no Circom installation needed to run the demos.

---

## Deploying to Vercel

The wallet demo deploys with zero config:

```bash
vercel --cwd examples/confidential-wallet
```

Or connect the repo to Vercel — `vercel.json` at the root builds the full frontend site (including both examples) via `scripts/build-site.sh`. Circuit files (~20 MB total) are copied into the build output automatically.

To deploy your own contract instance first:

```bash
# XLM
node scripts/deploy.mjs

# Any SAC token (e.g. USDC)
node scripts/deploy.mjs --symbol USDC --token-address CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
```

Requires a `worker` identity configured in the Stellar CLI (`stellar keys generate --global worker --network testnet --fund`).

---

## SDK

```typescript
import { Piilo } from '@neylanxyz/piilo'

const piilo = new Piilo({
  network: 'testnet',
  asset: 'XLM',    // or 'USDC'
  wallet,          // FreighterAPI or any WalletAdapter
})

await piilo.deposit(10_000_000n)             // 1 XLM
await piilo.transfer({ to: 'G…', amount: 5_000_000n })
await piilo.settleIfPending()                // receive incoming transfers
await piilo.withdraw()                       // exit privacy, receive XLM
```

---

## What's Reused

| Component | Source | Status |
|---|---|---|
| `contracts/verifier/` | `stellar/soroban-examples` (Apache-2.0) | Ported — SDF's official Groth16/BLS12-381 verifier |
| Circom 2.0 + circomlib | Iden3 (MIT) | Circuits compiled with `--prime bls12381` |
| snarkjs | Iden3 (MIT) | Client-side proving in browser |
| `@stellar/stellar-sdk` | SDF (Apache-2.0) | Stellar RPC + transaction building |

---

## License

Apache-2.0 — see [LICENSE](LICENSE).

`contracts/verifier/` is ported from [`stellar/soroban-examples`](https://github.com/stellar/soroban-examples) and carries its own Apache-2.0 attribution in `contracts/verifier/LICENSE` and `contracts/verifier/NOTICE`.
