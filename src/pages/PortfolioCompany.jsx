import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  getCompanyById,
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
        <a
          href={founder.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${founder.name} on LinkedIn`}
          title="LinkedIn"
        >
          <LiIcon />
        </a>
      )}
      {founder.telegram && (
        <a
          href={founder.telegram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${founder.name} on Telegram`}
          title="Telegram"
        >
          <TgIcon />
        </a>
      )}
      {founder.whatsapp && (
        <a
          href={founder.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${founder.name} on WhatsApp`}
          title="WhatsApp"
        >
          <WaIcon />
        </a>
      )}
    </div>
  )
}

function CompanyLogo({ company }) {
  const initials = company.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const src = company.logoLive || company.logo
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`pf-detail-logo-img${company.logoClass ? ` ${company.logoClass}` : ''}${company.logoLive ? ' is-remote' : ''}`}
      />
    )
  }
  return <span className="pf-detail-logo-fallback serif">{initials}</span>
}

export default function PortfolioCompany() {
  const { id } = useParams()
  const company = getCompanyById(id)

  useEffect(() => {
    document.body.classList.add('is-loaded', 'pf-page')
    return () => {
      document.body.classList.remove('pf-page')
    }
  }, [])

  if (!company) {
    return <Navigate to="/portfolio" replace />
  }

  const thumbnail = getPortfolioThumbnail(company.id)
  const websiteUrl = company.url || null
  const pitchDeck = company.pitchDeck || null
  const founders = company.founders || []
  const hasVisit = Boolean(websiteUrl)
  const hasPitch = Boolean(pitchDeck)
  const visitLabel = `Visit ${company.name.replace(/\.$/, '')}`

  return (
    <>
      <div className="progress" id="progress" />

      <article className="pf-detail">
        <div className="pf-detail-layout">
          <div className="pf-detail-scroll">
            <nav className="pf-detail-crumb" aria-label="Breadcrumb">
              <Link to="/portfolio">Portfolio</Link>
              <span aria-hidden="true">/</span>
              <span>{company.name}</span>
            </nav>

            <header className="pf-detail-hero">
              {(company.logoLive || company.logo) && (
                <div className="pf-detail-hero-logo" aria-hidden="true">
                  <CompanyLogo company={company} />
                </div>
              )}
              <h1 className="pf-detail-title">{company.name}</h1>
            </header>

            <div className="pf-detail-main">
              <section className="pf-detail-section">
                <h2 className="pf-detail-section-label">About</h2>
                <div className="pf-detail-copy">
                  <p>{company.description}</p>
                </div>
              </section>

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

          <div className="pf-detail-visual">
            <div className={`pf-detail-media${thumbnail ? '' : ' pf-detail-media--fallback'}`}>
              {thumbnail ? (
                <img src={thumbnail} alt={`${company.name} preview`} loading="lazy" />
              ) : (
                <div className="pf-detail-media-fallback">
                  <CompanyLogo company={company} />
                </div>
              )}
            </div>

            {(hasVisit || hasPitch) && (
              <div className="pf-detail-ctas">
                {hasVisit && (
                  <a
                    className="pf-detail-cta pf-detail-cta--visit"
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{visitLabel}</span>
                    <svg className="nav-cta-arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                      <path d="M3.2 8h9.2M8.3 4.2 12.4 8 8.3 11.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                )}
                {hasPitch && (
                  <a
                    className="pf-detail-cta pf-detail-cta--pitch"
                    href={pitchDeck}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Pitch Deck</span>
                    <svg className="nav-cta-arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                      <path d="M3.2 8h9.2M8.3 4.2 12.4 8 8.3 11.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  )
}
