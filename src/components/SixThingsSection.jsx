import { useState, useRef, useEffect, useCallback } from 'react'

/* ─────────────────────────────────────────────────────────────
   SIX THINGS — "WHAT YOU GET" horizontal pinned scroll.
   Extracted from Home.jsx so the cinematic Foundry landing can
   reuse the exact same section (markup, data, and behavior).
   Styles live in index.css under the .st-* namespace.
───────────────────────────────────────────────────────────── */

const THINGS = [
  { n: '01', cat: 'The Runway',    title: ['Your ', 'stake.'],     body: 'Monthly capital so you can leave the job, tell the family, and stop apologizing for the work.',                  icon: 'stake'  },
  { n: '02', cat: 'The Room',      title: ['Your ', 'people.'],    body: 'A small cohort betting the same way you are — close enough to borrow nerve from on the hard days.',              icon: 'room'   },
  { n: '03', cat: 'The Bench',     title: ['Your ', 'operators.'], body: 'Senior operators in the building with you — not a calendar invite three weeks out.',                             icon: 'bench'  },
  { n: '04', cat: 'The Doors',     title: ['Your ', 'network.'],   body: 'Warm introductions to the customers, hires, and investors who actually move the needle.',                        icon: 'doors'  },
  { n: '05', cat: 'The Check',     title: ['Your ', 'raise.'],     body: 'We write the first check and help you fill the round — on your terms, at your pace.',                           icon: 'check'  },
  { n: '06', cat: 'The Long Game', title: ['Your ', 'corner.'],    body: 'We stay after the headline — through the pivot, the next raise, and the quiet years.',                          icon: 'corner' },
]

function ThingIcon({ name }) {
  const c = { width: '100%', height: '100%', viewBox: '0 0 40 40', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'stake':  return <svg {...c}><path d="M20 5v30M13 11h11a4 4 0 010 8H16a4 4 0 000 8h12"/></svg>
    case 'room':   return <svg {...c}><circle cx="13" cy="16" r="4"/><circle cx="27" cy="16" r="4"/><path d="M6 31c0-5 3-8 7-8s7 3 7 8M20 31c0-5 3-8 7-8s7 3 7 8"/></svg>
    case 'bench':  return <svg {...c}><path d="M8 22l5-5 5 4 9-9M27 12h4v4"/><path d="M6 31h28" opacity=".5"/></svg>
    case 'doors':  return <svg {...c}><rect x="9" y="7" width="13" height="26" rx="1.5"/><path d="M22 20h9M31 20l-4-4M31 20l-4 4"/></svg>
    case 'check':  return <svg {...c}><path d="M6 14l14-7 14 7-14 7z"/><path d="M11 18v8c0 2 4 4 9 4s9-2 9-4v-8"/></svg>
    case 'corner': return <svg {...c}><path d="M20 6l4 9 10 1-7.5 6.5 2.5 9.5-9-5-9 5 2.5-9.5L6 16l10-1z"/></svg>
    default: return null
  }
}

const clamp01st = (v) => Math.max(0, Math.min(1, v))

