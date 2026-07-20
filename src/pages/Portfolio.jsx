import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PORTFOLIO,
  PORTFOLIO_CATEGORIES,
  getCompanyYear,
  getPortfolioThumbnail,
} from '../data/portfolio'

const REVEAL_BASE_MS = 30
const REVEAL_STEP_MS = 18

function getRevealDelay(order) {
  return `${REVEAL_BASE_MS + order * REVEAL_STEP_MS}ms`
}

function CellVisual({ company }) {
  const [failed, setFailed] = useState(false)
  const logo = company.logo
  const thumbnail = getPortfolioThumbnail(company.id)
  const displayImage = logo || thumbnail
  const isScreenshot = !logo && Boolean(thumbnail)
  const initials = company.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  if (!displayImage || failed) {
    return <span className="pf-cell-visual-fallback serif">{initials}</span>
  }

  return (
    <div className={`pf-cell-visual-mark${isScreenshot ? ' is-screenshot' : ''}${company.logoClass ? ` ${company.logoClass}` : ''}`}>
      <img src={displayImage} alt="" loading="lazy" draggable={false} onError={() => setFailed(true)} />
    </div>
  )
}

function PortfolioCell({ company, index, revealOrder }) {
  const navigate = useNavigate()
  const year = getCompanyYear(company, index)
  const thumbnail = getPortfolioThumbnail(company.id)

  return (
    <button
      type="button"
      className={`pf-cell${!company.logo && thumbnail ? ' pf-cell--screenshot' : ''}`}
      style={{
        '--pf-reveal-delay': getRevealDelay(revealOrder),
        ...(company.hoverColor ? { '--pf-hover-accent': company.hoverColor } : {}),
      }}
      onClick={() => navigate(`/portfolio/${company.id}`)}
      aria-label={`${company.name}, ${company.tag}`}
    >
      <span className="pf-cell-year">{year}</span>
      <div className="pf-cell-visual">
        <CellVisual company={company} />
      </div>
      <div className="pf-cell-foot">
        <span className="pf-cell-tag">{company.tag}</span>
        <span className="pf-cell-arrow" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4.5 9.5L9.5 4.5M9.5 4.5H5.75M9.5 4.5V8.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </button>
  )
}

export default function Portfolio() {
  const [category, setCategory] = useState('all')
  const [pageReady, setPageReady] = useState(false)
  const cursorRafRef = useRef(null)

  const filtered = useMemo(() => (
    PORTFOLIO.filter((item) => category === 'all' || item.tags.includes(category))
  ), [category])

  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPageReady(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  useEffect(() => {
    document.body.classList.add('is-loaded', 'pf-page')

    const cursor = document.getElementById('cursor')
    let cursorX = 0
    let cursorY = 0
    let targetX = 0
    let targetY = 0
    let cursorActive = true
    const interactiveSel = 'a, button, .pf-cell, .pf-filter-btn'

    const trackMouse = (e) => {
      targetX = e.clientX
      targetY = e.clientY
    }
    document.addEventListener('mousemove', trackMouse, { passive: true })

    const tickCursor = () => {
      if (!cursorActive) return
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

    const onVis = () => {
      cursorActive = !document.hidden
      if (cursorActive && !cursorRafRef.current) {
        cursorRafRef.current = requestAnimationFrame(tickCursor)
      }
    }
    document.addEventListener('visibilitychange', onVis)

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

    const progressBar = document.getElementById('progress')
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (progressBar && total > 0) progressBar.style.width = `${(window.scrollY / total) * 100}%`
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => {
      document.body.classList.remove('pf-page')
      document.removeEventListener('mousemove', trackMouse)
      document.removeEventListener('visibilitychange', onVis)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('scroll', updateProgress)
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current)
      cursorRafRef.current = null
    }
  }, [])

  return (
    <>
      <div className="cursor" id="cursor" />
      <div className="progress" id="progress" />

      <div className={`pf-page-wrap${pageReady ? ' pf-page-wrap--ready' : ''}`}>
        <header className="pf-page-head">
          <div>
            <h1 className="pf-page-title serif">Portfolio</h1>
            <p className="pf-page-meta">
              {PORTFOLIO.length} ventures backed · Since 2016
            </p>
          </div>
          <div className="pf-filters" role="tablist" aria-label="Filter portfolio">
            {PORTFOLIO_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                className={`pf-filter-btn${category === cat.id ? ' is-active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        <section className="pf-grid-wrap" aria-label="Portfolio companies">
          {filtered.length === 0 ? (
            <div className="pf-empty">
              <p className="pf-empty-title serif">No ventures in this category.</p>
              <button type="button" className="pf-empty-reset" onClick={() => setCategory('all')}>Show all</button>
            </div>
          ) : (
            <div className="pf-grid">
              {filtered.map((company, i) => (
                <PortfolioCell
                  key={company.id}
                  company={company}
                  index={i}
                  revealOrder={i}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
