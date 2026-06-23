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

const EXAMPLES: [string, string][] = [
  ['confidential-wallet',  path.resolve(__dirname, '../examples/confidential-wallet/dist')],
  ['confidential-payroll', path.resolve(__dirname, '../examples/confidential-payroll/dist')],
]

const MIME: Record<string, string> = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript',
  '.mjs':   'application/javascript',
  '.css':   'text/css',
  '.wasm':  'application/wasm',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.svg':   'image/svg+xml',
  '.json':  'application/json',
  '.ico':   'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
  '.ttf':   'font/ttf',
}

function mimeType(filePath: string) {
  return MIME[path.extname(filePath)] ?? 'application/octet-stream'
}

function piiloPlugin() {
  return {
    name: 'piilo',

    configureServer(server: { middlewares: { use: (path: string, fn: (req: any, res: any, next: any) => void) => void } }) {
      // Dev: serve /circuits/* directly from circuits/build/
      server.middlewares.use('/circuits', (req, res, next) => {
        const rel = req.url.replace(/^\//, '')
        const filePath = path.join(circuitsDir, rel)
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', mimeType(filePath))
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })

      // Dev: serve each built example at /examples/{name}/
      // Requires examples to have been built first (npm run build --workspace=examples/...)
      for (const [name, distDir] of EXAMPLES) {
        server.middlewares.use(`/examples/${name}`, (req, res, next) => {
          let rel = req.url.replace(/^\//, '') || 'index.html'
          if (!path.extname(rel)) rel = 'index.html'
          const filePath = path.join(distDir, rel)
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', mimeType(filePath))
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      }
    },

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
  plugins: [react(), piiloPlugin()],
  build: { target: 'esnext' },
})
