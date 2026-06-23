import { useI18n } from '../i18n'

export function Examples() {
  const { t } = useI18n()

  return (
    <section className="examples-page">
      <div className="examples-header">
        <p className="section-label">live demos</p>
        <h1 className="examples-h1" dangerouslySetInnerHTML={{ __html: t('examples.h1') }} />
        <p className="examples-sub">{t('examples.sub')}</p>
      </div>

      <div className="examples-grid">
        <div className="example-card">
          <div className="example-card-badge">wallet</div>
          <h2 className="example-card-title">{t('examples.wallet.title')}</h2>
          <p className="example-card-desc">{t('examples.wallet.desc')}</p>
          <ul className="example-feature-list">
            <li>{t('examples.wallet.f1')}</li>
            <li>{t('examples.wallet.f2')}</li>
            <li>{t('examples.wallet.f3')}</li>
            <li>{t('examples.wallet.f4')}</li>
          </ul>
          <a href="/examples/confidential-wallet/index.html" className="btn btn-primary example-cta">
            {t('examples.wallet.cta')}
          </a>
        </div>

        <div className="example-card">
          <div className="example-card-badge example-card-badge-payroll">payroll</div>
          <h2 className="example-card-title">{t('examples.payroll.title')}</h2>
          <p className="example-card-desc">{t('examples.payroll.desc')}</p>
          <ul className="example-feature-list">
            <li>{t('examples.payroll.f1')}</li>
            <li>{t('examples.payroll.f2')}</li>
            <li>{t('examples.payroll.f3')}</li>
            <li>{t('examples.payroll.f4')}</li>
          </ul>
          <a href="/examples/confidential-payroll/index.html" className="btn btn-primary example-cta">
            {t('examples.payroll.cta')}
          </a>
        </div>
      </div>

      <div className="examples-note">
        <span className="examples-note-label">testnet only</span>
        {t('examples.note')}
      </div>
    </section>
  )
}
