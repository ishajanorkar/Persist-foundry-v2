import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import CustomCursor from './components/CustomCursor'
import FinalCtaSection from './components/FinalCtaSection'
import Home from './pages/Home'
import Foundry from './pages/Foundry'
import About from './pages/About'
import Team from './pages/Team'
import Portfolio from './pages/Portfolio'
import PortfolioCompany from './pages/PortfolioCompany'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import ApplicationForm from './pages/ApplicationForm'
import LegalPage from './pages/LegalPage'
import NotFound from './pages/NotFound'
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from './data/legalPages'

const KNOWN_PATHS = new Set([
  '/',
  '/legacy',
  '/about',
  '/team',
  '/portfolio',
  '/careers',
  '/contact',
  '/apply-for-a-full-time-position',
  '/apply-to-cofoundathon',
  '/investor-application',
  '/fellowship-program-application',
  '/terms-of-service',
  '/privacy-policy',
])

function isKnownRoute(pathname) {
  if (KNOWN_PATHS.has(pathname)) return true
  // Portfolio company detail pages
  if (/^\/portfolio\/[^/]+\/?$/.test(pathname)) return true
  return false
}

function Layout() {
  const { pathname } = useLocation()
  // Foundry home embeds CTA+footer in its scroll track.
  const foundryHome = pathname === '/'
  const isLegal = pathname === '/terms-of-service' || pathname === '/privacy-policy'
  const known = isKnownRoute(pathname)
  // Same homepage FinalCtaSection (with nested Footer) on every other content route.
  // Skip on 404 / unknown URLs so the not-found page stays the focus.
  const showGlobalCta = known && !foundryHome && pathname !== '/legacy' && !isLegal
  return (
    <>
      <CustomCursor />
      <Navbar />
      <Routes>
        <Route path="/" element={<Foundry />} />
        <Route path="/legacy" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<PortfolioCompany />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/apply-for-a-full-time-position"
          element={<ApplicationForm formKey="fullTime" />}
        />
        <Route
          path="/apply-to-cofoundathon"
          element={<ApplicationForm formKey="cofoundathon" />}
        />
        <Route
          path="/investor-application"
          element={<ApplicationForm formKey="investor" />}
        />
        <Route
          path="/fellowship-program-application"
          element={<ApplicationForm formKey="fellowship" />}
        />
        <Route
          path="/terms-of-service"
          element={<LegalPage doc={TERMS_OF_SERVICE} />}
        />
        <Route
          path="/privacy-policy"
          element={<LegalPage doc={PRIVACY_POLICY} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showGlobalCta && <FinalCtaSection footer />}
      {/* Legal / 404 / legacy still need a standalone footer (CTA carries its own on other routes) */}
      {!foundryHome && !showGlobalCta && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout />
    </BrowserRouter>
  )
}
