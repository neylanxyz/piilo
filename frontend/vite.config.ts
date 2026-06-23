import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const circuitsDir    = path.resolve(__dirname, '../circuits/build')
const publicCircuits = path.resolve(__dirname, 'public/circuits')

const CIRCUIT_FILES = [
  'transfer_js/transfer.wasm',
  'transfer_1.zkey',
  'withdraw_js/withdraw.wasm',
  'withdraw_1.zkey',
]

function circuitsPlugin() {
  return {
    name: 'circuits',
    // Build: copy circuit files into public/circuits/ so they land in dist/circuits/
    // and are served at /circuits/* for all apps hosted under this domain.
    buildStart() {
      for (const f of CIRCUIT_FILES) {
        const src = path.join(circuitsDir, f)
        const dst = path.join(publicCircuits, f)
        fs.mkdirSync(path.dirname(dst), { recursive: true })
        if (fs.existsSync(src)) fs.copyFileSync(src, dst)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), circuitsPlugin()],
  build: { target: 'esnext' },
})
