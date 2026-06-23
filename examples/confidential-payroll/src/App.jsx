import { useState, useEffect, useRef, useCallback } from "react";
import { Piilo, CONTRACT_IDS } from "@piilo/sdk";

// ── config ─────────────────────────────────────────────────────────────────────
const CONTRACT_IDS_ENV = {
  XLM:  import.meta.env.VITE_PIILO_XLM  ?? import.meta.env.VITE_CONTRACT_ID ?? undefined,
  USDC: import.meta.env.VITE_PIILO_USDC ?? undefined,
};
const SUPPORTED_ASSETS = ["XLM", "USDC"];
const NETWORK = "testnet";

function contractId(asset) {
  return CONTRACT_IDS_ENV[asset] ?? CONTRACT_IDS[NETWORK]?.[asset] ?? "";
}

// ── freighter wallet adapter ───────────────────────────────────────────────────
async function makeFreighterAdapter() {
  const freighter = await import("@stellar/freighter-api");
  const { isConnected, requestAccess, getPublicKey, signTransaction, signBlob } = freighter;

  const ok = await isConnected();
  if (!ok) throw new Error("Freighter not detected. Install it from freighter.app and refresh.");

  const address = await requestAccess();
  if (!address) throw new Error("Freighter access denied");

  return {
    address,
    walletAdapter: {
      publicKey: async () => getPublicKey(),
      signTransaction: async (xdr, opts) =>
        signTransaction(xdr, { networkPassphrase: opts?.networkPassphrase }),
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
        throw new Error("Freighter does not support signBlob — note encryption unavailable");
      },
    },
  };
}

// ── helpers ────────────────────────────────────────────────────────────────────
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

function parseAmount(str) {
  const n = parseFloat(str);
  if (!str || isNaN(n) || n <= 0) return null;
  return BigInt(Math.round(n * 1e7));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const STORAGE_KEY = (asset) => `piilo:payroll:recipients:${asset}`;

function loadRecipients(asset) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(asset));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecipients(asset, list) {
  localStorage.setItem(STORAGE_KEY(asset), JSON.stringify(list));
}

