import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const circuitsDir = path.resolve(__dirname, "../../circuits/build");

export default defineConfig({
  plugins: [
    react(),
    {
      name: "serve-circuits",
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
    },
  ],
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