export default function SixThingsSection() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef(null)
  const pinRef     = useRef(null)
  const trackRef   = useRef(null)
  const heroRef    = useRef(null)
  const barRef     = useRef(null)
  const panelRefs  = useRef([])
  const numRefs    = useRef([])
  const targetP    = useRef(0)
  const curP       = useRef(0)
  const activeRef  = useRef(0)

  useEffect(() => {
    let raf = 0, alive = true
    const isMobile = () => window.innerWidth <= 900

    function readScroll() {
      const section = sectionRef.current, pin = pinRef.current
      if (!section || !pin) return
      if (isMobile()) { targetP.current = 0; return }
      const dist = (section.offsetHeight - pin.clientHeight) * 0.72
      targetP.current = clamp01st(-section.getBoundingClientRect().top / (dist || 1))
    }

    function apply(p) {
      const pin = pinRef.current, track = trackRef.current
      if (!pin || !track) return

      if (isMobile()) {
        track.style.transform = ''
        panelRefs.current.forEach(el => { if (el) { el.style.opacity = ''; el.style.transform = '' } })
        numRefs.current.forEach(el => { if (el) el.style.transform = '' })
        if (heroRef.current) { heroRef.current.style.opacity = ''; heroRef.current.style.transform = '' }
        return
      }

      const maxShift = track.scrollWidth - pin.clientWidth
      track.style.transform = `translate3d(${-p * maxShift}px,0,0)`

      // Hero: fade out quickly (gone by 8%) and slide up so it clears the panels
      const heroProgress = Math.max(0, 1 - p / 0.08)
      if (heroRef.current) {
        heroRef.current.style.opacity = String(heroProgress)
        heroRef.current.style.transform = `translateY(${-p * 90}px)`
      }

      // Panels: delay rising until hero has mostly cleared (after p > 0.06)
      const panelReveal = clamp01st((p - 0.04) / 0.08)
      const center = pin.clientWidth / 2
      let best = 0, bestD = Infinity
      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const c = r.left + r.width / 2
        const d = Math.abs(c - center)
        const t = clamp01st(1 - d / (r.width * 0.82))
        el.style.opacity = String((0.26 + 0.74 * t) * panelReveal)
        el.style.transform = `scale(${0.93 + 0.07 * t})`
        const num = numRefs.current[i]
        if (num) num.style.transform = `translateX(${(c - center) * 0.06}px)`
        if (d < bestD) { bestD = d; best = i }
      })
      if (barRef.current)  barRef.current.style.transform = `scaleX(${p})`
      if (activeRef.current !== best) { activeRef.current = best; setActive(best) }
    }

    function loop() {
      if (!alive) return
      curP.current += (targetP.current - curP.current) * 0.1
      if (Math.abs(targetP.current - curP.current) < 0.0003) curP.current = targetP.current
      apply(curP.current)
      raf = requestAnimationFrame(loop)
    }

    readScroll()
    curP.current = targetP.current
    apply(curP.current)
    window.addEventListener('scroll', readScroll, { passive: true })
    window.addEventListener('resize', readScroll)
    raf = requestAnimationFrame(loop)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', readScroll)
      window.removeEventListener('resize', readScroll)
    }
  }, [])

  const jump = useCallback((i) => {
    const section = sectionRef.current, pin = pinRef.current
    if (!section || !pin) return
    if (window.innerWidth <= 900) {
      const el = panelRefs.current[i]
      if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 80, behavior: 'smooth' })
      return
    }
    const dist = (section.offsetHeight - pin.clientHeight) * 0.9
    const p = i / (THINGS.length - 1)
    window.scrollTo({ top: section.offsetTop + p * dist, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') jump(Math.min(THINGS.length - 1, activeRef.current + 1))
      else if (e.key === 'ArrowLeft') jump(Math.max(0, activeRef.current - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [jump])

  return (
    <div className="st-wrap" id="offer">
      <section className="st-h-scroll" ref={sectionRef}>
        <div className="st-pin" ref={pinRef}>
          <div className="st-grid-bg" aria-hidden="true"></div>

          {/* top bar */}
          <div className="st-topbar">
            <div className="st-kicker">
              WHAT YOU GET
            </div>
            <div className="st-count serif">
              <em>{THINGS[active].n}</em><span> / 06</span>
            </div>
          </div>

          {/* receding hero headline */}
          <h2 className="st-hero serif" ref={heroRef}>
            Six things.<br /><em>Nothing extra. Nothing missing.</em>
          </h2>

          {/* horizontal track */}
          <div className="st-track" ref={trackRef}>
            {THINGS.map((t, i) => (
              <article
                key={t.n}
                ref={el => (panelRefs.current[i] = el)}
                className="st-panel"
              >
                <span className="st-ghost serif" ref={el => (numRefs.current[i] = el)} aria-hidden="true">{t.n}</span>
                <div className="st-p-in">
                  <div className="st-r1">
                    <span className="st-p-icon"><ThingIcon name={t.icon} /></span>
                    <span className="st-p-cat">{t.cat}</span>
                  </div>
                  <h3 className="st-p-title serif">{t.title[0]}<em>{t.title[1]}</em></h3>
                  <p className="st-p-body serif">{t.body}</p>
                </div>
              </article>
            ))}
          </div>

          {/* bottom progress line + markers */}
          <div className="st-prog">
            <div className="st-pline"><i ref={barRef}></i></div>
            <div className="st-marks">
              {THINGS.map((t, i) => (
                <button
                  key={t.n}
                  className={'st-mark' + (i === active ? ' on' : i < active ? ' done' : '')}
                  onClick={() => jump(i)}
                  aria-label={`${t.n} ${t.cat}`}
                >
                  <span className="st-m-n serif">{t.n}</span>
                  <span className="st-m-cat">{t.cat}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
