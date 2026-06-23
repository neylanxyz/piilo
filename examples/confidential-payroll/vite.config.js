import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const circuitsDir    = path.resolve(__dirname, "../../circuits/build");
const publicCircuits = path.resolve(__dirname, "public/circuits");

const CIRCUIT_FILES = [
  "transfer_js/transfer.wasm",
  "transfer_1.zkey",
  "withdraw_js/withdraw.wasm",
  "withdraw_1.zkey",
];

function circuitsPlugin() {
  return {
    name: "circuits",
    configureServer(server) {
      server.middlewares.use("/circuits", (req, res, next) => {
        const rel = req.url.replace(/^\//, "");
        const filePath = path.join(circuitsDir, rel);
        if (fs.existsSync(filePath)) {
          res.setHeader(
            "Content-Type",
            filePath.endsWith(".wasm") ? "application/wasm" : "application/octet-stream"
          );
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
    buildStart() {
      for (const f of CIRCUIT_FILES) {
        const src = path.join(circuitsDir, f);
        const dst = path.join(publicCircuits, f);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        if (fs.existsSync(src)) fs.copyFileSync(src, dst);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), circuitsPlugin()],
  optimizeDeps: {
    exclude: ["snarkjs", "@piilo/sdk"],
  },
  build: {
    target: "esnext",
  },
  server: {
    fs: { allow: ["../.."] },
  },
  resolve: {
    alias: {
      "@piilo/sdk": path.resolve(__dirname, "../../packages/sdk/src/index.ts"),
    },
  },
});
