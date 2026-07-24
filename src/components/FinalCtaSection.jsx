import { useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
   FINAL CTA — "Once on paper changes everything."
   Team photo + apply CTA over the live Foundry starfield.
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
      <div className="final-cta-content">
        <h2 className="final-cta-hero" id="finalHeadline">
          <span className="final-cta-hero-line1">Once on paper</span>
          <span className="final-cta-hero-line2">changes everything.</span>
        </h2>

        <figure className="final-cta-team">
          <div className="final-cta-team-frame">
            <img src="/assets/team-cohort.jpg" alt="The Persist Foundry team" loading="lazy" />
            <div className="final-cta-team-shade" aria-hidden="true" />
          </div>
        </figure>

        <p className="final-cta-eyebrow">You&apos;ve made this bet a thousand times in your head.</p>

        <button
          className="final-cta-apply-btn"
          data-magnetic
          onClick={() => window.open('mailto:apply@persist.foundry?subject=Foundry%20Cohort%202026', '_blank')}
        >
          Apply
          <span className="final-cta-apply-arr" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        <a href="#" className="final-cta-partner">Or talk to a partner first</a>
      </div>
    </section>
  )
}
