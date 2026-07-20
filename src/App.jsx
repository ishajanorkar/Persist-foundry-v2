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

// The cinematic Foundry landing ships its own nav + footer, so the shared
// chrome is suppressed on that route.
const BARE_ROUTES = ['/']

function Layout() {
  const { pathname } = useLocation()
  const bare = BARE_ROUTES.includes(pathname)
  return (
    <>
      {!bare && <Navbar />}
      <Routes>
        <Route path="/" element={<Foundry />} />
        <Route path="/legacy" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<PortfolioCompany />} />
      </Routes>
      {!bare && <Footer />}
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
