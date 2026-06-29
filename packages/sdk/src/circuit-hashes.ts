// SHA-256 hashes of the compiled circuit files.
// Verified before passing to snarkjs — a tampered file from any source
// (CDN compromise, MITM, supply-chain) will throw before any private
// input is exposed to the prover.
// Update these whenever the circuits are recompiled.
export const CIRCUIT_HASHES: Record<string, string> = {
  "transfer_js/transfer.wasm": "22caae2d3c48e370d635e9e675fa543a339a6700c60bc292e4bd70ef32aeca22",
  "transfer_1.zkey":           "54da3ce07c0a038ff7af230e33e1d9e0987b4a5666b3320e5e32f74d9bf596a8",
  "withdraw_js/withdraw.wasm": "78f69a0d04b7e161aa50474104b490501985dd4cd1772646bd54abe296e9fa98",
  "withdraw_1.zkey":           "ee80e69d9ad58d650a34f7b8aa28aee3b5e5ad242e9ff5799e39c7bab6ad4fab",
};
