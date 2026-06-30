import { useI18n } from '../i18n'
import { LangSwitcher } from './LangSwitcher'
import logo from '../../assets/logo.png'

export function Nav() {
  const { t } = useI18n()
  return (
    <nav className="nav">
      <a href="#" className="nav-brand">
        <img className="nav-logo-mark" src={logo} alt="Piilo" />
        <span className="nav-wordmark">Piilo</span>
      </a>
      <ul className="nav-links">
        <li><a href="#demo">Demo</a></li>
        <li><a href="/docs/introduction.html">{t('nav.docs')}</a></li>
        <li><a href="#examples">{t('nav.examples')}</a></li>
        <li><a href="https://github.com/neylanxyz/piilo" target="_blank" rel="noopener">{t('nav.github')}</a></li>
        <li><LangSwitcher /></li>
      </ul>
    </nav>
  )
}
