import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/not-found.css'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/careers', label: 'Careers' },
  { to: '/contact', label: 'Contact' },
]

export default function NotFound() {
  useEffect(() => {
    document.body.classList.add('is-loaded')
    document.title = 'Page not found — Persist | Advancing Greatness'
    return () => {
      document.title = 'Persist | Advancing Greatness'
    }
  }, [])

  return (
    <main className="nf-page" aria-labelledby="nf-title">
      <div className="nf-grid" aria-hidden="true" />
      <div className="ab-blob ab-blob-1" aria-hidden="true" />
      <div className="ab-blob ab-blob-2" aria-hidden="true" />
      <div className="nf-vignette" aria-hidden="true" />

      <div className="nf-inner">
        <p className="nf-eyebrow">404</p>
        <h1 id="nf-title" className="nf-title">
          This page doesn&apos;t exist.
        </h1>
        <p className="nf-sub">
          The link may be broken, or the page may have moved. Head home — or pick
          another path below.
        </p>

        <div className="nf-actions">
          <Link to="/" className="btn-primary nf-home-btn">
            Back to home
            <svg
              className="btn-arrow"
              viewBox="0 0 16 16"
              fill="none"
              width="15"
              height="15"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <nav className="nf-links" aria-label="Helpful links">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="nf-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
