import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n'
import logo from '../../assets/logo.png'

function T({ k }: { k: Parameters<ReturnType<typeof useI18n>['t']>[0] }) {
  const { t } = useI18n()
  return <span dangerouslySetInnerHTML={{ __html: t(k) }} />
}

export function Landing() {
  const { t } = useI18n()
  const revealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-visual">
          <div className="logo-stage">
            <div className="logo-ring" />
            <div className="logo-ring logo-ring-2" />
            <img className="logo-mark-svg" src={logo} alt="Piilo logo" />
          </div>
        </div>

        <div className="hero-text">
          <p className="hero-eyebrow">// Stellar · Soroban · ZK</p>
          <h1 className="hero-h1" dangerouslySetInnerHTML={{ __html: t('hero.headline') }} />
          <p className="hero-sub" dangerouslySetInnerHTML={{ __html: t('hero.sub') }} />
          <div className="hero-ctas">
            <a href="/docs/introduction.html" className="btn btn-primary">{t('hero.cta.primary')}</a>
            <a href="#examples" className="btn btn-ghost">{t('hero.cta.secondary')}</a>
          </div>
          <div className="hero-stat-strip">
            <div className="stat">
              <div className="stat-val">Groth16</div>
              <div className="stat-label">proof system</div>
            </div>
            <div className="stat">
              <div className="stat-val">JubJub</div>
              <div className="stat-label">commitment curve</div>
            </div>
            <div className="stat">
              <div className="stat-val">XLM + USDC</div>
              <div className="stat-label">multi-token</div>
            </div>
            <div className="stat">
              <div className="stat-val">auditor</div>
              <div className="stat-label">compliance hook</div>
            </div>
          </div>
        </div>

        <a href="#how-it-works" className="scroll-hint" aria-label="Scroll down">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════ */}
      <section className="section" id="how-it-works">
        <div className="how-header reveal">
          <p className="section-label">protocol flow</p>
          <h2 className="section-h2" dangerouslySetInnerHTML={{ __html: t('how.h2') }} />
        </div>

        <div className="flow">
          <div className="flow-step reveal rd1">
            <div className="flow-step-id"><span>1</span> {t('how.step1.id')}</div>
            <h3 className="flow-title">{t('how.step1.title')}</h3>
            <p className="flow-body">{t('how.step1.body')}</p>
            <span className="flow-badge badge-visible">{t('how.step1.badge')}</span>
          </div>
          <div className="flow-arrow reveal rd2">→</div>
          <div className="flow-step reveal rd2">
            <div className="flow-step-id"><span>2</span> {t('how.step2.id')}</div>
            <h3 className="flow-title">{t('how.step2.title')}</h3>
            <p className="flow-body">{t('how.step2.body')}</p>
            <span className="flow-badge badge-hidden">{t('how.step2.badge')}</span>
          </div>
          <div className="flow-arrow reveal rd3">→</div>
          <div className="flow-step reveal rd3">
            <div className="flow-step-id"><span>3</span> {t('how.step3.id')}</div>
            <h3 className="flow-title">{t('how.step3.title')}</h3>
            <p className="flow-body">{t('how.step3.body')}</p>
            <span className="flow-badge badge-hidden">{t('how.step3.badge')}</span>
          </div>
        </div>
      </section>

      {/* ═══ SDK SNIPPET ════════════════════════════════════ */}
      <section className="section" id="sdk">
        <div className="code-section">
          <div className="reveal">
            <p className="section-label">sdk</p>
            <h2 className="section-h2" dangerouslySetInnerHTML={{ __html: t('sdk.h2') }} />
            <p className="code-desc">{t('sdk.desc')}</p>
            <a href="/docs/quickstart.html" className="code-link">{t('sdk.cta')}</a>
          </div>

          <div className="code-window reveal rd1">
            <div className="code-bar">
              <div className="code-dot" /><div className="code-dot" /><div className="code-dot" />
              <span className="code-file">example.ts</span>
            </div>
            <div className="code-body">
              <span className="cm">{'// 1. initialise'}</span>{'\n'}
              <span className="kw">const</span>{' '}<span className="id">piilo</span>{' '}
              <span className="kw">=</span>{' '}<span className="kw">new</span>{' '}
              <span className="ac">Piilo</span>{'({\n'}
              {'  network: '}<span className="st">"testnet"</span>{',\n'}
              {'  asset:   '}<span className="st">"XLM"</span>{',' }<span className="cm">{'  // or "USDC"'}</span>{'\n'}
              {'  wallet,  '}<span className="cm">{'  // WalletAdapter'}</span>{'\n'}
              {'})\n\n'}
              <span className="cm">{'// 2. deposit XLM (amount is visible once)'}</span>{'\n'}
              <span className="kw">await</span>{' piilo.'}<span className="mt">deposit</span>{'('}
              <span className="nm">500n</span>{')\n\n'}
              <span className="cm">{'// 3. transfer privately — ZK proof generated here'}</span>{'\n'}
              <span className="kw">await</span>{' piilo.'}<span className="mt">transfer</span>
              {'({ to: '}<span className="st">"G…"</span>{', amount: '}<span className="nm">200n</span>{' })\n\n'}
              <span className="cm">{'// 4. settle incoming transfers'}</span>{'\n'}
              <span className="kw">await</span>{' piilo.'}<span className="mt">settleIfPending</span>{'()\n\n'}
              <span className="cm">{'// 5. withdraw — proves balance knowledge on-chain'}</span>{'\n'}
              <span className="kw">await</span>{' piilo.'}<span className="mt">withdraw</span>{'()'}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ROADMAP ════════════════════════════════════════ */}
      <section className="section" id="roadmap">
        <div className="roadmap-header reveal">
          <p className="section-label">{t('roadmap.label')}</p>
          <h2 className="section-h2" dangerouslySetInnerHTML={{ __html: t('roadmap.h2') }} />
        </div>

        <div className="roadmap-timeline">
          {([
            { vk: 'roadmap.v01.version', tk: 'roadmap.v01.title', bk: 'roadmap.v01.body', now: true },
            { vk: 'roadmap.v02.version', tk: 'roadmap.v02.title', bk: 'roadmap.v02.body', now: false },
            { vk: 'roadmap.v03.version', tk: 'roadmap.v03.title', bk: 'roadmap.v03.body', now: false },
            { vk: 'roadmap.v10.version', tk: 'roadmap.v10.title', bk: 'roadmap.v10.body', now: false },
            { vk: 'roadmap.v20.version', tk: 'roadmap.v20.title', bk: 'roadmap.v20.body', now: false },
          ] as const).map(({ vk, tk, bk, now }, i) => (
            <div key={vk} className={`roadmap-item reveal rd${(i % 4) + 1}${now ? ' roadmap-item--now' : ''}`}>
              <div className="roadmap-node">
                <div className="roadmap-dot" />
              </div>
              <div className="roadmap-content">
                <div className="roadmap-meta">
                  <span className="roadmap-version">{t(vk)}</span>
                  {now && <span className="roadmap-now-badge">{t('roadmap.now')}</span>}
                </div>
                <h3 className="roadmap-title">{t(tk)}</h3>
                <p className="roadmap-body">{t(bk)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEES ═══════════════════════════════════════════ */}
      <section className="section" id="fees">
        <div className="fees-header reveal">
          <p className="section-label">{t('fees.label')}</p>
          <h2 className="section-h2" dangerouslySetInnerHTML={{ __html: t('fees.h2') }} />
          <p className="fees-sub">{t('fees.sub')}</p>
        </div>

        <div className="fees-cards">
          {([
            { lk: 'fees.deposit.label',  fk: 'fees.deposit.fee',  dk: 'fees.deposit.desc'  },
            { lk: 'fees.transfer.label', fk: 'fees.transfer.fee', dk: 'fees.transfer.desc' },
            { lk: 'fees.withdraw.label', fk: 'fees.withdraw.fee', dk: 'fees.withdraw.desc' },
          ] as const).map(({ lk, fk, dk }, i) => (
            <div key={lk} className={`fee-card reveal rd${i + 1}`}>
              <span className="fee-card-label">{t(lk)}</span>
              <div className="fee-card-amount">{t(fk)}</div>
              <p className="fee-card-desc">{t(dk)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TECH SPEC ══════════════════════════════════════ */}
      <section className="section" id="tech">
        <div className="spec-header reveal">
          <p className="section-label">cryptographic primitives</p>
          <h2 className="section-h2">{t('spec.h2')}</h2>
        </div>

        <div className="spec-table">
          <div className="spec-row reveal rd1">
            <div className="spec-term">
              Groth16 ZK Proofs
              <span className="spec-term-sub">via snarkjs + circom</span>
            </div>
            <div className="spec-def">
              Transfer and withdrawal proofs are Groth16 SNARKs compiled with Circom and
              executed in-browser via snarkjs WASM. The on-chain Soroban contract
              contains a Rust BLS12-381 verifier — no trusted setup oracle, no server-side proving.
              <span className="spec-detail">circuits/transfer.circom · circuits/withdraw.circom</span>
            </div>
          </div>

          <div className="spec-row reveal rd2">
            <div className="spec-term">
              Pedersen Commitments
              <span className="spec-term-sub">JubJub curve · homomorphic</span>
            </div>
            <div className="spec-def">
              Balances are stored as{' '}
              <code className="inline-code">C = v·G + r·H</code>
              {' '}— a point on the JubJub twisted Edwards curve. Commitments are additively
              homomorphic: deposits and incoming transfers accumulate without revealing individual
              amounts. The blinding factor <code className="inline-code">r</code> lives only in
              your browser's local state.
              <span className="spec-detail">contracts/piilo/src/commitment.rs · packages/sdk/src/Piilo.ts</span>
            </div>
          </div>

          <div className="spec-row reveal rd3">
            <div className="spec-term">
              NaCl Note Encryption
              <span className="spec-term-sub">XSalsa20-Poly1305</span>
            </div>
            <div className="spec-def">
              When you send to a recipient, the SDK encrypts a payment note containing the
              transfer amount and blinding factor using NaCl box (XSalsa20-Poly1305).
              Note keypairs are derived deterministically from your wallet's signing key —
              no additional key storage required. The encrypted note is stored on-chain;
              only the recipient can decrypt it.
              <span className="spec-detail">packages/sdk/src/note.ts · tweetnacl</span>
            </div>
          </div>

          <div className="spec-row reveal rd4">
            <div className="spec-term">
              Soroban Contract
              <span className="spec-term-sub">Rust · BLS12-381 verifier</span>
            </div>
            <div className="spec-def">
              The on-chain contract stores commitment points, manages pending transfer queues,
              and verifies Groth16 proofs against compiled verification keys. All proof
              verification happens inside Soroban execution — there are no external oracle
              calls or trusted relayers. The verifier passes Stellar's published test vectors.
              <span className="spec-detail">contracts/piilo/src/lib.rs · contracts/verifier/src/lib.rs</span>
            </div>
          </div>

          <div className="spec-row reveal rd5">
            <div className="spec-term">
              {t('spec.auditor.term')}
              <span className="spec-term-sub">{t('spec.auditor.sub')}</span>
            </div>
            <div className="spec-def">
              {t('spec.auditor.def')}
              <span className="spec-detail">packages/sdk/src/auditor.ts · examples/confidential-wallet/src/AuditorPage.jsx</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
