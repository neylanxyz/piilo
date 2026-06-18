# Security Guide

## The blinding factor is your private key

The most critical piece of information in Piilo is the blinding factor `r`. It is the only thing needed to:
- Open your on-chain commitment (reveal your balance)
- Participate in future transfers (generate valid proofs)

If `r` is lost → **your XLM is locked** (until recovery via event window)  
If `r` is stolen → **your balance is exposed** (but XLM remains safe — only you can sign transactions)

**Treat `localStorage` backups like seed phrases.**

## Risks by category

### Loss of local state

**Risk:** `localStorage` is cleared (browser reset, incognito session, OS reinstall)  
**Impact:** Cannot generate proofs → cannot withdraw or transfer  
**Mitigation:**
- Call `exportBackup()` after every deposit, transfer, and settle
- Store the backup encrypted, off-device (password manager, encrypted file storage)

### Stolen backup

**Risk:** Backup JSON is read by an attacker  
**Impact:** Attacker learns your plaintext balance and blinding factor  
**Mitigation:**
- Encrypt the backup before storing it:
  ```typescript
  const backup = await piilo.exportBackup()
  const encrypted = await encryptWithPassword(backup, userPassword)
  ```
- Never log or transmit the raw backup JSON

### Compromised browser extension

**Risk:** A malicious browser extension reads `localStorage`  
**Impact:** Attacker learns `r` and balance  
**Mitigation:** Use a browser profile dedicated to financial applications; audit installed extensions

### Man-in-the-middle on circuit files

**Risk:** `.zkey` or `.wasm` files are served from a compromised CDN  
**Impact:** Maliciously modified circuits could generate false proofs; a compromised `.zkey` could allow proof forgery  
**Mitigation:**
- Self-host circuit files; see [Self-hosting](./self-hosting.md)
- Verify file hashes against the repository's published checksums
- Use HTTPS with certificate pinning for circuit file delivery

### Stale backup leading to locked funds

**Risk:** You restore a backup from before your last `settleIfPending()`, then the restored `r` doesn't match the on-chain commitment (because settled notes shifted `r`)  
**Impact:** `importBackup()` throws; you need an even older backup or event-window recovery  
**Mitigation:** Export immediately after every operation, replace old backups

### Concurrent sessions on multiple devices

**Risk:** Two devices operate simultaneously; each generates a fresh `r_new` for the same commitment  
**Impact:** Only one device's state will be valid; the other will be permanently desynchronized  
**Mitigation:** Never operate from two devices at the same time; always import an up-to-date backup before using a second device

## Recommended backup workflow

```typescript
async function safeDeposit(piilo: Piilo, amount: bigint, saveBackup: (json: string) => Promise<void>) {
  await piilo.deposit(amount)
  const backup = await piilo.exportBackup()
  await saveBackup(backup)   // persist to secure storage
}

async function safeTransfer(piilo: Piilo, to: string, amount: bigint, saveBackup: (json: string) => Promise<void>) {
  await piilo.transfer({ to, amount })
  const backup = await piilo.exportBackup()
  await saveBackup(backup)
}

async function safeSettle(piilo: Piilo, saveBackup: (json: string) => Promise<void>) {
  const result = await piilo.settleIfPending()
  if (result) {
    const backup = await piilo.exportBackup()
    await saveBackup(backup)
  }
  return result
}
```

## Note encryption security

Payment notes are encrypted with NaCl box (X25519 + XSalsa20-Poly1305). The note keypair is derived from the wallet's signing key — this means:
- If your wallet's private key is compromised, an attacker can derive your note keypair
- With the note keypair, an attacker can decrypt all your payment notes (reveal amounts received)
- They cannot forge transactions — the Stellar signing key is required for that

## ZK proof security assumptions

Piilo's privacy relies on:
1. **Pedersen commitment hiding:** the discrete log problem on JubJub must be hard
2. **Groth16 soundness:** the knowledge-of-exponent assumption must hold for BLS12-381
3. **Trusted setup integrity:** at least one participant in the `.zkey` ceremony must have destroyed their toxic waste

None of these have known breaks. However, quantum computers capable of solving discrete logarithm would break Pedersen commitment hiding and Groth16. Stellar's Protocol 27 preparation for quantum resistance does not currently cover the Piilo ZK layer.

## Dependency audit

Before deploying in production, audit:

| Dependency | What it does | Risk |
|---|---|---|
| `snarkjs` | Proof generation | Malicious version could generate weak proofs |
| `tweetnacl` | Note encryption | Malicious version could expose note keys |
| `@stellar/stellar-sdk` | Transaction building | Malicious version could modify transaction content |

Pin dependency versions in `package-lock.json` and review updates before applying them.
