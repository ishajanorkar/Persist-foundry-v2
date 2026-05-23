import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { label: 'Impact',    id: 'impact' },
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Offer',     id: 'offer' },
  { label: 'Apply',     id: 'filter' },
  { label: 'Backed',    id: 'backed' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const [hidden,     setHidden]     = useState(false)
  const [active,     setActive]     = useState('')
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

  useEffect(() => {
    if (!isHome) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    LINKS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [isHome])

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
          {LINKS.map(({ label, id }) => (
            <a
              key={id}
              href={isHome ? `#${id}` : `/#${id}`}
              className={`nav-pill-link${active === id ? ' is-active' : ''}`}
            >
              {label}
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
          {LINKS.map(({ label, id }, i) => (
            <a
              key={id}
              href={isHome ? `#${id}` : `/#${id}`}
              className={`nav-mobile-link${mobileOpen ? ' is-visible' : ''}`}
              style={{ transitionDelay: mobileOpen ? `${80 + i * 55}ms` : '0ms' }}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-mobile-num">{String(i + 1).padStart(2, '0')}</span>
              {label}
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
