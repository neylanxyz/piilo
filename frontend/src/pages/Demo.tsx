import { useState, useEffect, useRef } from 'react'
import '../styles/demo.css'

// Pre-tokenized lines — null = blank line, string = plain line
type Line = React.ReactNode | null
const CODE_LINES: Line[] = [
  <><span className="kw">import</span>{' { '}<span className="id">Piilo</span>{' } '}<span className="kw">from</span>{' '}<span className="st">'@neylanxyz/piilo'</span></>,
  null,
  <><span className="kw">const</span>{' '}<span className="id">piilo</span>{' = '}<span className="kw">new</span>{' '}<span className="id">Piilo</span>{'({'}</>,
  <>{'  '}<span className="id">network</span>{': '}<span className="st">'testnet'</span>{','}</>,
  <>{'  '}<span className="id">asset</span>{':   '}<span className="st">'XLM'</span>{','}</>,
  <>{'  '}<span className="id">wallet</span>{',  '}<span className="cm">{'// FreighterAPI or any WalletAdapter'}</span></>,
  <>{'})'}</>,
  null,
  <><span className="cm">{'// Deposit 5 XLM — visible on-chain (voluntary entry)'}</span></>,
  <><span className="kw">await</span>{' '}<span className="id">piilo</span>{'.'}<span className="mt">deposit</span>{'('}<span className="nm">50_000_000n</span>{')'}</>,
  null,
  <><span className="cm">{'// Transfer privately — amount hidden from chain observers'}</span></>,
  <><span className="kw">await</span>{' '}<span className="id">piilo</span>{'.'}<span className="mt">transfer</span>{'({ '}<span className="id">to</span>{': '}<span className="st">'G…Bob'</span>{', '}<span className="id">amount</span>{': '}<span className="nm">20_000_000n</span>{' })'}</>,
  null,
  <><span className="kw">await</span>{' '}<span className="id">piilo</span>{'.'}<span className="mt">settleIfPending</span>{'()'}<span className="cm">{'  // receive incoming'}</span></>,
  <><span className="kw">await</span>{' '}<span className="id">piilo</span>{'.'}<span className="mt">withdraw</span>{'()'}<span className="cm">{'             // exit privacy'}</span></>,
]

const TERM_STEPS = [
  { delay: 400,  text: '$ npm install @neylanxyz/piilo', cls: 'term-cmd' },
  { delay: 1200, text: '⠸ resolving packages…',          cls: 'term-muted' },
  { delay: 2400, text: 'added 3 packages in 1.2s',       cls: 'term-muted' },
  { delay: 3000, text: '✓ @neylanxyz/piilo@0.1.2',       cls: 'term-ok' },
]

function useIntersection(ref: React.RefObject<Element>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.25 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
  return visible
}

