# Types

All public types exported from `@piilo/sdk`.

## PiiloConfig

```typescript
interface PiiloConfig {
  network:     Network
  contractId:  string
  wallet:      WalletAdapter & WalletSigner
  relayUrl?:   string
}
```

See [Piilo class](./piilo-class.md) for field descriptions.

---

## Network

```typescript
type Network = 'testnet' | 'mainnet'
```

---

## WalletAdapter

```typescript
interface WalletAdapter {
  publicKey():    Promise<string>
  signTransaction(xdr: string, opts?: { networkPassphrase?: string }): Promise<string>
}
```

---

## WalletSigner

```typescript
interface WalletSigner {
  signMessage(message: string): Promise<{ signature: Uint8Array }>
}
```

---

## NoteKeypair

```typescript
interface NoteKeypair {
  publicKey: Uint8Array   // 32 bytes, X25519 public key
  secretKey: Uint8Array   // 64 bytes (NaCl convention: seed || pubkey)
}
```

Derived deterministically from the wallet's signing key via `deriveNoteKeypair()`. Not typically used directly.

---

## EncryptedNote

```typescript
interface EncryptedNote {
  ciphertext:   Uint8Array   // NaCl box ciphertext
  nonce:        Uint8Array   // 24 bytes
  senderPubkey: Uint8Array   // 32 bytes, sender's NaCl public key
}
```

---

## Note

```typescript
interface Note {
  from:   string   // sender's Stellar address
  amount: bigint   // transfer amount in stroops
  r_A:    bigint   // blinding factor for the amount commitment
}
```

Decrypted payment note. Stored in `LocalState.pendingNotes` until settled.

---

## LocalState

```typescript
interface LocalState {
  balance:      bigint
  r:            bigint
  pendingNotes: Note[]
}
```

Stored in `localStorage` under `piilo:state:<address>`.

---

## JubJubPoint

```typescript
type JubJubPoint = [string, string]  // [x, y] as decimal strings
```

A point on the JubJub twisted Edwards curve. Coordinates are field elements represented as decimal strings (bigint serialization).

---

## GrothProof

```typescript
interface GrothProof {
  pi_a: [string, string]
  pi_b: [[string, string], [string, string]]
  pi_c: [string, string]
}
```

A Groth16 proof in snarkjs format, serialized for submission to the Soroban contract.

---

## TransferInput

```typescript
interface TransferInput {
  B:     bigint         // sender's plaintext balance
  r_B:   bigint         // sender's balance blinding factor
  A:     bigint         // transfer amount
  r_A:   bigint         // amount blinding factor
  r_new: bigint         // new balance blinding factor
  C_B:   JubJubPoint   // current on-chain balance commitment
  C_A:   JubJubPoint   // amount commitment
  C_new: JubJubPoint   // new sender balance commitment
}
```

Input to `proveTransfer()`. Not typically used directly; the `Piilo` class handles this internally.

---

## WithdrawInput

```typescript
interface WithdrawInput {
  r_B: bigint
  C_B: JubJubPoint
  B:   bigint
}
```

Input to `proveWithdraw()`. Not typically used directly.
