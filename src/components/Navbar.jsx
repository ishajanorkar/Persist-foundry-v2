import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  const scrollTo = (id) => {
    setMobileOpen(false)
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#' + id
    }
  }

  return (
    <>
      <nav className="nav" id="nav">
        <div className="nav-logo">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img src="/assets/persist-foundry-logo.webp" alt="Persist Foundry" />
          </Link>
        </div>

        <div className="nav-links">
          <a href={isHome ? '#impact' : '/#impact'}>Impact</a>
          <a href={isHome ? '#offer' : '/#offer'}>Offer</a>
          <a href={isHome ? '#filter' : '/#filter'}>Apply</a>
          <a href={isHome ? '#portfolio' : '/#portfolio'}>Portfolio</a>
          <a href={isHome ? '#backed' : '/#backed'}>Backed</a>
        </div>

        <button
          className="nav-cta"
          data-magnetic
          onClick={() => scrollTo('apply')}
        >
          Apply For Fellowship
        </button>

        <button
          className={`nav-hamburger${mobileOpen ? ' is-open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`nav-mobile${mobileOpen ? ' is-open' : ''}`}>
        <a href={isHome ? '#impact' : '/#impact'} onClick={() => setMobileOpen(false)}>Impact</a>
        <a href={isHome ? '#offer' : '/#offer'} onClick={() => setMobileOpen(false)}>Offer</a>
        <a href={isHome ? '#filter' : '/#filter'} onClick={() => setMobileOpen(false)}>Apply</a>
        <a href={isHome ? '#portfolio' : '/#portfolio'} onClick={() => setMobileOpen(false)}>Portfolio</a>
        <a href={isHome ? '#backed' : '/#backed'} onClick={() => setMobileOpen(false)}>Backed</a>
        <button
          className="nav-cta nav-cta-mobile"
          onClick={() => scrollTo('apply')}
        >
          Apply For Fellowship
        </button>
      </div>

      {/* BACKDROP */}
      {mobileOpen && (
        <div className="nav-backdrop" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
