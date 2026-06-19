import { useState, useEffect, useRef, useCallback } from "react";
import { Piilo, PiiloStellar, decryptAuditorNote } from "@piilo/sdk";
import logoSrc from "./assets/logo.png";

// ── config ─────────────────────────────────────────────────────────────────────
// Set VITE_CONTRACT_ID in a .env file once the contract is deployed to testnet.
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? "";

const NETWORK = "testnet";

// ── freighter wallet adapter ───────────────────────────────────────────────────
async function makeFreighterAdapter() {
  const freighter = await import("@stellar/freighter-api");
  const { isConnected, requestAccess, getPublicKey, signTransaction, signBlob } = freighter;

  // v2 returns a plain boolean, not an object.
  const ok = await isConnected();
  if (!ok) throw new Error("Freighter extension not detected. Install it from freighter.app and refresh.");

  // requestAccess() opens the approval popup and returns the public key.
  const address = await requestAccess();
  if (!address) throw new Error("Freighter access denied");

  return {
    address,
    walletAdapter: {
      publicKey: async () => getPublicKey(),
      signTransaction: async (xdr, opts) =>
        signTransaction(xdr, { networkPassphrase: opts?.networkPassphrase }),
      // v2 has no signMessage; derive note key from signing a blob instead.
      signMessage: async (message) => {
        if (signBlob) {
          const encoded = new TextEncoder().encode(message);
          const b64 = btoa(String.fromCharCode(...encoded));
          const result = await signBlob(b64);
          const raw = result.signedBlob ?? result.signature ?? result;
          const bytes =
            typeof raw === "string"
              ? Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
              : new Uint8Array(raw);
          return { signature: bytes };
        }
        throw new Error("Freighter v2 does not support signMessage or signBlob — transfer note encryption unavailable");
      },
    },
  };
}

// ── helpers ────────────────────────────────────────────────────────────────────
function shortenAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const MAX_SANE_STROOPS = 500_000_000_000_000_000n; // 50B XLM — total supply

