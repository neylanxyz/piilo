import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
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
