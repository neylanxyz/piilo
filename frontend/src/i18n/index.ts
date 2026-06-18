import { createContext, useContext, useState, useEffect, type ReactNode, createElement } from 'react'
import en, { type I18nKey } from './en'
import es from './es'
import pt from './pt'

type Lang = 'en' | 'es' | 'pt'
type Dict = Record<I18nKey, string>

const dicts: Record<Lang, Dict> = { en, es, pt }
const LS_KEY = 'piilo-lang'

function detectLang(): Lang {
  const stored = localStorage.getItem(LS_KEY) as Lang | null
  if (stored && stored in dicts) return stored
  const browser = navigator.language.slice(0, 2).toLowerCase() as Lang
  if (browser in dicts) return browser
  return 'en'
}

interface I18nCtx {
  lang: Lang
  t: (key: I18nKey) => string
  setLang: (lang: Lang) => void
}

const Ctx = createContext<I18nCtx>({
  lang: 'en',
  t: (k) => en[k],
  setLang: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  function setLang(l: Lang) {
    localStorage.setItem(LS_KEY, l)
    setLangState(l)
    document.documentElement.setAttribute('lang', l)
  }

  const t = (key: I18nKey) => dicts[lang][key] ?? en[key]

  return createElement(Ctx.Provider, { value: { lang, t, setLang } }, children)
}

export function useI18n() {
  return useContext(Ctx)
}

export type { Lang, I18nKey }