function xlmFmt(stroops) {
  if (stroops == null) return "—";
  const s = BigInt(stroops);
  if (s < 0n || s > MAX_SANE_STROOPS) return "? (wrong key)";
  const whole = s / 10_000_000n;
  const frac  = s % 10_000_000n;
  const fracStr = frac.toString().padStart(7, "0").replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr} XLM` : `${whole} XLM`;
}

function commitmentFmt(point) {
  if (!point) return null;
  const hex = (v) => BigInt(v).toString(16).padStart(64, "0");
  return `0x${hex(point[0])}…${hex(point[1]).slice(-8)}`;
}

// ── component ──────────────────────────────────────────────────────────────────
export default function App() {
  const [wallet, setWallet] = useState(null);   // { address, walletAdapter }
  const [piilo, setPiilo]   = useState(null);
  const [balance, setBalance]     = useState(null);
  const [onChain, setOnChain]     = useState(null); // { balance_commitment, has_pending }
  const [log, setLog]             = useState([]);
  const [busy, setBusy]           = useState(false);
  const [backupStale, setBackupStale] = useState(false);

  const [depositAmt, setDepositAmt]   = useState("100");
  const [transferTo, setTransferTo]   = useState("");
  const [transferAmt, setTransferAmt] = useState("50");

  const [auditorKey, setAuditorKey]     = useState("");
  const [scanAddress, setScanAddress]   = useState("");
  const [auditResults, setAuditResults] = useState(null); // null = not scanned yet
  const [auditing, setAuditing]         = useState(false);

  const logRef = useRef(null);

  // ── log ──────────────────────────────────────────────────────────────────────
  const emit = useCallback((msg, type = "info") => {
    const ts = new Date().toLocaleTimeString("en", { hour12: false });
    setLog((l) => [...l.slice(-49), { ts, msg, type }]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // ── connect ──────────────────────────────────────────────────────────────────
  async function connect() {
    setBusy(true);
    try {
      const w = await makeFreighterAdapter();
      setWallet(w);

      if (!CONTRACT_ID) {
        emit("Connected. Set VITE_CONTRACT_ID in .env to enable on-chain ops.", "warn");
        setBusy(false);
        return;
      }

      const sdk = new Piilo({
        network: NETWORK,
        contractId: CONTRACT_ID,
        wallet: w.walletAdapter,
      });
      setPiilo(sdk);
      emit(`Connected as ${shortenAddr(w.address)}`, "ok");
      await refresh(sdk, w.address);
    } catch (e) {
      emit(e.message, "error");
    }
    setBusy(false);
  }

  // ── refresh state ─────────────────────────────────────────────────────────────
  async function refresh(sdk, address) {
    if (!sdk) return;
    try {
      const [bal, chain] = await Promise.all([
        sdk.getBalance(),
        sdk.stellar?.getAccount(address).catch(() => null),
      ]);
      setBalance(bal);
      setOnChain(chain);
    } catch (e) {
      emit(`Refresh failed: ${e.message}`, "error");
    }
  }

  // ── operations ────────────────────────────────────────────────────────────────
  async function op(label, fn, { mutatesBalance = false } = {}) {
    if (!piilo || busy) return;
    setBusy(true);
    emit(`${label}…`);
    try {
      const result = await fn();
      emit(result ?? `${label} done`, "ok");
      if (mutatesBalance) setBackupStale(true);
      await refresh(piilo, wallet.address);
    } catch (e) {
      emit(`${label} failed: ${e.message}`, "error");
    }
    setBusy(false);
  }

  const handleDeposit = () =>
    op("Deposit", async () => {
      const stroops = BigInt(Math.round(parseFloat(depositAmt) * 1e7));
      await piilo.deposit(stroops);
      return `Deposited ${depositAmt} XLM`;
    }, { mutatesBalance: true });

  const handleTransfer = () =>
    op("Transfer", async () => {
      const stroops = BigInt(Math.round(parseFloat(transferAmt) * 1e7));
      await piilo.transfer({ to: transferTo, amount: stroops });
      return `Sent ${transferAmt} XLM → ${shortenAddr(transferTo)}`;
    }, { mutatesBalance: true });

  const handleSettle = () =>
    op("Settle", async () => {
      const result = await piilo.settleIfPending();
      if (!result) return "No pending balance";
      return `Settled +${xlmFmt(result.received)}`;
    }, { mutatesBalance: true });

  const handleWithdraw = () =>
    op("Withdraw", async () => {
      await piilo.withdraw();
      return "Withdrawn — balance is now public";
    }, { mutatesBalance: true });

  async function handleAudit() {
    if (!CONTRACT_ID || !auditorKey || !scanAddress || auditing) return;
    setAuditing(true);
    emit("Auditor scan…");
    try {
      const kAud = BigInt(auditorKey.trim());
      const stellar = new PiiloStellar(CONTRACT_ID, NETWORK);
      const events = await stellar.getTransferNotes(scanAddress, true);
      const results = events.map(({ from, r_e, a_enc }) => ({
        from,
        amount: decryptAuditorNote(kAud, r_e, a_enc),
        encryptedHex: "0x" + a_enc.toString(16).slice(0, 8) + "…",
      }));
      setAuditResults(results);
      emit(`Found ${results.length} transfer(s) in the 7-day window`, results.length ? "ok" : "warn");
    } catch (e) {
      emit(`Audit failed: ${e.message}`, "error");
      setAuditResults(null);
    }
    setAuditing(false);
  }

  const handleExport = () =>
    op("Export backup", async () => {
      const json = await piilo.exportBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `piilo-backup-${wallet.address.slice(0, 6)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStale(false);
      return "Backup file downloaded — store it safely";
    });

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !piilo || busy) return;
    setBusy(true);
    emit("Importing backup…");
    try {
      const json = await file.text();
      const { balance } = await piilo.importBackup(json);
      emit(`Backup restored — balance: ${xlmFmt(balance)}`, "ok");
      await refresh(piilo, wallet.address);
    } catch (err) {
      emit(`Import failed: ${err.message}`, "error");
    }
    e.target.value = "";
    setBusy(false);
  };

  // ── ui ─────────────────────────────────────────────────────────────────────────
  const hasPending = onChain?.has_pending;
  const commitment = onChain?.balance_commitment
    ? commitmentFmt(onChain.balance_commitment)
    : null;

  return (
    <div className="app">
      {/* ── header ── */}
      <header>
        <div className="logo">
          <img src={logoSrc} alt="Piilo" className="logo-img" />
          <div>
            <div className="logo-word">PIILO WALLET</div>
            <div className="logo-tag">confidential wallet · powered by @piilo/sdk</div>
          </div>
        </div>
        {!wallet ? (
          <button className="btn-connect" onClick={connect} disabled={busy}>
            {busy ? "connecting…" : "Connect Freighter"}
          </button>
        ) : (
          <div className="wallet-chip">
            <span className="dot live" />
            {shortenAddr(wallet.address)}
          </div>
        )}
      </header>

      <main>
        {!wallet ? (
          <div className="splash">
            <img src={logoSrc} alt="" className="splash-logo" />
            <div className="splash-title">PIILO WALLET</div>
            <p className="splash-sub">
              A confidential wallet built on Stellar.<br />
              Addresses are public. Amounts are hidden.
            </p>
            <div className="splash-props">
              <div className="splash-prop">
                <span className="splash-prop-icon">👁</span>
                <span className="splash-prop-label">Addresses</span>
                <span className="splash-prop-value">Public</span>
              </div>
              <div className="splash-prop">
                <span className="splash-prop-icon">🔒</span>
                <span className="splash-prop-label">Amounts</span>
                <span className="splash-prop-value">Hidden</span>
              </div>
              <div className="splash-prop">
                <span className="splash-prop-icon">⚡</span>
                <span className="splash-prop-label">Proofs</span>
                <span className="splash-prop-value">In-browser</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid">

            {/* ── balance reveal panel ── */}
            <section className="card span2 balance-card">
              <h2>Balance</h2>
              <div className="reveal-row">
                <div className="reveal-col">
                  <div className="reveal-label">LOCAL (you see)</div>
                  <div className="reveal-value bright">
                    {balance != null ? xlmFmt(balance) : "—"}
                  </div>
                </div>
                <div className="reveal-divider">vs</div>
                <div className="reveal-col">
                  <div className="reveal-label">ON-CHAIN (everyone sees)</div>
                  <div className="reveal-value mono dim">
                    {commitment ?? (
                      onChain === null
                        ? <span className="muted">no account yet</span>
                        : <span className="redacted">█████████████████████████</span>
                    )}
                  </div>
                </div>
              </div>
              {hasPending && (
                <div className="pending-badge">⚡ incoming transfer waiting to settle</div>
              )}
            </section>

            {/* ── deposit ── */}
            <section className="card">
              <h2>Deposit</h2>
              <p className="card-desc">
                Amount is <strong>visible</strong> on-chain as a plain XLM transfer.
                After deposit, further transfers are private.
              </p>
              <div className="field-row">
                <input
                  type="number"
                  min="0.0000001"
                  step="0.1"
                  value={depositAmt}
                  onChange={(e) => setDepositAmt(e.target.value)}
                  className="input"
                  placeholder="XLM amount"
                />
                <button
                  className="btn"
                  onClick={handleDeposit}
                  disabled={busy || !CONTRACT_ID}
                >
                  Deposit
                </button>
              </div>
            </section>

            {/* ── transfer ── */}
            <section className="card">
              <h2>Send</h2>
              <p className="card-desc">
                Amount is <strong>hidden</strong>. A ZK proof runs in your browser —
                the recipient sees a commitment, not a number.
              </p>
              <div className="field-col">
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="input mono"
                  placeholder="Recipient Stellar address (G…)"
                />
                <div className="field-row">
                  <input
                    type="number"
                    min="0.0000001"
                    step="0.1"
                    value={transferAmt}
                    onChange={(e) => setTransferAmt(e.target.value)}
                    className="input"
                    placeholder="XLM"
                  />
                  <button
                    className="btn"
                    onClick={handleTransfer}
                    disabled={busy || !CONTRACT_ID || !transferTo}
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>

            {/* ── settle ── */}
            <section className={`card ${hasPending ? "card-highlight" : ""}`}>
              <h2>
                Receive
                {hasPending && <span className="badge">!</span>}
              </h2>
              <p className="card-desc">
                Merges incoming transfers into your balance.
                No ZK proof needed — the homomorphism handles it on-chain.
              </p>
              <button
                className={`btn ${hasPending ? "btn-accent" : ""}`}
                onClick={handleSettle}
                disabled={busy || !CONTRACT_ID}
              >
                {hasPending ? "⚡ Claim incoming" : "Check incoming"}
              </button>
            </section>

            {/* ── withdraw ── */}
            <section className="card">
              <h2>Exit Privacy</h2>
              <p className="card-desc">
                Reveals your balance and withdraws to a regular Stellar account.
                A ZK proof of ownership is verified on-chain before XLM is released.
              </p>
              <button
                className="btn btn-danger"
                onClick={handleWithdraw}
                disabled={busy || !CONTRACT_ID || !balance}
              >
                Withdraw {balance ? xlmFmt(balance) : ""}
              </button>
            </section>

            {/* ── backup / recovery ── */}
            <section className={`card span2${backupStale ? " card-warn" : ""}`}>
              <h2>Backup &amp; Recovery</h2>
              {backupStale && (
                <div className="warn-banner">
                  Your balance changed — the previous backup is now out of date.
                  Download a new one.
                </div>
              )}
              <p className="card-desc">
                Your balance and blinding factor live only in this browser.
                Export a backup file and store it like a seed phrase — anyone
                with it can read your balance. Download a fresh copy after
                every deposit, transfer, or settle. Import it on a new device
                to restore access; the backup is verified against the on-chain
                commitment before anything is overwritten.
              </p>
              <div className="field-row">
                <button
                  className={`btn${backupStale ? " btn-accent" : ""}`}
                  onClick={handleExport}
                  disabled={busy || !CONTRACT_ID}
                >
                  {backupStale ? "⬇ Update backup now" : "Download backup"}
                </button>
                <label className={`btn btn-secondary ${busy || !CONTRACT_ID ? "disabled" : ""}`}>
                  Restore from backup
                  <input
                    type="file"
                    accept=".json,application/json"
                    style={{ display: "none" }}
                    onChange={handleImport}
                    disabled={busy || !CONTRACT_ID}
                  />
                </label>
              </div>
            </section>

            {/* ── auditor panel ── */}
            <section className="card span2 card-auditor">
              <h2>
                Auditor View
                <span className="badge-restricted">restricted</span>
              </h2>
              <p className="card-desc">
                The registered auditor can decrypt transfer amounts from on-chain events
                using their private key. Addresses are already public — only amounts are
                hidden from everyone else.
              </p>
              <div className="field-col">
                <input
                  type="password"
                  value={auditorKey}
                  onChange={(e) => setAuditorKey(e.target.value)}
                  className="input mono"
                  placeholder="k_aud — auditor private scalar (decimal or 0x hex)"
                />
                <div className="field-row">
                  <input
                    type="text"
                    value={scanAddress}
                    onChange={(e) => setScanAddress(e.target.value)}
                    className="input mono"
                    placeholder="Address to scan for incoming transfers (G…)"
                  />
                  <button
                    className="btn btn-auditor"
                    onClick={handleAudit}
                    disabled={auditing || !CONTRACT_ID || !auditorKey || !scanAddress}
                  >
                    {auditing ? "scanning…" : "Scan"}
                  </button>
                </div>
              </div>
              {auditResults !== null && (
                auditResults.length === 0 ? (
                  <div className="audit-empty">
                    No transfers to this address in the last 7 days.
                  </div>
                ) : (
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>Decrypted amount</th>
                        <th>A_enc (on-chain)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditResults.map((r, i) => (
                        <tr key={i}>
                          <td className="mono">{shortenAddr(r.from)}</td>
                          <td className="audit-amount">{xlmFmt(r.amount)}</td>
                          <td className="mono dim">{r.encryptedHex}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </section>

            {/* ── log ── */}
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
        )}

        {!CONTRACT_ID && wallet && (
          <div className="notice">
            <strong>Contract not configured.</strong>{" "}
            Add <code>VITE_CONTRACT_ID=C…</code> to{" "}
            <code>packages/frontend/.env</code> after deploying to testnet.
          </div>
        )}
      </main>
    </div>
  );
}