// ── component ──────────────────────────────────────────────────────────────────
export default function App() {
  const [wallet, setWallet]     = useState(null);
  const [piilo, setPiilo]       = useState(null);
  const [asset, setAsset]       = useState("XLM");
  const [balance, setBalance]   = useState(null);
  const [fees, setFees]         = useState(null);
  const [busy, setBusy]         = useState(false);

  const [recipients, setRecipients] = useState(() => loadRecipients("XLM"));
  const [runStatus, setRunStatus]   = useState({}); // id → { state, error }
  const [running, setRunning]       = useState(false);

  const [depositAmt, setDepositAmt] = useState("");
  const [log, setLog]               = useState([]);
  const logRef = useRef(null);

  const emit = useCallback((msg, type = "info") => {
    const ts = new Date().toLocaleTimeString("en", { hour12: false });
    setLog((l) => [...l.slice(-99), { ts, msg, type }]);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Persist recipients when they change
  useEffect(() => {
    saveRecipients(asset, recipients);
  }, [recipients, asset]);

  // ── connect / switch asset ─────────────────────────────────────────────────
  async function connect() {
    setBusy(true);
    try {
      const w = await makeFreighterAdapter();
      setWallet(w);
      await initSdk(w, asset);
    } catch (e) {
      emit(e.message, "error");
    }
    setBusy(false);
  }

  async function initSdk(w, selectedAsset) {
    try {
      const sdk = new Piilo({
        network: NETWORK,
        contractId: CONTRACT_IDS_ENV[selectedAsset] || undefined,
        asset: selectedAsset,
        wallet: w.walletAdapter,
      });
      setPiilo(sdk);
      emit(`Connected as ${shortenAddr(w.address)} · ${selectedAsset}`, "ok");
      await Promise.all([
        refreshBalance(sdk),
        sdk.getFees().then(setFees).catch(() => null),
      ]);
    } catch (e) {
      emit(e.message, "error");
      setPiilo(null);
    }
  }

  async function switchAsset(newAsset) {
    if (!wallet || busy || newAsset === asset) return;
    setAsset(newAsset);
    setRecipients(loadRecipients(newAsset));
    setRunStatus({});
    setBalance(null);
    setFees(null);
    setPiilo(null);
    setBusy(true);
    emit(`Switching to ${newAsset}…`);
    await initSdk(wallet, newAsset);
    setBusy(false);
  }

  async function refreshBalance(sdk) {
    if (!sdk) return;
    try {
      setBalance(await sdk.getBalance());
    } catch {
      setBalance(null);
    }
  }

  // ── recipient management ───────────────────────────────────────────────────
  function addRecipient() {
    setRecipients((r) => [...r, { id: uid(), name: "", address: "", amount: "" }]);
  }

  function removeRecipient(id) {
    setRecipients((r) => r.filter((x) => x.id !== id));
    setRunStatus((s) => { const n = { ...s }; delete n[id]; return n; });
  }

  function updateRecipient(id, field, value) {
    setRecipients((r) => r.map((x) => x.id === id ? { ...x, [field]: value } : x));
  }

  // ── derived values ─────────────────────────────────────────────────────────
  const validRecipients = recipients.filter(
    (r) => r.address.length > 0 && parseAmount(r.amount) !== null
  );

  const totalStroops = validRecipients.reduce(
    (sum, r) => sum + (parseAmount(r.amount) ?? 0n), 0n
  );

  const transferFee = fees != null ? fees.transferFlatFee : 0n;
  const totalFees = transferFee * BigInt(validRecipients.length);
  const hasEnoughBalance = balance != null && balance >= totalStroops;

  // ── deposit ────────────────────────────────────────────────────────────────
  async function handleDeposit() {
    if (!piilo || busy || !depositAmt) return;
    setBusy(true);
    emit("Depositing…");
    try {
      const stroops = BigInt(Math.round(parseFloat(depositAmt) * 1e7));
      await piilo.deposit(stroops);
      const fee = fees ? stroops * BigInt(fees.depositFeeBps) / 10_000n : 0n;
      emit(`Deposited ${depositAmt} ${asset}${fee > 0n ? ` (fee ${tokenFmt(fee, asset)})` : ""}`, "ok");
      setDepositAmt("");
      await refreshBalance(piilo);
    } catch (e) {
      emit(`Deposit failed: ${e.message}`, "error");
    }
    setBusy(false);
  }

  // ── run payroll ────────────────────────────────────────────────────────────
  async function runPayroll() {
    if (!piilo || running || validRecipients.length === 0) return;
    setRunning(true);

    // Reset status for all valid recipients
    const initial = {};
    for (const r of validRecipients) initial[r.id] = { state: "pending" };
    setRunStatus(initial);

    emit(`Starting payroll run — ${validRecipients.length} recipient(s)…`);

    for (const r of validRecipients) {
      const stroops = parseAmount(r.amount);
      setRunStatus((s) => ({ ...s, [r.id]: { state: "sending" } }));
      emit(`Sending to ${r.name || shortenAddr(r.address)}…`);
      try {
        await piilo.transfer({ to: r.address, amount: stroops });
        setRunStatus((s) => ({ ...s, [r.id]: { state: "sent" } }));
        emit(`✓ ${r.name || shortenAddr(r.address)} — ${tokenFmt(stroops, asset)}`, "ok");
      } catch (e) {
        setRunStatus((s) => ({ ...s, [r.id]: { state: "failed", error: e.message } }));
        emit(`✗ ${r.name || shortenAddr(r.address)}: ${e.message}`, "error");
      }
      await refreshBalance(piilo);
    }

    emit("Payroll run complete.", "ok");
    setRunning(false);
  }

  // ── ui ─────────────────────────────────────────────────────────────────────
  const canRunPayroll =
    piilo && !running && !busy && validRecipients.length > 0 && hasEnoughBalance;

  const depositFeePreview = () => {
    if (!fees || !depositAmt || isNaN(parseFloat(depositAmt))) return null;
    const stroops = BigInt(Math.round(parseFloat(depositAmt) * 1e7));
    const fee = stroops * BigInt(fees.depositFeeBps) / 10_000n;
    return fee > 0n ? { fee, credited: stroops - fee } : null;
  };

  return (
    <div className="app">
      {/* ── header ── */}
      <header className="header">
        <div className="header-brand">
          <span className="logo-text">piilo</span>
          <span className="header-sub">Confidential Payroll</span>
        </div>
        <div className="header-right">
          {wallet && (
            <div className="token-selector">
              {SUPPORTED_ASSETS.map((a) => (
                <button
                  key={a}
                  className={`token-tab ${asset === a ? "token-tab-active" : ""}`}
                  onClick={() => switchAsset(a)}
                  disabled={busy || running}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
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
        </div>
      </header>

      <main className="main">
        {/* ── balance + deposit ── */}
        <section className="card card-balance">
          <div className="balance-row">
            <div>
              <div className="balance-label">Confidential balance</div>
              <div className="balance-value">
                {balance != null ? tokenFmt(balance, asset) : "—"}
              </div>
            </div>
            {piilo && (
              <div className="deposit-inline">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="input input-sm"
                  placeholder={`Amount (${asset})`}
                  value={depositAmt}
                  onChange={(e) => setDepositAmt(e.target.value)}
                  disabled={busy || running}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleDeposit}
                  disabled={busy || running || !depositAmt}
                >
                  Deposit
                </button>
              </div>
            )}
          </div>
          {depositFeePreview() && (() => {
            const { fee, credited } = depositFeePreview();
            return (
              <div className="fee-hint">
                Fee {tokenFmt(fee, asset)} ({fees.depositFeeBps / 100}%) · credited {tokenFmt(credited, asset)}
              </div>
            );
          })()}
        </section>

        {/* ── recipient table ── */}
        <section className="card card-recipients">
          <div className="card-header-row">
            <h2>Recipients</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={addRecipient}
              disabled={running}
            >
              + Add recipient
            </button>
          </div>

          {recipients.length === 0 ? (
            <div className="empty-state">
              No recipients yet. Add employees to build your payroll run.
            </div>
          ) : (
            <table className="recipients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Stellar address</th>
                  <th>Amount ({asset})</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => {
                  const status = runStatus[r.id];
                  return (
                    <tr key={r.id} className={status ? `row-${status.state}` : ""}>
                      <td>
                        <input
                          type="text"
                          className="input input-inline"
                          placeholder="Name"
                          value={r.name}
                          onChange={(e) => updateRecipient(r.id, "name", e.target.value)}
                          disabled={running}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input input-inline mono"
                          placeholder="G… address"
                          value={r.address}
                          onChange={(e) => updateRecipient(r.id, "address", e.target.value)}
                          disabled={running}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-inline input-amount"
                          placeholder="0.00"
                          value={r.amount}
                          onChange={(e) => updateRecipient(r.id, "amount", e.target.value)}
                          disabled={running}
                        />
                      </td>
                      <td className="status-cell">
                        {!status && <span className="status-dash">—</span>}
                        {status?.state === "pending"  && <span className="status-pending">queued</span>}
                        {status?.state === "sending"  && <span className="status-sending">sending…</span>}
                        {status?.state === "sent"     && <span className="status-sent">✓ sent</span>}
                        {status?.state === "failed"   && (
                          <span className="status-failed" title={status.error}>✗ failed</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-remove"
                          onClick={() => removeRecipient(r.id)}
                          disabled={running}
                          title="Remove"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* ── payroll summary + run ── */}
        {validRecipients.length > 0 && (
          <section className="card card-summary">
            <h2>Payroll Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Recipients</span>
                <span className="summary-value">{validRecipients.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total payout</span>
                <span className="summary-value">{tokenFmt(totalStroops, asset)}</span>
              </div>
              {totalFees > 0n && (
                <div className="summary-item">
                  <span className="summary-label">Transfer fees</span>
                  <span className="summary-value dim">{tokenFmt(totalFees, asset)}</span>
                </div>
              )}
              <div className="summary-item">
                <span className="summary-label">Your balance</span>
                <span className={`summary-value ${!hasEnoughBalance && balance != null ? "insufficient" : ""}`}>
                  {tokenFmt(balance, asset)}
                </span>
              </div>
            </div>

            {!piilo && (
              <div className="notice">Connect Freighter to run payroll.</div>
            )}
            {piilo && balance != null && !hasEnoughBalance && (
              <div className="notice notice-warn">
                Insufficient balance. Deposit at least {tokenFmt(totalStroops - (balance ?? 0n), asset)} more.
              </div>
            )}

            <button
              className="btn btn-primary btn-run"
              onClick={runPayroll}
              disabled={!canRunPayroll}
            >
              {running
                ? `Sending… (${Object.values(runStatus).filter((s) => s.state === "sent").length}/${validRecipients.length})`
                : `Run Payroll — ${tokenFmt(totalStroops, asset)}`}
            </button>

            {fees != null && fees.transferFlatFee > 0n && (
              <div className="fee-hint">
                {tokenFmt(fees.transferFlatFee, asset)} flat fee per transfer, charged from your public wallet
              </div>
            )}
          </section>
        )}

        {/* ── activity log ── */}
        <section className="card card-log">
          <h2>Activity</h2>
          <div className="log" ref={logRef}>
            {log.length === 0 && (
              <div className="log-empty">Waiting for activity…</div>
            )}
            {log.map((entry, i) => (
              <div key={i} className={`log-line log-${entry.type}`}>
                <span className="log-ts">{entry.ts}</span>
                <span className="log-msg">{entry.msg}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
