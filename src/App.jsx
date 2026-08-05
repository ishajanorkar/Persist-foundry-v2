import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import CustomCursor from './components/CustomCursor'
import ExternalRedirect from './components/ExternalRedirect'
import Foundry from './pages/Foundry'
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from './data/legalPages'

/* Foundry home is eager — other routes code-split for faster phones */
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Team = lazy(() => import('./pages/Team'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const PortfolioCompany = lazy(() => import('./pages/PortfolioCompany'))
const Careers = lazy(() => import('./pages/Careers'))
const Contact = lazy(() => import('./pages/Contact'))
const ApplicationForm = lazy(() => import('./pages/ApplicationForm'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const FinalCtaSection = lazy(() => import('./components/FinalCtaSection'))

const STARTUPATHON_URL = 'https://startupathon.persist.org/'

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
  if (/^\/portfolio\/[^/]+\/?$/.test(pathname)) return true
  return false
}

function RouteFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      style={{
        minHeight: '40vh',
        background: '#07050f',
      }}
    />
  )
}

function Layout() {
  const { pathname } = useLocation()
  const foundryHome = pathname === '/'
  const isLegal = pathname === '/terms-of-service' || pathname === '/privacy-policy'
  const isExternalRedirect = pathname === '/startupathon' || pathname.startsWith('/startupathon/')
  const known = isKnownRoute(pathname)
  const showGlobalCta = known && !foundryHome && pathname !== '/legacy' && !isLegal

  return (
    <>
      {!isExternalRedirect && <CustomCursor />}
      {!isExternalRedirect && <Navbar />}
      <Suspense fallback={<RouteFallback />}>
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
            path="/startupathon"
            element={<ExternalRedirect to={STARTUPATHON_URL} />}
          />
          <Route
            path="/startupathon/*"
            element={<ExternalRedirect to={STARTUPATHON_URL} />}
          />
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
      </Suspense>
      {!foundryHome && !showGlobalCta && !isExternalRedirect && <Footer />}
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
