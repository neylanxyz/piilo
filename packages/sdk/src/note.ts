// Payment note: encrypts (amount, r_A) for the recipient so only they can
// learn what they received and merge it into their balance.
//
// Key derivation: sign a fixed domain-separation string with the wallet's
// Ed25519 key → deterministic 32-byte seed → NaCl box keypair.
// No extra key storage needed; the wallet's signing key is the root.
//
// Encryption: NaCl secretbox (XSalsa20-Poly1305) with recipient's public key
// derived the same way (sender fetches recipient's note pubkey from on-chain
// events or off-band).

import nacl from "tweetnacl";

const DOMAIN = "piilo-note-v1";

export interface NoteKeypair {
  publicKey: Uint8Array;  // 32 bytes
  secretKey: Uint8Array;  // 64 bytes (NaCl convention: seed || pubkey)
}

export interface WalletSigner {
  // Signs arbitrary bytes; must be the same key across calls (deterministic).
  // Freighter: use signMessage(). If signMessage() isn't available, sign a
  // fixed dummy XDR transaction and hash the resulting signature as the seed.
  signMessage(message: string): Promise<{ signature: Uint8Array }>;
}

export async function deriveNoteKeypair(wallet: WalletSigner): Promise<NoteKeypair> {
  const { signature } = await wallet.signMessage(DOMAIN);
  // Hash to 32 bytes in case the signature is longer (Ed25519 sigs are 64 bytes).
  const seed = await crypto.subtle.digest("SHA-256", signature.buffer as ArrayBuffer);
  return nacl.box.keyPair.fromSecretKey(new Uint8Array(seed));
}

export interface EncryptedNote {
  ciphertext: Uint8Array;   // encrypted payload
  nonce: Uint8Array;        // 24-byte NaCl nonce
  senderPubkey: Uint8Array; // sender's ephemeral or note pubkey (for recipient to open)
}

export function encryptNote(
  amount: bigint,
  r_A: bigint,
  recipientPubkey: Uint8Array,
  senderKeypair: NoteKeypair
): EncryptedNote {
  const payload = JSON.stringify({
    amount: amount.toString(),
    r_A: r_A.toString(),
  });
  const message = new TextEncoder().encode(payload);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const ciphertext = nacl.box(message, nonce, recipientPubkey, senderKeypair.secretKey);
  return { ciphertext, nonce, senderPubkey: senderKeypair.publicKey };
}

export function decryptNote(
  note: EncryptedNote,
  recipientKeypair: NoteKeypair
): { amount: bigint; r_A: bigint } | null {
  const plaintext = nacl.box.open(
    note.ciphertext,
    note.nonce,
    note.senderPubkey,
    recipientKeypair.secretKey
  );
  if (!plaintext) return null;
  const { amount, r_A } = JSON.parse(new TextDecoder().decode(plaintext));
  return { amount: BigInt(amount), r_A: BigInt(r_A) };
}

// Serialize/deserialize EncryptedNote to/from bytes for on-chain storage.
// Format: [1 byte version][24 bytes nonce][32 bytes senderPubkey][rest: ciphertext]
export function encodeNote(note: EncryptedNote): Uint8Array {
  const buf = new Uint8Array(1 + 24 + 32 + note.ciphertext.length);
  buf[0] = 1; // version
  buf.set(note.nonce, 1);
  buf.set(note.senderPubkey, 25);
  buf.set(note.ciphertext, 57);
  return buf;
}

export function decodeNote(bytes: Uint8Array): EncryptedNote {
  if (bytes[0] !== 1) throw new Error("unsupported note version");
  return {
    nonce: bytes.slice(1, 25),
    senderPubkey: bytes.slice(25, 57),
    ciphertext: bytes.slice(57),
  };
}
