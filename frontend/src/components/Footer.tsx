import { useI18n } from '../i18n'
import logo from '../../assets/logo.png'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer>
      <div className="footer-brand">
        <img className="footer-logo" src={logo} alt="Piilo" />
        <div className="footer-brand-text">
          <div className="footer-name">Piilo</div>
          <div className="footer-sub">{t('footer.tagline')}</div>
        </div>
      </div>
      <ul className="footer-links">
        <li><a href="/docs/introduction.html">{t('footer.links.docs')}</a></li>
        <li><a href="/docs/quickstart.html">{t('footer.links.quickstart')}</a></li>
        <li><a href="https://github.com/neylanxyz/piilo" target="_blank" rel="noopener">GitHub ↗</a></li>
      </ul>
    </footer>
  )
}
