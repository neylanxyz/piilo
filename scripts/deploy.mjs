#!/usr/bin/env node
/**
 * Deploy Piilo to Stellar testnet.
 *
 * Steps:
 *   1. Build both contracts (stellar contract build)
 *   2. Deploy verifier (no constructor) via stellar CLI
 *   3. Resolve XLM native-token SAC
 *   4. Upload piilo WASM via CLI, then deploy via CreateContractArgsV2 with constructor
 *   5. Write VITE_CONTRACT_ID to packages/frontend/.env
 *
 * Usage: node scripts/deploy.mjs
 * Requires: `worker` identity configured in stellar CLI.
 */

import { execSync }             from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath }        from "url";
import path                     from "path";
import crypto                   from "crypto";

// stellar-sdk lives in packages/sdk/node_modules — no root-level install needed.
// v16 changed the layout: lib/index.js → lib/esm/index.js
const SDK_PATH = new URL("../packages/sdk/node_modules/@stellar/stellar-sdk/lib/esm/index.js", import.meta.url).pathname;
const { Keypair, Networks, StrKey, Address, TransactionBuilder, rpc, xdr } = await import(SDK_PATH);

// ── config ────────────────────────────────────────────────────────────────────
const ROOT         = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RPC_URL      = "https://soroban-testnet.stellar.org";
const NET_PHRASE   = Networks.TESTNET;
const server       = new rpc.Server(RPC_URL);

const workerSecret = run("stellar keys show worker").trim();
const keypair      = Keypair.fromSecret(workerSecret);
log(`Deployer: ${keypair.publicKey()}`);

// ── 1. Build ──────────────────────────────────────────────────────────────────
log("\n── Building contracts ──");
run("stellar contract build");

// stellar contract build uses wasm32v1-none (not wasm32-unknown-unknown).
const V_WASM = path.join(ROOT, "target/wasm32v1-none/release/verifier.wasm");
const P_WASM = path.join(ROOT, "target/wasm32v1-none/release/piilo.wasm");

// ── 2. Deploy verifier ────────────────────────────────────────────────────────
log("\n── Deploying verifier ──");
const VERIFIER_ID = run(
  `stellar contract deploy --optimize --wasm ${V_WASM} --source worker --network testnet`
).trim();
log(`Verifier: ${VERIFIER_ID}`);

// ── 3. XLM SAC ────────────────────────────────────────────────────────────────
log("\n── Resolving XLM SAC ──");
const NATIVE_TOKEN = run(
  "stellar contract id asset --asset native --network testnet"
).trim();
log(`XLM SAC: ${NATIVE_TOKEN}`);

// ── JubJub generators (needed before constructorArgs) ────────────────────────
const G_X_HEX = "72fd4dce199fea0b4fdbed2812625078624bea8bebf24bde696fc7094e36a80b";
const G_Y_HEX = "4fa134fa4674de260a3462d1423d8a5bdf64bede24f7b685a55ab491ccbf02aa";
const H_X_HEX = "05d6ef7aecc52a4be106063219ec137661d681d1dea14f9a58f2d5b88253c92d";
const H_Y_HEX = "1b7d08b3eae0e003ce5ff7f1ea0b091ce2952f22c545f2e3df09852d9ece4924";

// ── 4. Deploy piilo with constructor ─────────────────────────────────────────
// Upload WASM via CLI (avoids SDK XDR compatibility issues with testnet responses).
log("\n── Uploading piilo WASM ──");
const uploadOutput = run(
  `stellar contract upload --wasm ${P_WASM} --source worker --network testnet`
);
// The CLI prints the hash on the last non-empty line.
const piiloHashHex = uploadOutput.trim().split("\n").filter(Boolean).pop().trim();
log(`WASM hash: ${piiloHashHex}`);
const piiloHash = Buffer.from(piiloHashHex, "hex");

// Pre-compute contract ID so we know it before submitting.
const salt     = crypto.randomBytes(32);
const PIILO_ID = computeContractId(keypair, salt);
log(`\nPiilo contract ID (pre-computed): ${PIILO_ID}`);

log("\n── Deploying piilo ──");
const constructorArgs = [
  encodePoint(G_X_HEX, G_Y_HEX),          // g: Point
  encodePoint(H_X_HEX, H_Y_HEX),          // h: Point
  new Address(VERIFIER_ID).toScVal(),      // verifier: Address
  encodeVk(readVkJson("transfer")),        // transfer_vk: VerificationKey
  encodeVk(readVkJson("withdraw")),        // withdraw_vk: VerificationKey
  new Address(NATIVE_TOKEN).toScVal(),     // native_token: Address
];

await deployWithConstructor(piiloHash, salt, constructorArgs);
log(`Piilo deployed: ${PIILO_ID}`);

// ── 5. Write .env ─────────────────────────────────────────────────────────────
const envPath = path.join(ROOT, "examples/confidential-wallet/.env");
writeFileSync(envPath, `VITE_CONTRACT_ID=${PIILO_ID}\n`);
log(`\nWrote ${envPath}`);
log("Done — start frontend: cd packages/frontend && npm run dev");

// ══════════════════════════════════════════════════════════════════════════════
// Transaction helpers
// ══════════════════════════════════════════════════════════════════════════════

