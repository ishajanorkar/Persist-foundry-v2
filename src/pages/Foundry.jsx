import { useEffect, useRef } from 'react'
import '../foundry/foundry.css'
import initFoundry from '../foundry/engine'

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
    return () => {
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
          <a className="nav-link" href="#what">Studio</a>
          <a className="nav-link" href="#threshold">Apply</a>
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
            <p className="eyebrow">A venture studio</p>
            <h1 className="display">Bet on <em>yourself.</em></h1>
            <p className="lead" data-copy="hero-lead">The rest will follow. Persist Foundry forges founders into the companies they were meant to build.</p>
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
            <p className="eyebrow">The threshold</p>
            <h2 className="display">This isn't for <em>everyone.</em></h2>
            <p className="lead lead--wide" data-copy="threshold-lead">If the fear of execution keeps your idea an idea, this is not your door. Persist backs the rare founders who move before they feel ready. The ones who would build with us or without us.</p>
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

        {/* WHAT WE DO */}
        <section className="what" id="what">
          <div className="what__inner">
            <p className="eyebrow">What we do</p>
            <h2 className="what__headline">We hand founders an <em>unfair start.</em></h2>
            <p className="what__lead">Capital, a team, and a network most founders spend a decade earning. You get it on day one.</p>

            <div className="what__grid">
              <article className="what-card">
                <div className="what-card__icon"><img className="logo-swap icon3d" src="/foundry/icons/3d-capital.png" alt="" data-fallback={'◆'} /></div>
                <h3 className="what-card__title">Capital that commits</h3>
                <p className="what-card__body">Funding and a salary, so you build full time from the very first day.</p>
              </article>
              <article className="what-card">
                <div className="what-card__icon"><img className="logo-swap icon3d" src="/foundry/icons/3d-studio.png" alt="" data-fallback={'▦'} /></div>
                <h3 className="what-card__title">A studio behind you</h3>
                <p className="what-card__body">Builders, designers, and recruiters embedded in your venture until it stands on its own.</p>
              </article>
              <article className="what-card">
                <div className="what-card__icon"><img className="logo-swap icon3d" src="/foundry/icons/3d-network.png" alt="" data-fallback={'✷'} /></div>
                <h3 className="what-card__title">A network that opens doors</h3>
                <p className="what-card__body">400 advisors and the founders of Tether, in your corner from day one.</p>
              </article>
            </div>
          </div>
        </section>

        {/* portfolio / arm detail panel (driven by hover in finale) */}
        <div className="portfolio-detail" id="armDetail">
          <span className="kicker" id="armKicker">Persist</span>
          <h4 id="armTitle">Accelerator</h4>
          <p id="armBody" />
        </div>

        {/* FINAL CTA + FOOTER */}
        <footer className="pf-footer" id="footer">
          <div className="footer__cta">
            <p className="eyebrow">The only question left</p>
            <h2 className="footer__headline">Will you <em>bet on yourself?</em></h2>
            <p className="footer__sub">If you are still reading, you already have your answer.</p>
            <a className="btn btn--primary btn--lg" href="mailto:hello@persist.org"><span>Start the conversation</span></a>
          </div>

          <div className="footer__grid">
            <div className="footer__brand">
              <a className="footer__lockup" href="#top"><img src="/foundry/logo/persist-logo.svg" alt="" /><span>Persist</span></a>
              <p className="footer__tag">A venture studio for founders who move. Backed by the founders of Tether.</p>
            </div>
            <nav className="footer__col" aria-label="Studio">
              <h4>Studio</h4>
              <a href="#what">Accelerator</a>
              <a href="#what">Co-Founder Bridge</a>
              <a href="#what">Studio for Founders</a>
              <a href="#what">Sub Studio Program</a>
            </nav>
            <nav className="footer__col" aria-label="Company">
              <h4>Company</h4>
              <a href="#hero">Vision</a>
              <a href="#tether">Backing</a>
              <a href="#threshold">Apply</a>
            </nav>
            <nav className="footer__col" aria-label="Connect">
              <h4>Connect</h4>
              <a href="mailto:hello@persist.org">hello@persist.org</a>
              <a href="https://persist.org" target="_blank" rel="noopener">persist.org</a>
            </nav>
          </div>

          <div className="footer__base">
            <span>© 2026 Persist Foundry</span>
            <span className="footer__base-tag">Bet on yourself.</span>
            <span>Backed by Tether</span>
          </div>
        </footer>
      </main>

      {/* scroll cue */}
      <div className="scroll-cue" id="scrollCue"><span>Scroll</span><span className="scroll-cue__line" /></div>

      {/* custom cursor */}
      <div className="cursor-ring" id="cursorRing" />
      <div className="cursor-dot" id="cursorDot" />
    </div>
  )
}
