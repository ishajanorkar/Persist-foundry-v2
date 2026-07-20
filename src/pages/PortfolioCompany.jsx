import { useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  PORTFOLIO_CATEGORIES,
  getCompanyById,
  getCompanyIndex,
  getCompanyYear,
  getPortfolioThumbnail,
} from '../data/portfolio'

const LiIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M3.4 13.6V6.2H1V13.6h2.4ZM2.2 5.2A1.4 1.4 0 1 0 2.2 2.4 1.4 1.4 0 0 0 2.2 5.2Zm12.8 8.4V9.5c0-2.3-1.2-3.4-2.9-3.4-1.3 0-1.9.7-2.3 1.3V6.2H7.4v7.4h2.4V9.5c0-.2 0-.5.1-.6.2-.5.6-1 1.4-1 1 0 1.4.7 1.4 1.8v3.9H15Z" />
  </svg>
)

const TgIcon = () => (
  <span className="pf-detail-founder-links-icon pf-detail-founder-links-icon--telegram" aria-hidden="true" />
)

const WaIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1.3a6.7 6.7 0 0 0-5.8 10L1.3 14.7l3.5-1a6.7 6.7 0 1 0 3.2-12.4Zm0 12.1a5.4 5.4 0 0 1-2.8-.8l-.2-.1-2 .6.6-2-.1-.2a5.4 5.4 0 1 1 4.5 2.5Z" />
  </svg>
)

function FounderLinks({ founder }) {
  if (!founder.linkedin && !founder.telegram && !founder.whatsapp) return null
  return (
    <div className="pf-detail-founder-links">
      {founder.linkedin && (
        <a href={founder.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${founder.name} on LinkedIn`}>
          <LiIcon />
          <span>LinkedIn</span>
        </a>
      )}
      {founder.telegram && (
        <a href={founder.telegram} target="_blank" rel="noopener noreferrer" aria-label={`${founder.name} on Telegram`}>
          <TgIcon />
          <span>Telegram</span>
        </a>
      )}
      {founder.whatsapp && (
        <a href={founder.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`${founder.name} on WhatsApp`}>
          <WaIcon />
          <span>WhatsApp</span>
        </a>
      )}
    </div>
  )
}

function CompanyLogo({ company }) {
  const initials = company.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  if (company.logo) {
    return (
      <img
        src={company.logo}
        alt=""
        className={`pf-detail-logo-img${company.logoClass ? ` ${company.logoClass}` : ''}`}
      />
    )
  }
  return <span className="pf-detail-logo-fallback serif">{initials}</span>
}

function sectorLabel(tags) {
  return tags
    .map((tag) => PORTFOLIO_CATEGORIES.find((cat) => cat.id === tag)?.label)
    .filter(Boolean)
    .join(' · ')
}

export default function PortfolioCompany() {
  const { id } = useParams()
  const company = getCompanyById(id)
  const companyIndex = getCompanyIndex(id)
  const cursorRafRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('is-loaded', 'pf-page')

    const cursor = document.getElementById('cursor')
    let cursorX = 0
    let cursorY = 0
    let targetX = 0
    let targetY = 0
    const interactiveSel = 'a, button, .pf-detail-founder-links a'

    const trackMouse = (e) => {
      targetX = e.clientX
      targetY = e.clientY
    }
    document.addEventListener('mousemove', trackMouse, { passive: true })

    const tickCursor = () => {
      const dx = targetX - cursorX
      const dy = targetY - cursorY
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        cursorX += dx * 0.2
        cursorY += dy * 0.2
        if (cursor) cursor.style.transform = `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%)`
      }
      cursorRafRef.current = requestAnimationFrame(tickCursor)
    }
    cursorRafRef.current = requestAnimationFrame(tickCursor)

    const onOver = (e) => {
      if (e.target.closest(interactiveSel)) cursor?.classList.add('is-hover')
    }
    const onOut = (e) => {
      const from = e.target.closest(interactiveSel)
      const to = e.relatedTarget instanceof Element ? e.relatedTarget.closest(interactiveSel) : null
      if (from && !to) cursor?.classList.remove('is-hover')
    }
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      document.body.classList.remove('pf-page')
      document.removeEventListener('mousemove', trackMouse)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current)
      cursorRafRef.current = null
    }
  }, [])

  if (!company) {
    return <Navigate to="/portfolio" replace />
  }

  const year = getCompanyYear(company, companyIndex)
  const thumbnail = getPortfolioThumbnail(company.id)
  const founders = company.founders || []

  return (
    <>
      <div className="cursor" id="cursor" />
      <div className="progress" id="progress" />

      <article className="pf-detail">
      <div className="pf-detail-wrap">
        <nav className="pf-detail-crumb" aria-label="Breadcrumb">
          <Link to="/portfolio">Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span>{company.name}</span>
        </nav>

        <div className="pf-detail-layout">
          <header className="pf-detail-hero">
            <h1 className="pf-detail-title">{company.name}</h1>
          </header>

          <aside className="pf-detail-aside">
            <div className="pf-detail-logo-card">
              <CompanyLogo company={company} />
            </div>
            <dl className="pf-detail-meta">
              {company.url && (
                <div className="pf-detail-meta-row">
                  <dt>Website</dt>
                  <dd>
                    <a href={company.url} target="_blank" rel="noopener noreferrer">
                      {company.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </dd>
                </div>
              )}
              <div className="pf-detail-meta-row">
                <dt>Sector</dt>
                <dd>{company.tag}</dd>
              </div>
              <div className="pf-detail-meta-row">
                <dt>Category</dt>
                <dd>{sectorLabel(company.tags)}</dd>
              </div>
              <div className="pf-detail-meta-row">
                <dt>Backed</dt>
                <dd>{year}</dd>
              </div>
              {founders.length > 0 && (
                <div className="pf-detail-meta-row">
                  <dt>Founders</dt>
                  <dd>{founders.map((founder) => founder.name).join(', ')}</dd>
                </div>
              )}
            </dl>
          </aside>

          <div className="pf-detail-main">
            <section className="pf-detail-section">
              <h2 className="pf-detail-section-label">About</h2>
              <div className="pf-detail-copy">
                <p>{company.description}</p>
              </div>
            </section>

            {thumbnail && (
              <section className="pf-detail-section">
                <h2 className="pf-detail-section-label">Product</h2>
                <div className="pf-detail-product">
                  <img src={thumbnail} alt={`${company.name} preview`} loading="lazy" />
                </div>
              </section>
            )}

            {founders.length > 0 && (
              <section className="pf-detail-section">
                <h2 className="pf-detail-section-label">Founders</h2>
                <div className="pf-detail-founders">
                  {founders.map((founder) => (
                    <article className="pf-detail-founder-card" key={founder.name}>
                      <div className="pf-detail-founder-photo">
                        {founder.photo ? (
                          <img src={founder.photo} alt={founder.name} loading="lazy" />
                        ) : (
                          <span className="pf-detail-founder-initial serif">{founder.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="pf-detail-founder-body">
                        <h3 className="pf-detail-founder-name">{founder.name}</h3>
                        {founder.role && <p className="pf-detail-founder-role">{founder.role}</p>}
                        <FounderLinks founder={founder} />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </article>
    </>
  )
}