async function deployWithConstructor(wasmHash, salt, constructorArgs) {
  const account = await server.getAccount(keypair.publicKey());

  const createArgs = new xdr.CreateContractArgsV2({
    contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
      new xdr.ContractIdPreimageFromAddress({
        address: xdr.ScAddress.scAddressTypeAccount(keypair.xdrAccountId()),
        salt,
      })
    ),
    executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
    constructorArgs,
  });

  const tx = new TransactionBuilder(account, { fee: "10000000", networkPassphrase: NET_PHRASE })
    .addOperation(xdr.Operation.fromXDR(
      new xdr.Operation({
        sourceAccount: null,
        body: xdr.OperationBody.invokeHostFunction(new xdr.InvokeHostFunctionOp({
          hostFunction: xdr.HostFunction.hostFunctionTypeCreateContractV2(createArgs),
          auth: [],
        })),
      }).toXDR()
    ))
    .setTimeout(60)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new Error(`Deploy sim: ${sim.error}`);
  const prepared = rpc.assembleTransaction(tx, sim).build();
  prepared.sign(keypair);
  await submitAndWait(prepared);
}

async function submitAndWait(tx) {
  const sent = await server.sendTransaction(tx);
  if (sent.status === "ERROR")
    throw new Error(`Submit failed: ${sent.errorResult?.toXDR("base64")}`);
  for (let i = 0; i < 40; i++) {
    await sleep(1500);
    const res = await server.getTransaction(sent.hash);
    if (res.status === "SUCCESS") return res;
    if (res.status === "FAILED")
      throw new Error(`Transaction FAILED: ${JSON.stringify(res)}`);
  }
  throw new Error("Not confirmed within 60s");
}

// Deterministic contract ID from deployer + salt + network.
function computeContractId(kp, salt) {
  const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: crypto.createHash("sha256").update(NET_PHRASE).digest(),
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
        new xdr.ContractIdPreimageFromAddress({
          address: xdr.ScAddress.scAddressTypeAccount(kp.xdrAccountId()),
          salt,
        })
      ),
    })
  );
  const hashBuf = crypto.createHash("sha256").update(preimage.toXDR()).digest();
  return StrKey.encodeContract(hashBuf);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function run(cmd, opts = {}) {
  log(`$ ${cmd.length > 100 ? cmd.slice(0, 97) + "…" : cmd}`);
  return execSync(cmd, { encoding: "utf8", cwd: ROOT, stdio: ["pipe", "pipe", "inherit"], ...opts });
}

function log(msg) { process.stdout.write(msg + "\n"); }

// ══════════════════════════════════════════════════════════════════════════════
// XDR encoding
// ══════════════════════════════════════════════════════════════════════════════

// Point { x: BytesN<32>, y: BytesN<32> }
function encodePoint(xHex, yHex) {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("x"), val: xdr.ScVal.scvBytes(Buffer.from(xHex, "hex")) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("y"), val: xdr.ScVal.scvBytes(Buffer.from(yHex, "hex")) }),
  ]);
}

// G1Affine = BytesN<96>: x(48 BE) || y(48 BE)
function g1Bytes(xDec, yDec) {
  return Buffer.concat([
    Buffer.from(BigInt(xDec).toString(16).padStart(96, "0"), "hex"),
    Buffer.from(BigInt(yDec).toString(16).padStart(96, "0"), "hex"),
  ]);
}

// G2Affine = BytesN<192>: x_c1(48) || x_c0(48) || y_c1(48) || y_c0(48)
// Soroban follows the Zcash convention: Fp2 serialized as c1 || c0 (imaginary first).
// snarkjs VK JSON (from G2.toObject) gives [c0, c1] order — so callers pass (c0, c1)
// and this function swaps to produce the correct c1 || c0 || y_c1 || y_c0 layout.
function g2Bytes(xc0, xc1, yc0, yc1) {
  return Buffer.concat(
    [xc1, xc0, yc1, yc0].map((d) =>
      Buffer.from(BigInt(d).toString(16).padStart(96, "0"), "hex")
    )
  );
}

function readVkJson(circuit) {
  return JSON.parse(readFileSync(path.join(ROOT, `circuits/build/${circuit}_vk.json`), "utf8"));
}

// VerificationKey — Soroban struct map keys must be alphabetical: alpha, beta, delta, gamma, ic
function encodeVk(vk) {
  const alpha = g1Bytes(vk.vk_alpha_1[0], vk.vk_alpha_1[1]);
  const beta  = g2Bytes(vk.vk_beta_2[0][0],  vk.vk_beta_2[0][1],  vk.vk_beta_2[1][0],  vk.vk_beta_2[1][1]);
  const gamma = g2Bytes(vk.vk_gamma_2[0][0], vk.vk_gamma_2[0][1], vk.vk_gamma_2[1][0], vk.vk_gamma_2[1][1]);
  const delta = g2Bytes(vk.vk_delta_2[0][0], vk.vk_delta_2[0][1], vk.vk_delta_2[1][0], vk.vk_delta_2[1][1]);
  const ic    = vk.IC.map((pt) => xdr.ScVal.scvBytes(g1Bytes(pt[0], pt[1])));

  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("alpha"), val: xdr.ScVal.scvBytes(alpha) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("beta"),  val: xdr.ScVal.scvBytes(beta)  }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("delta"), val: xdr.ScVal.scvBytes(delta) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("gamma"), val: xdr.ScVal.scvBytes(gamma) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("ic"),    val: xdr.ScVal.scvVec(ic)      }),
  ]);
}
