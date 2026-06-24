import { useState, useRef, useCallback, useEffect } from "react";
import { PiiloStellar, decryptAuditorNote } from "@piilo/sdk";

const CONTRACT_IDS_ENV = {
  XLM:  import.meta.env.VITE_PIILO_XLM  ?? import.meta.env.VITE_CONTRACT_ID ?? undefined,
  USDC: import.meta.env.VITE_PIILO_USDC ?? undefined,
};
const FALLBACK_IDS = {
  XLM:  "CBWSNSCQAHVH53MMQBYV5M5EEYMFZVKBDHF2ZPP6NKYFDLA66ZLPTQIB",
  USDC: "CDYO7CD5DJ3YVB4GOZ5BYPFOM7TMGUALP6AYMSYSAYWOS6WWIZL6NBKW",
};
const SUPPORTED_ASSETS = ["XLM", "USDC"];
const NETWORK = "testnet";

function contractId(asset) {
  return CONTRACT_IDS_ENV[asset] ?? FALLBACK_IDS[asset] ?? "";
}

function shortenAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const MAX_SANE_STROOPS = 500_000_000_000_000_000n;

function tokenFmt(stroops, symbol = "XLM") {
  if (stroops == null) return "—";
  const s = BigInt(stroops);
  if (s < 0n || s > MAX_SANE_STROOPS) return "? (wrong key)";
  const whole = s / 10_000_000n;
  const frac  = s % 10_000_000n;
  const fracStr = frac.toString().padStart(7, "0").replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr} ${symbol}` : `${whole} ${symbol}`;
}

export default function AuditorPage() {
  const [asset, setAsset]               = useState("XLM");
  const [auditorKey, setAuditorKey]     = useState("");
  const [scanAddress, setScanAddress]   = useState("");
  const [auditResults, setAuditResults] = useState(null);
  const [scanning, setScanning]         = useState(false);
  const [log, setLog]                   = useState([]);

  const logRef = useRef(null);

  const emit = useCallback((msg, type = "info") => {
    const ts = new Date().toLocaleTimeString("en", { hour12: false });
    setLog((l) => [...l.slice(-49), { ts, msg, type }]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  async function handleScan() {
    const cid = contractId(asset);
    if (!cid || !auditorKey || !scanAddress || scanning) return;
    setScanning(true);
    setAuditResults(null);
    emit(`Scanning ${asset} contract for ${scanAddress.slice(0, 6)}…`);
    try {
      const kAud = BigInt(auditorKey.trim());
      const stellar = new PiiloStellar(cid, NETWORK);
      const events = await stellar.getTransferNotes(scanAddress, true);
      const results = events.map(({ from, r_e, a_enc }) => ({
        from,
        amount: decryptAuditorNote(kAud, r_e, a_enc),
        encryptedHex: "0x" + a_enc.toString(16).slice(0, 8) + "…",
      }));
      setAuditResults(results);
      emit(
        `Found ${results.length} transfer(s) in the 7-day RPC window`,
        results.length ? "ok" : "warn",
      );
    } catch (e) {
      emit(`Scan failed: ${e.message}`, "error");
    }
    setScanning(false);
  }

  const canScan = !scanning && !!contractId(asset) && !!auditorKey && !!scanAddress;

  return (
    <main className="auditor-main">
      <div className="auditor-hero">
        <div className="auditor-hero-label">RESTRICTED ACCESS</div>
        <h1 className="auditor-hero-title">Auditor Console</h1>
        <p className="auditor-hero-sub">
          Decrypt transfer amounts using the registered auditor key.
          Addresses are always public — only amounts are hidden from everyone else.
          All data is read directly from on-chain events; nothing is stored here.
        </p>
      </div>

      <div className="auditor-grid">

        {/* ── asset selector ── */}
        <section className="card">
          <h2>Token</h2>
          <p className="card-desc">Select which Piilo token contract to audit.</p>
          <div className="token-selector">
            {SUPPORTED_ASSETS.map((a) => (
              <button
                key={a}
                className={`token-tab ${asset === a ? "token-tab-active" : ""}`}
                onClick={() => { setAsset(a); setAuditResults(null); }}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        {/* ── credentials ── */}
        <section className="card card-auditor">
          <h2>Auditor Credentials</h2>
          <p className="card-desc">
            Enter your auditor private scalar (<code>k_aud</code>).
            This never leaves your browser — decryption runs locally.
          </p>
          <div className="field-col">
            <label className="field-label">Private key</label>
            <input
              type="password"
              value={auditorKey}
              onChange={(e) => setAuditorKey(e.target.value)}
              className="input mono"
              placeholder="k_aud — decimal or 0x hex scalar"
              autoComplete="off"
            />
          </div>
        </section>

        {/* ── scan target ── */}
        <section className="card">
          <h2>Scan Target</h2>
          <p className="card-desc">
            Enter the Stellar address whose incoming transfers you want to audit.
            Only events from the last 7 days (Stellar RPC retention window) are available.
          </p>
          <div className="field-col">
            <label className="field-label">Recipient address</label>
            <div className="field-row">
              <input
                type="text"
                value={scanAddress}
                onChange={(e) => setScanAddress(e.target.value)}
                className="input mono"
                placeholder="G… Stellar address"
              />
              <button
                className="btn btn-auditor"
                onClick={handleScan}
                disabled={!canScan}
              >
                {scanning ? "scanning…" : "Scan"}
              </button>
            </div>
          </div>
        </section>

        {/* ── results ── */}
        <section className="card span2">
          <h2>
            Results
            {auditResults && (
              <span className={`badge-count ${auditResults.length ? "badge-count-found" : ""}`}>
                {auditResults.length}
              </span>
            )}
          </h2>

          {auditResults === null && !scanning && (
            <div className="audit-empty">
              Enter credentials and a recipient address, then click Scan.
            </div>
          )}

          {scanning && (
            <div className="audit-empty">Querying Stellar RPC…</div>
          )}

          {auditResults !== null && !scanning && (
            auditResults.length === 0 ? (
              <div className="audit-empty">
                No transfers to this address found in the last 7 days.
              </div>
            ) : (
              <>
                <div className="audit-summary">
                  Showing {auditResults.length} transfer{auditResults.length !== 1 ? "s" : ""} to{" "}
                  <span className="mono">{shortenAddr(scanAddress)}</span>
                  {" "}— total:{" "}
                  <span className="audit-total">
                    {tokenFmt(auditResults.reduce((acc, r) => acc + (r.amount ?? 0n), 0n), asset)}
                  </span>
                </div>
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>From</th>
                      <th>Decrypted amount</th>
                      <th>A_enc (on-chain, truncated)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditResults.map((r, i) => (
                      <tr key={i}>
                        <td className="mono dim">{i + 1}</td>
                        <td className="mono">{shortenAddr(r.from)}</td>
                        <td className="audit-amount">{tokenFmt(r.amount, asset)}</td>
                        <td className="mono dim">{r.encryptedHex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )
          )}
        </section>

        {/* ── activity log ── */}
        <section className="card span2 card-log">
          <h2>Activity</h2>
          <div className="log" ref={logRef}>
            {log.length === 0 && (
              <div className="log-empty">waiting for activity…</div>
            )}
            {log.map((entry, i) => (
              <div key={i} className={`log-line log-${entry.type}`}>
                <span className="log-ts">{entry.ts}</span>
                <span className="log-msg">{entry.msg}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {!contractId(asset) && (
        <div className="notice">
          <strong>No {asset} contract configured.</strong>{" "}
          Run <code>node scripts/deploy.mjs{asset !== "XLM" ? ` --symbol ${asset} --token-address <SAC>` : ""}</code> to deploy.
        </div>
      )}
    </main>
  );
}
