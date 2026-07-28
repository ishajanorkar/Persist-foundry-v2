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
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from './data/legalPages'

function Layout() {
  const { pathname } = useLocation()
  // Foundry embeds CTA+footer in its scroll track; legacy home has its own CTA.
  const foundryHome = pathname === '/'
  const isLegal = pathname === '/terms-of-service' || pathname === '/privacy-policy'
  const showGlobalCta = pathname !== '/' && pathname !== '/legacy' && !isLegal
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
      </Routes>
      {showGlobalCta && <FinalCtaSection footer={false} />}
      {!foundryHome && <Footer />}
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
