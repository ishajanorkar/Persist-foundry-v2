import { useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
   FINAL CTA — "Once on paper changes everything." Cohort 2026
   apply block with team photo, magnetic apply button, and the
   20min / 2wks / Day-one count-up stats. Ported from the legacy
   landing (Home.jsx); styles live in index.css under .final-cta-*.
───────────────────────────────────────────────────────────── */

export default function FinalCtaSection() {
  useEffect(() => {
    const finalCta = document.getElementById('apply')
    const finalHeadline = document.getElementById('finalHeadline')
    if (!finalCta) return

    let alive = true
    const cleanups = []

    // mouse parallax on the headline
    if (finalHeadline) {
      let fX = 0, fY = 0, tX = 0, tY = 0
      const onMove = (e) => {
        const r = finalCta.getBoundingClientRect()
        tX = (e.clientX - r.left - r.width / 2) / r.width
        tY = (e.clientY - r.top - r.height / 2) / r.height
      }
      const onLeave = () => { tX = 0; tY = 0 }
      finalCta.addEventListener('mousemove', onMove)
      finalCta.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        finalCta.removeEventListener('mousemove', onMove)
        finalCta.removeEventListener('mouseleave', onLeave)
      })
      let raf = 0
      function animateFinal() {
        if (!alive) return
        fX += (tX - fX) * 0.08
        fY += (tY - fY) * 0.08
        finalHeadline.style.transform = `translate(${fX * 18}px, ${fY * 10}px)`
        raf = requestAnimationFrame(animateFinal)
      }
      raf = requestAnimationFrame(animateFinal)
      cleanups.push(() => cancelAnimationFrame(raf))
    }

    // stats count-up
    const statsEl = document.getElementById('finalStats')
    if (statsEl) {
      const items = Array.from(statsEl.querySelectorAll('.final-cta-stat'))
      const timers = []

      function animateCount(el, from, to, dur = 1100) {
        const valEl = el.querySelector('.final-cta-stat-val')
        if (!valEl) return
        const t0 = performance.now()
        function tick(now) {
          if (!alive) return
          const k = Math.min(1, (now - t0) / dur)
          const e = 1 - Math.pow(1 - k, 3)
          valEl.textContent = String(Math.round(from + (to - from) * e))
          if (k < 1) requestAnimationFrame(tick)
          else valEl.textContent = String(to)
        }
        requestAnimationFrame(tick)
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target
          const idx = items.indexOf(el)
          timers.push(setTimeout(() => {
            el.classList.add('is-in')
            if (el.dataset.type === 'count') {
              animateCount(el, parseFloat(el.dataset.from || '0'), parseFloat(el.dataset.to || '0'))
            }
          }, idx * 180))
          io.unobserve(el)
        })
      }, { threshold: 0.35 })
      items.forEach((el) => io.observe(el))
      cleanups.push(() => { io.disconnect(); timers.forEach(clearTimeout) })
    }

    // section reveal
    const finalCtaObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-in-view', e.isIntersecting))
    }, { threshold: 0.1 })
    finalCtaObs.observe(finalCta)
    cleanups.push(() => finalCtaObs.disconnect())

    return () => { alive = false; cleanups.forEach((fn) => fn()) }
  }, [])

  return (
    <section className="final-cta" id="apply">
      <div className="final-cta-grid-bg"></div>
      <div className="final-cta-watermark">begin.</div>
      <div className="final-cta-noise"></div>
      <div className="final-cta-vignette"></div>

      <div className="final-cta-content">
        {/* cohort meta */}
        <div className="final-cta-cohort">
          <span className="final-cta-cohort-pip"></span>
          <span>Cohort 2026</span>
          <span className="final-cta-cohort-sep">/</span>
          <span>Open</span>
        </div>

        {/* hero headline */}
        <h2 className="final-cta-hero" id="finalHeadline">
          <span className="final-cta-hero-line1">Once on paper</span>
          <span className="final-cta-hero-line2">changes everything.</span>
        </h2>

        {/* team photo */}
        <figure className="final-cta-team">
          <div className="final-cta-team-frame">
            <img src="/assets/team-cohort.jpg" alt="The Persist Foundry team" loading="lazy" />
            <div className="final-cta-team-shade" aria-hidden="true"></div>
          </div>
          <figcaption className="final-cta-team-cap">
            <span className="final-cta-team-pip"></span>
            The team you'll build alongside
          </figcaption>
        </figure>

        {/* eyebrow + CTA below image */}
        <p className="final-cta-eyebrow">You've made this bet a thousand times in your head.</p>

        {/* apply button */}
        <button className="final-cta-apply-btn" data-magnetic onClick={() => window.open('mailto:apply@persist.foundry?subject=Foundry%20Cohort%202026', '_blank')}>
          Apply
          <span className="final-cta-apply-arr" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        <a href="#" className="final-cta-partner">Or talk to a partner first</a>

        {/* stats */}
        <div className="final-cta-stats" id="finalStats">
          <div className="final-cta-stat" data-from="0" data-to="20" data-type="count">
            <span className="final-cta-stat-num"><span className="final-cta-stat-val">20</span><em>min</em></span>
            <span className="final-cta-stat-cap"><span className="final-cta-stat-pip"></span>To apply</span>
          </div>
          <div className="final-cta-stat" data-from="0" data-to="2" data-type="count">
            <span className="final-cta-stat-num"><span className="final-cta-stat-val">2</span><em>wks</em></span>
            <span className="final-cta-stat-cap"><span className="final-cta-stat-pip"></span>To hear back</span>
          </div>
          <div className="final-cta-stat" data-type="text">
            <span className="final-cta-stat-num"><span className="final-cta-stat-val">Day</span><em>one</em></span>
            <span className="final-cta-stat-cap"><span className="final-cta-stat-pip"></span>After we say yes</span>
          </div>
        </div>
      </div>
    </section>
  )
}
