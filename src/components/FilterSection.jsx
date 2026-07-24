import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────
   FILTER — "If You're Still Deciding, This Isn't for You."
   Blueprint twin-column apply / don't-apply panel with deco
   structures + mouse parallax (same feel as the starfield).
───────────────────────────────────────────────────────────── */

const YES = [
  "You're thinking about it the second you stop talking.",
  "You'll outwork the version of yourself that plays it safe.",
  'Comfort makes you restless, not reassured.',
  'You stopped saying "someday" just about a while ago.',
]

const NO = [
  "You're here for the cheque, not the work.",
  "You haven't decided what to care about.",
  'Honest feedback derails your week.',
  'The title matters more to you than the job does.',
]

export default function FilterSection() {
  const sectionRef = useRef(null)
  const decoTrRef = useRef(null)
  const decoBlRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Section in-view → stagger-reveal points (and head / panel)
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          section.classList.add('is-in-view')
          sectionObs.disconnect()
        }
      })
    }, { threshold: 0.18 })
    sectionObs.observe(section)

    // Mouse parallax on the two background structures
    let raf = 0
    let alive = true
    let active = false
    let targetX = 0
    let targetY = 0
    let curX = 0
    let curY = 0

    const nearObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { active = e.isIntersecting })
    }, { rootMargin: '20% 0px', threshold: 0 })
    nearObs.observe(section)

    function onMouse(e) {
      if (reduceMotion || !active) return
      targetX = (e.clientX / window.innerWidth - 0.5)
      targetY = (e.clientY / window.innerHeight - 0.5)
    }

    function tick() {
      if (!alive) return
      curX += (targetX - curX) * 0.055
      curY += (targetY - curY) * 0.055

      const tr = decoTrRef.current
      const bl = decoBlRef.current
      if (tr) {
        // top-right drifts with the pointer (same bias as star camera)
        tr.style.transform =
          `translate3d(${(curX * 28).toFixed(2)}px, ${(curY * 20).toFixed(2)}px, 0)`
      }
      if (bl) {
        // bottom-left counter-moves for depth
        bl.style.transform =
          `translate3d(${(curX * -22).toFixed(2)}px, ${(curY * -16).toFixed(2)}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }

    if (!reduceMotion) {
      window.addEventListener('mousemove', onMouse, { passive: true })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      alive = false
      sectionObs.disconnect()
      nearObs.disconnect()
      window.removeEventListener('mousemove', onMouse)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="filter-section" id="filter" ref={sectionRef}>
      <img
        ref={decoTrRef}
        className="filter-deco filter-deco--tr"
        src="/foundry/filter/deco-top-right.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <img
        ref={decoBlRef}
        className="filter-deco filter-deco--bl"
        src="/foundry/filter/deco-bottom-left.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <div className="filter-inner">
        <header className="filter-head">
          <h2 className="filter-headline">
            If You&apos;re Still Deciding,
            <br />
            This Isn&apos;t for You.
          </h2>
          <p className="filter-headline-sub">
            This isn&apos;t the place to figure out whether you want to build something.
            It&apos;s for the people who decided a long time ago.
          </p>
        </header>

        <div className="filter-panel">
          <span className="filter-cross filter-cross--tl" aria-hidden="true" />
          <span className="filter-cross filter-cross--tr" aria-hidden="true" />
          <span className="filter-cross filter-cross--bl" aria-hidden="true" />
          <span className="filter-cross filter-cross--br" aria-hidden="true" />
          <span className="filter-cross filter-cross--tm" aria-hidden="true" />
          <span className="filter-cross filter-cross--bm" aria-hidden="true" />

          <div className="filter-panel__grid">
            <div className="filter-col filter-col--yes">
              <div className="filter-col-label">
                <span className="filter-col-icon" aria-hidden="true">✓</span>
                Apply if
              </div>
              <ul className="filter-list">
                {YES.map((text, i) => (
                  <li
                    key={text}
                    className="filter-row"
                    style={{ '--i': i }}
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-col filter-col--no">
              <div className="filter-col-label">
                <span className="filter-col-icon" aria-hidden="true">✕</span>
                Don&apos;t apply if
              </div>
              <ul className="filter-list">
                {NO.map((text, i) => (
                  <li
                    key={text}
                    className="filter-row"
                    style={{ '--i': i }}
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
