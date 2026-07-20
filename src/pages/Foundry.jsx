import { useEffect, useRef } from 'react'
import '../foundry/foundry.css'
import initFoundry from '../foundry/engine'
import SixThingsSection from '../components/SixThingsSection'
import ManifestoSection from '../components/ManifestoSection'
import FilterSection from '../components/FilterSection'
import FinalCtaSection from '../components/FinalCtaSection'
import Footer from '../components/Footer'

/* ============================================================
   PERSIST FOUNDRY — alternative cinematic landing.
   1:1 port of the static design (persist-foundry-site). The full
   experience (scroll-scrubbed frame sequence + Three.js finale +
   loader/cursor/sound) lives in ../foundry/engine.js.
   ============================================================ */
export default function Foundry() {
  const rootRef = useRef(null)

  useEffect(() => {
    // useEffect already runs after the DOM is committed/laid out, so the
    // engine can measure the canvas immediately — no rAF defer (a deferred
    // init can get canceled by StrictMode/Fast-Refresh churn before it fires).
    document.body.classList.add('pf-landing')
    const cleanup = initFoundry({ base: '/foundry' })

    // stacking portfolio cards: previous card scales down and dims as the
    // next sticky card slides over it (same mechanic as the legacy landing)
    const stackCards = Array.from(document.querySelectorAll('#pfolioStack .pfolio-row'))
    const STACK_TOP = 100 // matches sticky top in foundry.css
    const updateStack = () => {
      stackCards.forEach((card, i) => {
        const next = stackCards[i + 1]
        if (!next) { card.style.transform = ''; card.style.filter = ''; return }
        const overlap = Math.max(0, Math.min(1,
          (STACK_TOP + card.offsetHeight - next.getBoundingClientRect().top) / card.offsetHeight
        ))
        card.style.transform = `scale(${(1 - overlap * 0.04).toFixed(4)})`
        card.style.filter = `brightness(${(1 - overlap * 0.22).toFixed(4)})`
      })
    }
    window.addEventListener('scroll', updateStack, { passive: true })
    updateStack()

    return () => {
      window.removeEventListener('scroll', updateStack)
      cleanup()
      document.body.classList.remove('pf-landing')
    }
  }, [])

  return (
    <div className="pf" ref={rootRef}>
      {/* ===================== LOADER ===================== */}
      <div className="pf-loader" id="loader">
        <div className="loader__mark">Persist</div>
        <div className="loader__bar"><i id="loaderBar" /></div>
        <div className="loader__pct" id="loaderPct">000</div>
      </div>

      {/* ===================== FIXED STAGE ===================== */}
      <div className="stage">
        <canvas id="hero-canvas" />
        <canvas id="three-canvas" />
        <div className="stage-fade" id="stageFade" />
      </div>

      {/* persistent Persist mark: center anchor -> glides to nav */}
      <div className="persist-logo" id="persistLogo">
        <img src="/foundry/logo/persist-logo.svg" alt="Persist" />
      </div>

      {/* ===================== NAV ===================== */}
      <nav className="pf-nav" id="nav">
        <a className="nav__brand" href="#top" aria-label="Persist home">
          <span className="nav__mark" id="navBrandSlot" />
          <span className="nav__word">Persist</span>
        </a>
        <div className="nav__right">
          <a className="nav-link" href="#portfolio">Studio</a>
          <a className="nav-link" href="#apply">Apply</a>
          <button className="sound-toggle" id="soundToggle" aria-pressed="false" aria-label="Toggle sound">
            <span id="soundLabel">Sound</span>
          </button>
          <a className="nav__cta" href="mailto:hello@persist.org">Get in touch</a>
        </div>
      </nav>

      {/* ===================== SCROLL TRACK / BEATS ===================== */}
      <main className="scroll-track" id="scrollTrack">

        {/* BEAT 1 — HERO */}
        <section className="beat" data-beat="0" id="hero">
          <div className="beat__scrim" />
          <div className="beat__inner">
            <p className="eyebrow">A venture studio for the bold</p>
            <h1 className="display">Bet on <em>yourself.</em></h1>
            <p className="lead" data-copy="hero-lead">The rest will follow. Persist Foundry turns bold ideas into market-leading companies, and visionary founders into the leaders they were born to become.</p>
          </div>
        </section>

        {/* BEAT 2 — BACKED BY TETHER */}
        <section className="beat beat--center" data-beat="1" id="tether">
          <div className="beat__scrim" />
          <div className="beat__inner beat__inner--wide">
            <h2 className="lockup__heading">Funded by the founders of <em>Tether.</em></h2>
            <div className="lockup">
              <div className="lockup__primary">
                <img className="logo-swap" src="/foundry/logo/tether.png" alt="Tether" data-fallback="tether" />
              </div>
              <span className="lockup__and">and</span>
              <div className="lockup__row">
                <img className="logo-swap" src="/foundry/logo/dna.png" alt="DNA Fund" data-fallback="DNA" />
                <img className="logo-swap" src="/foundry/logo/percival.png" alt="Percival" data-fallback="PERCIVAL" />
                <img className="logo-swap" src="/foundry/logo/bff.png" alt="Blockchain Founders Fund" data-fallback="Blockchain Founders Fund" />
                <img className="logo-swap" src="/foundry/logo/welara.png" alt="Welara" data-fallback="Welara" />
              </div>
            </div>
          </div>
        </section>

        {/* BEAT 3 — THRESHOLD */}
        <section className="beat beat--center" data-beat="2" id="threshold">
          <div className="beat__scrim" />
          <div className="beat__inner">
            <p className="eyebrow">Backstory</p>
            <h2 className="display display--backstory">Building alongside founders, not from the <em>sidelines.</em></h2>
            <p className="lead lead--wide" data-copy="threshold-lead">We started Persist in 2016 to rethink founder support. Inspired by the Thiel Fellowship but open to everyone, it began as one founder's answer to a broken system: a PayPal-to-Ethereum exchange that became proof the right ecosystem changes everything. Nine years and thirty companies later, our DNA is unchanged: founder-first and deeply involved. When ambitious founders meet the right support, exceptional companies are born.</p>
            <div className="stats stats--threshold">
              <div className="stat"><span className="stat__num">30+</span><span className="stat__label">Companies launched</span></div>
              <div className="stat"><span className="stat__num">$117M</span><span className="stat__label">Net asset value</span></div>
              <div className="stat"><span className="stat__num">400+</span><span className="stat__label">Advisor network</span></div>
              <div className="stat"><span className="stat__num">67B</span><span className="stat__label">Portfolio impressions</span></div>
            </div>
          </div>
        </section>

        {/* FINALE SPACER — orbit lives here */}
        <section className="beat beat--center" data-beat="4" id="orbit" style={{ minHeight: '200vh' }}>
          <div className="beat__inner" style={{ opacity: 1, transform: 'none' }}>
            <p className="eyebrow" id="orbitEyebrow" style={{ marginTop: '8vh' }}>Five ways we forge</p>
          </div>
        </section>

        {/* PORTFOLIO — stacking cases (dark port of the legacy portfolio-v2) */}
        <section className="pfolio" id="portfolio">
          <div className="pfolio__inner">
            <div className="pfolio__header">
              <div>
                <h2 className="pfolio__title"><em>They bet.</em><br />We backed it.</h2>
                <div className="pfolio__meta">Three of thirty.</div>
              </div>
              <p className="pfolio__sub">We don't pick winners. We pick people who can't stop. Here's what nine years of that looks like.</p>
            </div>

            <div className="pfolio-stack" id="pfolioStack">

              <article className="pfolio-row" data-row="0">
                <div className="pfolio-row__left">
                  <div className="pfolio-row__tag">Robotics</div>
                  <h3 className="pfolio-row__name"><em>Open Droids</em></h3>
                  <p className="pfolio-row__desc">Home robots that earn their keep. Built by someone who got tired of waiting for the future to arrive.</p>
                  <div className="pfolio-row__stats">
                    <div>
                      <div className="pfolio-row__stat-num">Pre-seed</div>
                      <div className="pfolio-row__stat-label">Where they started</div>
                    </div>
                    <div>
                      <div className="pfolio-row__stat-num">Series A<em>→</em></div>
                      <div className="pfolio-row__stat-label">Where they're going</div>
                    </div>
                  </div>
                </div>
                <a className="pfolio-row__right" href="https://opendroids.com/" target="_blank" rel="noopener" aria-label="Visit Open Droids">
                  <img className="pfolio-row__thumb" src="/assets/opendroid-thumbnail.webp" alt="Open Droids" />
                  <span className="pfolio-row__shade" />
                  <span className="pfolio-row__case">Case 01 / 03</span>
                  <span className="pfolio-row__corner tl" /><span className="pfolio-row__corner tr" /><span className="pfolio-row__corner bl" /><span className="pfolio-row__corner br" />
                </a>
              </article>

              <article className="pfolio-row pfolio-row--reversed" data-row="1">
                <div className="pfolio-row__left">
                  <div className="pfolio-row__tag">AI Privacy</div>
                  <h3 className="pfolio-row__name"><em>Face Search</em></h3>
                  <p className="pfolio-row__desc">Find every place your face lives online. Built by someone who couldn't sleep until the problem was solved.</p>
                  <div className="pfolio-row__stats">
                    <div>
                      <div className="pfolio-row__stat-num">400K</div>
                      <div className="pfolio-row__stat-label">Users</div>
                    </div>
                    <div>
                      <div className="pfolio-row__stat-num">$8K<em>MRR</em></div>
                      <div className="pfolio-row__stat-label">Climbing</div>
                    </div>
                  </div>
                </div>
                <a className="pfolio-row__right" href="https://facesearchai.com/" target="_blank" rel="noopener" aria-label="Visit Face Search AI">
                  <img className="pfolio-row__thumb" src="/assets/facesearch-ai-thumbnail.webp" alt="Face Search AI" />
                  <span className="pfolio-row__shade" />
                  <span className="pfolio-row__case">Case 02 / 03</span>
                  <span className="pfolio-row__corner tl" /><span className="pfolio-row__corner tr" /><span className="pfolio-row__corner bl" /><span className="pfolio-row__corner br" />
                </a>
              </article>

              <article className="pfolio-row" data-row="2">
                <div className="pfolio-row__left">
                  <div className="pfolio-row__tag">Talent</div>
                  <h3 className="pfolio-row__name"><em>Swissmote</em></h3>
                  <p className="pfolio-row__desc">Hiring the world's most overlooked builders. Built by someone who heard "no" so many times he rewrote the rules.</p>
                  <div className="pfolio-row__stats">
                    <div>
                      <div className="pfolio-row__stat-num">Profitable</div>
                      <div className="pfolio-row__stat-label">No outside capital</div>
                    </div>
                    <div>
                      <div className="pfolio-row__stat-num">Global</div>
                      <div className="pfolio-row__stat-label">Day one</div>
                    </div>
                  </div>
                </div>
                <a className="pfolio-row__right" href="https://swissmote.com/" target="_blank" rel="noopener" aria-label="Visit Swissmote">
                  <img className="pfolio-row__thumb" src="/assets/swissmote-thimbnaail.webp" alt="Swissmote" />
                  <span className="pfolio-row__shade" />
                  <span className="pfolio-row__case">Case 03 / 03</span>
                  <span className="pfolio-row__corner tl" /><span className="pfolio-row__corner tr" /><span className="pfolio-row__corner bl" /><span className="pfolio-row__corner br" />
                </a>
              </article>

            </div>

            <div className="pfolio__cta">
              <p className="pfolio__cta-label">Three of thirty. <em>The rest are just as relentless.</em></p>
              <a className="pfolio__cta-link" href="#portfolio">See all thirty <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

        {/* SIX THINGS — "WHAT YOU GET" horizontal pinned scroll (shared with legacy landing) */}
        <SixThingsSection />

        {/* MANIFESTO — "A note. Read slowly." scroll narrative (ported from legacy landing) */}
        <ManifestoSection />

        {/* FILTER — "Not for everyone. That's the point." twin columns (ported from legacy landing) */}
        <FilterSection />

        {/* portfolio / arm detail panel (driven by hover in finale) */}
        <div className="portfolio-detail" id="armDetail">
          <span className="kicker" id="armKicker">Persist</span>
          <h4 id="armTitle">Accelerator</h4>
          <p id="armBody" />
        </div>

        {/* FINAL CTA — "Once on paper changes everything." (ported from legacy landing) */}
        <FinalCtaSection />

        {/* FOOTER — shared legacy footer (newsletter + link columns) */}
        <Footer />
      </main>

      {/* scroll cue */}
      <div className="scroll-cue" id="scrollCue"><span>Scroll</span><span className="scroll-cue__line" /></div>

      {/* custom cursor */}
      <div className="cursor-ring" id="cursorRing" />
      <div className="cursor-dot" id="cursorDot" />
    </div>
  )
}
