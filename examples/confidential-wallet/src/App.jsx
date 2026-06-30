import { useState, useEffect, useRef, useCallback } from "react";
import { Piilo } from "@neylanxyz/piilo";
import logoSrc from "./assets/logo.png";
import AuditorPage from "./AuditorPage.jsx";

// ── config ─────────────────────────────────────────────────────────────────────
const SUPPORTED_ASSETS = ["XLM", "USDC"];
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

function explorerTxUrl(hash) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

function explorerContractUrl(contractId) {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
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

function commitmentFmt(point) {
  if (!point) return null;
  const hex = (v) => BigInt(v).toString(16).padStart(64, "0");
  return `0x${hex(point[0])}…${hex(point[1]).slice(-8)}`;
}

// ── component ──────────────────────────────────────────────────────────────────
export default function App() {
  const [wallet, setWallet] = useState(null);   // { address, walletAdapter }
  const [piilo, setPiilo]   = useState(null);
  const [asset, setAsset]         = useState("XLM");
  const [balance, setBalance]     = useState(null);
  const [onChain, setOnChain]     = useState(null); // { balance_commitment, has_pending }
  const [fees, setFees]           = useState(null); // { depositFeeBps, withdrawFeeBps, transferFlatFee }
  const [contractId, setContractId] = useState(null);
  const [log, setLog]             = useState([]);
  const [busy, setBusy]           = useState(false);
  const [backupStale, setBackupStale] = useState(false);

  const [depositAmt, setDepositAmt]   = useState("100");
  const [transferTo, setTransferTo]   = useState("");
  const [transferAmt, setTransferAmt] = useState("50");

  const [page, setPage] = useState(() =>
    window.location.hash === "#auditor" ? "auditor" : "wallet"
  );

  const logRef = useRef(null);

  function navigate(p) {
    setPage(p);
    window.location.hash = p === "auditor" ? "auditor" : "";
  }

  // ── log ──────────────────────────────────────────────────────────────────────
  const emit = useCallback((msg, type = "info", href = null) => {
    const ts = new Date().toLocaleTimeString("en", { hour12: false });
    setLog((l) => [...l.slice(-49), { ts, msg, type, href }]);
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
        asset: selectedAsset,
        wallet: w.walletAdapter,
      });
      setPiilo(sdk);
      emit(`Connected as ${shortenAddr(w.address)} · ${selectedAsset}`, "ok");
      await Promise.all([
        refresh(sdk, w.address),
        sdk.getFees().then(setFees).catch(() => null),
        sdk.getContractId().then(setContractId).catch(() => null),
      ]);
    } catch (e) {
      emit(e.message, "error");
      setPiilo(null);
      setContractId(null);
    }
  }

  async function switchAsset(newAsset) {
    if (!wallet || busy || newAsset === asset) return;
    setAsset(newAsset);
    setBalance(null);
    setOnChain(null);
    setFees(null);
    setPiilo(null);
    setContractId(null);
    setBusy(true);
    emit(`Switching to ${newAsset}…`);
    await initSdk(wallet, newAsset);
    setBusy(false);
  }

  // ── refresh state ─────────────────────────────────────────────────────────────
  async function refresh(sdk, address) {
    if (!sdk) return;
    try {
      const [bal, chain] = await Promise.all([
        sdk.getBalance(),
        sdk.getAccount(address).catch(() => null),
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
      if (result && typeof result === "object" && result.msg) {
        emit(result.msg, "ok", result.href ?? null);
      } else {
        emit(result ?? `${label} done`, "ok");
      }
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
      const txHash = await piilo.deposit(stroops);
      const fee = fees ? stroops * BigInt(fees.depositFeeBps) / 10_000n : 0n;
      const credited = stroops - fee;
      const msg = fee > 0n
        ? `Deposited ${depositAmt} ${asset} — credited ${tokenFmt(credited, asset)} (fee ${tokenFmt(fee, asset)})`
        : `Deposited ${depositAmt} ${asset}`;
      return { msg, href: explorerTxUrl(txHash) };
    }, { mutatesBalance: true });

  const handleTransfer = () =>
    op("Transfer", async () => {
      const stroops = BigInt(Math.round(parseFloat(transferAmt) * 1e7));
      const txHash = await piilo.transfer({ to: transferTo, amount: stroops });
      return { msg: `Sent ${transferAmt} ${asset} → ${shortenAddr(transferTo)}`, href: explorerTxUrl(txHash) };
    }, { mutatesBalance: true });

  const handleSettle = () =>
    op("Settle", async () => {
      const result = await piilo.settleIfPending();
      if (!result) return "No pending balance";
      return { msg: `Settled +${tokenFmt(result.received, asset)}`, href: explorerTxUrl(result.txHash) };
    }, { mutatesBalance: true });

  const handleWithdraw = () =>
    op("Withdraw", async () => {
      const { payout, txHash } = await piilo.withdraw();
      return { msg: `Withdrawn — you received ${tokenFmt(payout, asset)}`, href: explorerTxUrl(txHash) };
    }, { mutatesBalance: true });

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
      emit(`Backup restored — balance: ${tokenFmt(balance, asset)}`, "ok");
      await refresh(piilo, wallet.address);
    } catch (err) {
      emit(`Import failed: ${err.message}`, "error");
    }
    e.target.value = "";
    setBusy(false);
  };

  // ── fee preview helpers ────────────────────────────────────────────────────────
  function depositFeePreview(amtXlm) {
    if (!fees || !amtXlm || isNaN(parseFloat(amtXlm))) return null;
    const stroops = BigInt(Math.round(parseFloat(amtXlm) * 1e7));
    const fee = stroops * BigInt(fees.depositFeeBps) / 10_000n;
    if (fee === 0n) return null;
    return { fee, credited: stroops - fee };
  }

  function withdrawFeePreview() {
    if (!fees || balance == null || balance === 0n) return null;
    const fee = balance * BigInt(fees.withdrawFeeBps) / 10_000n;
    if (fee === 0n) return null;
    return { fee, payout: balance - fee };
  }

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
            <div className="logo-tag">confidential wallet · powered by @neylanxyz/piilo</div>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-tab ${page === "wallet" ? "nav-tab-active" : ""}`}
            onClick={() => navigate("wallet")}
          >
            Wallet
          </button>
          <button
            className={`nav-tab nav-tab-auditor ${page === "auditor" ? "nav-tab-active nav-tab-auditor-active" : ""}`}
            onClick={() => navigate("auditor")}
          >
            Auditor
          </button>
        </nav>

        {page === "wallet" && (
          <div className="header-right">
            {wallet && (
              <div className="token-selector">
                {SUPPORTED_ASSETS.map((a) => (
                  <button
                    key={a}
                    className={`token-tab ${asset === a ? "token-tab-active" : ""}`}
                    onClick={() => switchAsset(a)}
                    disabled={busy}
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
        )}
        {page === "auditor" && <div style={{ width: 160 }} />}
      </header>

      {page === "auditor" && <AuditorPage />}

      {page === "wallet" && <main>
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
                    {balance != null ? tokenFmt(balance, asset) : "—"}
                  </div>
                </div>
                <div className="reveal-divider">vs</div>
                <div className="reveal-col">
                  <div className="reveal-label">
                    ON-CHAIN (everyone sees)
                    {contractId && (
                      <a
                        href={explorerContractUrl(contractId)}
                        target="_blank"
                        rel="noreferrer"
                        className="chain-link"
                      >
                        view on chain ↗
                      </a>
                    )}
                  </div>
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
                  disabled={busy || !piilo}
                >
                  Deposit
                </button>
              </div>
              {depositFeePreview(depositAmt) && (() => {
                const { fee, credited } = depositFeePreview(depositAmt);
                return (
                  <div className="fee-hint">
                    Fee {tokenFmt(fee, asset)} ({fees.depositFeeBps / 100}%) · credited {tokenFmt(credited, asset)}
                  </div>
                );
              })()}
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
                    disabled={busy || !piilo || !transferTo}
                  >
                    Send
                  </button>
                </div>
              </div>
              {fees != null && fees.transferFlatFee > 0n && (
                <div className="fee-hint">
                  Flat fee {tokenFmt(fees.transferFlatFee, asset)} charged from your public wallet
                </div>
              )}
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
                disabled={busy || !piilo}
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
                disabled={busy || !piilo || !balance}
              >
                Withdraw {balance ? tokenFmt(balance, asset) : ""}
              </button>
              {withdrawFeePreview() && (() => {
                const { fee, payout } = withdrawFeePreview();
                return (
                  <div className="fee-hint">
                    Fee {tokenFmt(fee, asset)} ({fees.withdrawFeeBps / 100}%) · you receive {tokenFmt(payout, asset)}
                  </div>
                );
              })()}
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
                  disabled={busy || !piilo}
                >
                  {backupStale ? "⬇ Update backup now" : "Download backup"}
                </button>
                <label className={`btn btn-secondary ${busy || !piilo ? "disabled" : ""}`}>
                  Restore from backup
                  <input
                    type="file"
                    accept=".json,application/json"
                    style={{ display: "none" }}
                    onChange={handleImport}
                    disabled={busy || !piilo}
                  />
                </label>
              </div>
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
                    {entry.href && (
                      <a href={entry.href} target="_blank" rel="noreferrer" className="log-link">
                        view on chain ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </main>}
    </div>
  );
}
