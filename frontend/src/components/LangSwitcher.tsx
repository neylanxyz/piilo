import { useI18n, type Lang } from '../i18n'

const LANGS: Lang[] = ['en', 'es', 'pt']

export function LangSwitcher() {
  const { lang, setLang } = useI18n()
  return (
    <div className="i18n-switcher">
      {LANGS.map((l) => (
        <button
          key={l}
          className={`i18n-btn${lang === l ? ' active' : ''}`}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
