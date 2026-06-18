# Self-hosting Circuit Files

The Piilo SDK uses two large WASM + zkey file pairs for proof generation. By default, the SDK resolves them relative to `/circuits/` on your web server. This guide covers production setup.

## Files required

| File | Size (approx) | Purpose |
|---|---|---|
| `transfer_js/transfer.wasm` | ~2 MB | Witness generator for transfer circuit |
| `transfer_1.zkey` | ~10 MB | Proving key for transfer circuit |
| `withdraw_js/withdraw.wasm` | ~1 MB | Witness generator for withdraw circuit |
| `withdraw_1.zkey` | ~6 MB | Proving key for withdraw circuit |

All four files are included in the repository at `circuits/build/`.

## Serving the files

### Vite / React

Copy the files to your `public/` directory:

```bash
cp -r circuits/build/transfer_js public/circuits/transfer_js
cp circuits/build/transfer_1.zkey public/circuits/transfer_1.zkey
cp -r circuits/build/withdraw_js public/circuits/withdraw_js
cp circuits/build/withdraw_1.zkey public/circuits/withdraw_1.zkey
```

Vite serves `public/` at `/` by default. No additional configuration required.

### Next.js

Place the files in `public/circuits/`. Next.js serves `public/` statically.

### Nginx

```nginx
location /circuits/ {
  root /var/www/your-app/public;
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header Access-Control-Allow-Origin "*";
}
```

The files are content-addressed — they never change without a new version. Set long cache TTLs.

### Vercel

The example app in this repository is pre-configured for Vercel via `vercel.json`. The circuit files in `examples/confidential-wallet/public/circuits/` are deployed automatically.

## Custom circuit paths

To serve circuit files from a non-standard location, you can override the path resolution in the SDK source:

In `packages/sdk/src/proof.ts`, the `assetPath` function resolves circuit paths:

```typescript
function assetPath(rel: string): string {
  // Browser: served from /circuits/ at the web root
  if (typeof window !== 'undefined') return `/circuits/${rel}`
  // Node.js: resolve from repo root
  const repoRoot = new URL('../../../', import.meta.url)
  return new URL(`circuits/build/${rel}`, repoRoot).pathname
}
```

Fork the SDK and modify this function if you need a CDN prefix:

```typescript
function assetPath(rel: string): string {
  if (typeof window !== 'undefined') {
    return `https://cdn.example.com/piilo-circuits/${rel}`
  }
  // ...
}
```

## Verifying file integrity

After deploying, verify the circuit files match the published checksums:

```bash
sha256sum \
  public/circuits/transfer_1.zkey \
  public/circuits/withdraw_1.zkey \
  public/circuits/transfer_js/transfer.wasm \
  public/circuits/withdraw_js/withdraw.wasm
```

Compare against the checksums in `circuits/build/CHECKSUMS.sha256` in the repository.

## Performance considerations

The `.zkey` files are loaded into memory once per proof generation call. On a cold load:
- First call: download + load (~10–16 MB total) + proof generation
- Subsequent calls: load from browser cache + proof generation

**Recommendations:**
- Preload the `.zkey` files on application startup (before the user initiates a transfer)
- Use HTTP/2 for parallel download of both zkey files
- Set `Cache-Control: immutable` — the files are versioned and never change
- Consider a Service Worker to cache the files across sessions

## Node.js / server-side usage

The SDK is browser-first, but the proof generation code also runs in Node.js (used in tests). In Node.js mode, `assetPath` resolves circuit files relative to the repository root at `circuits/build/`.

If you use the SDK in a Node.js environment outside the repository, set the `PIILO_CIRCUITS_DIR` environment variable (or modify `assetPath` as described above).
