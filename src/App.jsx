import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Foundry from './pages/Foundry'
import About from './pages/About'
import Team from './pages/Team'
import Portfolio from './pages/Portfolio'
import PortfolioCompany from './pages/PortfolioCompany'
import Careers from './pages/Careers'

function Layout() {
  const { pathname } = useLocation()
  // Foundry home embeds the footer inside its scroll-track so it sits
  // above the fixed cinematic stage. Other routes use the shared one.
  const foundryHome = pathname === '/'
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Foundry />} />
        <Route path="/legacy" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<PortfolioCompany />} />
        <Route path="/careers" element={<Careers />} />
      </Routes>
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