export function Demo() {
  // Terminal
  const [termStep, setTermStep] = useState(-1)
  useEffect(() => {
    TERM_STEPS.forEach((s, i) => {
      setTimeout(() => setTermStep(i), s.delay)
    })
  }, [])

  // Code typewriter — starts when section scrolls into view
  const codeRef = useRef<HTMLDivElement>(null!)
  const codeVisible = useIntersection(codeRef)
  const [revealed, setRevealed] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!codeVisible || started.current) return
    started.current = true
    let i = 0
    const id = setInterval(() => {
      i++
      setRevealed(i)
      if (i >= CODE_LINES.length) clearInterval(id)
    }, 110)
    return () => clearInterval(id)
  }, [codeVisible])

  // Scroll reveal
  const sectRefs = [useRef<HTMLDivElement>(null!), useRef<HTMLDivElement>(null!)]
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') })
    }, { threshold: 0.12 })
    sectRefs.forEach(r => r.current && obs.observe(r.current))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="demo-page">

      {/* ── HERO ── */}
      <section className="demo-hero">
        <p className="section-label">developer demo</p>
        <h1 className="demo-h1">
          Confidential payments.<br />
          <span className="demo-h1-accent">Six lines of code.</span>
        </h1>
        <p className="demo-sub">
          No ZK knowledge required. The SDK handles Groth16 proof generation,
          JubJub commitments, and payment note encryption — you just call{' '}
          <code className="inline-code">transfer()</code>.
        </p>

        {/* Terminal */}
        <div className="demo-terminal">
          <div className="term-bar">
            <span className="code-dot" />
            <span className="code-dot" />
            <span className="code-dot" />
            <span className="term-title">terminal</span>
          </div>
          <div className="term-body">
            {TERM_STEPS.map((s, i) => (
              <div key={i} className={`term-line ${s.cls} ${termStep >= i ? 'term-show' : ''}`}>
                {s.text}
              </div>
            ))}
            {termStep >= TERM_STEPS.length - 1 && (
              <div className="term-line term-cmd term-show">{'>'}<span className="term-cursor" /></div>
            )}
          </div>
        </div>
      </section>

      {/* ── CODE ── */}
      <section className="section demo-code-section reveal" ref={sectRefs[0]}>
        <div className="demo-code-grid" ref={codeRef}>
          <div className="demo-code-text">
            <p className="section-label">sdk</p>
            <h2 className="section-h2 demo-code-h2">One import.<br />Full privacy.</h2>
            <p className="code-desc">
              Install from npm and start building. Circuit files are loaded
              from CDN automatically — no WASM bundler config, no trusted
              setup to run, no cryptography to understand.
            </p>
            <div className="demo-badges">
              <span className="demo-badge">Groth16 proofs</span>
              <span className="demo-badge">JubJub commitments</span>
              <span className="demo-badge">BLS12-381</span>
              <span className="demo-badge">Stellar Testnet</span>
            </div>
            <div className="demo-links">
              <a href="/docs/quickstart.html" className="code-link">
                Quickstart guide →
              </a>
              <a href="/docs/api/piilo-class.html" className="code-link">
                API reference →
              </a>
            </div>
          </div>

          <div className="code-window demo-code-window">
            <div className="code-bar">
              <span className="code-dot" />
              <span className="code-dot" />
              <span className="code-dot" />
              <span className="code-file">payments.ts</span>
            </div>
            <div className="code-body demo-code-body">
              {CODE_LINES.slice(0, revealed).map((line, i) =>
                line === null
                  ? <div key={i} className="demo-blank-line"> </div>
                  : <div key={i} className="demo-code-line">{line}</div>
              )}
              {revealed < CODE_LINES.length && (
                <span className="demo-cursor" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section className="section reveal" ref={sectRefs[1]}>
        <div className="demo-examples-header">
          <p className="section-label">live on testnet</p>
          <h2 className="section-h2">See it running.</h2>
          <p className="demo-examples-sub">
            Both examples use <code className="inline-code">@neylanxyz/piilo</code> and
            run against real Soroban contracts on Stellar Testnet.
          </p>
        </div>

        <div className="demo-examples-grid">
          <a href="/examples/confidential-wallet/index.html" className="demo-example-card">
            <div className="demo-example-top">
              <span className="example-card-badge">wallet</span>
              <span className="demo-example-arrow">↗</span>
            </div>
            <h3 className="demo-example-title">Confidential Wallet</h3>
            <p className="demo-example-desc">
              Deposit XLM or USDC, send privately to any Stellar address,
              settle incoming transfers, and withdraw. Watch the on-chain
              commitment vs your local balance side-by-side.
            </p>
            <div className="demo-example-stack">
              <span>deposit</span><span>transfer</span><span>settle</span><span>withdraw</span>
            </div>
          </a>

          <a href="/examples/confidential-payroll/index.html" className="demo-example-card">
            <div className="demo-example-top">
              <span className="example-card-badge example-card-badge-payroll">payroll</span>
              <span className="demo-example-arrow">↗</span>
            </div>
            <h3 className="demo-example-title">Confidential Payroll</h3>
            <p className="demo-example-desc">
              Pay multiple recipients confidentially. Each recipient sees only
              their own amount — the total payroll is never visible on-chain.
              Approve each transfer in Freighter.
            </p>
            <div className="demo-example-stack">
              <span>multi-recipient</span><span>confidential</span><span>USDC</span>
            </div>
          </a>
        </div>

        <div className="demo-ctas">
          <a href="/docs/introduction.html" className="btn btn-primary">Read the docs</a>
          <a href="https://github.com/neylanxyz/piilo" target="_blank" rel="noopener" className="btn btn-ghost">
            View on GitHub
          </a>
        </div>
      </section>

    </div>
  )
}
