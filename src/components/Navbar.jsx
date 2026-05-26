import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { label: 'Home',         href: '/' },
  { label: 'About',        id: 'impact' },
  { label: 'Our Team',     id: 'backed' },
  { label: 'Portfolio',    id: 'portfolio' },
  { label: 'Careers',      id: 'offer' },
  { label: 'Work With Us', href: '#', dropdown: true },
  { label: 'Blog',         href: '#' },
  { label: 'Contact Us',   id: 'apply' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const [hidden,     setHidden]     = useState(false)
  const [active,     setActive]     = useState('home')
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      if (y < 120) {
        setHidden(false)
      } else {
        setHidden(y > lastY)
      }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Section-tracking disabled — "Home" stays active until other pages are wired up
  useEffect(() => { setActive(isHome ? 'home' : '') }, [isHome])

  const go = (id) => {
    setMobileOpen(false)
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#' + id
    }
  }

  return (
    <>
      <nav className={`nav${scrolled ? ' is-scrolled' : ''}${hidden && !mobileOpen ? ' is-hidden' : ''}`} id="nav">

        {/* LOGO */}
        <Link className="nav-logo" to="/" onClick={() => setMobileOpen(false)}>
          <img src="/pv-favicon.png" alt="" />
          <span>Persist</span>
        </Link>

        {/* CENTER PILL — desktop only */}
        <div className="nav-pill" aria-label="Navigation">
          {LINKS.map(({ label, id, href, dropdown }) => (
            <a
              key={label}
              href={id ? (isHome ? `#${id}` : `/#${id}`) : href}
              className={`nav-pill-link${(label === 'Home' && active === 'home') ? ' is-active' : ''}`}
              onClick={id ? (e) => { e.preventDefault(); go(id) } : undefined}
            >
              {label}
              {dropdown && (
                <svg className="nav-pill-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </a>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="nav-right">
          <button className="nav-cta" data-magnetic onClick={() => go('apply')}>
            Apply For Fellowship
            <svg className="nav-cta-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            className={`nav-hamburger${mobileOpen ? ' is-open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE FULLSCREEN MENU */}
      <div className={`nav-mobile${mobileOpen ? ' is-open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="nav-mobile-head">
          <Link className="nav-logo" to="/" onClick={() => setMobileOpen(false)}>
            <img src="/pv-favicon.png" alt="" />
            <span>Persist</span>
          </Link>
          <button
            className="nav-hamburger is-open"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>

        <nav className="nav-mobile-links">
          {LINKS.map(({ label, id, href, dropdown }, i) => (
            <a
              key={label}
              href={id ? (isHome ? `#${id}` : `/#${id}`) : href}
              className={`nav-mobile-link${mobileOpen ? ' is-visible' : ''}`}
              style={{ transitionDelay: mobileOpen ? `${80 + i * 55}ms` : '0ms' }}
              onClick={() => { if (id) go(id); else setMobileOpen(false) }}
            >
              <span className="nav-mobile-num">{String(i + 1).padStart(2, '0')}</span>
              {label}
              {dropdown && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{marginLeft: '6px', opacity: 0.6}}>
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </a>
          ))}
        </nav>

        <button
          className={`nav-mobile-cta${mobileOpen ? ' is-visible' : ''}`}
          style={{ transitionDelay: mobileOpen ? '360ms' : '0ms' }}
          onClick={() => go('apply')}
        >
          Apply For Fellowship
          <svg viewBox="0 0 16 16" fill="none" width="15" height="15" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {mobileOpen && <div className="nav-backdrop" onClick={() => setMobileOpen(false)} />}
    </>
  )
}
