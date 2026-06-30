import { useState, useEffect } from 'react'
import { I18nProvider } from './i18n'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Landing } from './pages/Landing'
import { Examples } from './pages/Examples'
import { Demo } from './pages/Demo'
import './styles/global.css'
import './styles/landing.css'

function currentPage() {
  const h = window.location.hash
  if (h === '#examples') return 'examples'
  if (h === '#demo') return 'demo'
  return 'home'
}

export default function App() {
  const [page, setPage] = useState(currentPage)

  useEffect(() => {
    const handler = () => setPage(currentPage())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  return (
    <I18nProvider>
      <Nav />
      <main>
        {page === 'examples' ? <Examples /> : page === 'demo' ? <Demo /> : <Landing />}
      </main>
      <Footer />
    </I18nProvider>
  )
}
