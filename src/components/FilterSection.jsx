import { useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
   FILTER — "Not for everyone. That's the point." twin columns
   (Apply if / Don't apply if). Ported from the legacy landing
   (Home.jsx). Base styles live in index.css under .filter-*;
   the cinematic Foundry page re-skins them dark via .pf scope.
───────────────────────────────────────────────────────────── */

export default function FilterSection() {
  useEffect(() => {
    const section = document.getElementById('filter')
    if (!section) return

    // divider draw-in
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { section.classList.add('is-in-view'); sectionObs.disconnect() }
      })
    }, { threshold: 0.15 })
    sectionObs.observe(section)

    // staggered list item reveal
    const items = section.querySelectorAll('.filter-list li')
    const timers = []
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const li = entry.target
          const delay = Array.from(li.parentElement.children).indexOf(li) * 120
          timers.push(setTimeout(() => li.classList.add('is-revealed'), delay))
          revealObs.unobserve(li)
        }
      })
    }, { threshold: 0.3 })
    items.forEach((li) => revealObs.observe(li))

    return () => {
      sectionObs.disconnect()
      revealObs.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <section className="filter-section" id="filter">
      <div className="filter-divider"></div>
      <span className="filter-bg-word">honest.</span>
      <div className="filter-inner">
        <div className="section-label">Read this slowly</div>
        <h2 className="filter-headline">
          <span className="strike">Not for everyone.</span><br />
          <em>That's the point.</em>
        </h2>
        <p className="filter-headline-sub">
          If you have to talk yourself into the left column, the right one is where you live. That's okay. Just not here. Not yet.
        </p>
        <div className="filter-grid">
          <div className="filter-col yes">
            <div className="filter-col-label"><span className="filter-col-icon">✓</span> Apply if</div>
            <ul className="filter-list">
              <li>You're thinking about it the second you stop talking.</li>
              <li>You'll outwork the version of yourself that plays it safe.</li>
              <li>Comfort makes you restless, not reassured.</li>
              <li>You stopped saying "someday" out loud a while ago.</li>
            </ul>
          </div>
          <div className="filter-col no">
            <div className="filter-col-label"><span className="filter-col-icon">✕</span> Don't apply if</div>
            <ul className="filter-list">
              <li>You're here for the cheque, not the work.</li>
              <li>You haven't decided what to build yet.</li>
              <li>Honest feedback derails your week.</li>
              <li>The title matters more to you than the job does.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
