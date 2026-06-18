import { I18nProvider } from './i18n'
import { Nav } from './components/Nav'
import { Footer } from './components/Footer'
import { Landing } from './pages/Landing'
import './styles/global.css'
import './styles/landing.css'

export default function App() {
  return (
    <I18nProvider>
      <Nav />
      <main>
        <Landing />
      </main>
      <Footer />
    </I18nProvider>
  )
}
