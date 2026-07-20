import { useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
   MANIFESTO — "A note. Read slowly." lerp-driven scroll narrative
   with the P∞ logo trace revealed by a masked wipe. Ported from
   the legacy landing (Home.jsx) so the cinematic Foundry page can
   render the exact same section. Styles live in index.css under
   the .manifesto-* namespace.
───────────────────────────────────────────────────────────── */

const STEPS = [
  { roman: 'I',   text: <>You've been sitting on this for years.</> },
  { roman: 'II',  text: <>Building it quietly. In your head. On whatever's nearby.</> },
  { roman: 'III', text: <>Choosing the harder thing. <em>Every single time.</em></> },
  { roman: 'IV',  text: <>We've watched founders like you for nine years.</> },
  { roman: 'V',   text: <>We know what this looks like. <em>It looks like you.</em></> },
]

/* The P∞ ribbon paths (∞ half) — shared by the reveal, clip, and glow layers */
const INF_PATHS = [
  'M600.505 423.072C545.41 458.546 473.557 456.846 422.182 416.537C413.713 409.885 404.075 401.33 394.171 392.136L436.866 352.131C441.881 357.138 446.669 361.684 450.974 365.505C482.346 393.244 518.92 398.078 557.342 380.876C593.877 364.523 615.759 327.652 612.998 287.78C612.047 273.954 609.036 261.5 604.007 250.489L664.396 247.962C665.496 251.471 666.471 255.043 667.375 258.708C682.8 321.281 655.46 387.676 600.497 423.08L600.505 423.072Z',
  'M164.512 447.894C114.595 450.81 64.3511 429.622 31.0681 385.765C-15.4485 324.455 -9.10075 237.769 45.8848 183.494C72.2663 157.455 105.97 142.319 140.634 138.786L141.757 196.79C132.835 198.349 123.75 201.188 114.572 205.259C78.7233 221.183 56.6932 257.897 58.284 296.42C59.9216 336.55 84.5564 370.917 122.401 384.127C134.294 388.268 145.757 390.397 156.807 390.561L164.52 447.894H164.512Z',
  'M436.875 352.131L394.179 392.136C377.077 376.275 359.141 358.456 344.902 345.066C359.633 330.39 372.344 317.741 388.97 301.185C401.853 315.152 420.592 335.911 436.875 352.139V352.131Z',
  'M605.41 165.962C565.031 153.618 521.345 173.651 484.779 200.314C470.321 205.328 456.783 214.202 444.236 226.594C385.07 285.026 326.544 344.098 266.934 402.078C237.535 430.682 201.117 445.772 164.512 447.885L156.799 390.552C182.807 390.95 206.42 380.469 227.311 359.89C286.991 301.122 345.743 241.418 406.024 183.243C449.343 141.445 501.709 127.907 559.946 145.11C577.009 150.155 592.161 157.127 605.402 165.962H605.41Z',
  'M664.404 247.954L604.014 250.48C593.853 228.17 575.426 211.793 548.997 202.123C526.078 193.74 504.586 193.421 484.779 200.314C521.337 173.644 565.031 153.618 605.41 165.963C633.913 184.983 653.58 212.596 664.412 247.954H664.404Z',
  'M328.097 243.688C313.303 257.047 299.672 269.36 281.954 285.37C270.319 272.745 250.13 249.638 233.153 232.552C228.794 228.154 224.653 224.154 220.917 220.839C197.063 199.651 170.182 191.799 141.749 196.789L140.626 138.786C178.565 134.918 217.65 144.939 249.584 169.737C257.944 176.225 267.551 184.889 277.478 194.333C295.118 211.084 313.764 230.221 328.097 243.696V243.688Z',
  'M267.402 320.196C254.208 333.313 240.623 346.055 227.382 359.133C214.834 371.524 201.226 380.843 186.768 385.858C150.21 412.528 106.586 432.109 66.207 419.772C79.4485 428.608 94.6005 435.579 111.663 440.625C169.901 457.828 222.274 444.29 265.585 402.491C278.546 389.983 291.421 377.404 304.257 364.779C292.84 348.847 281.595 333.305 267.394 320.204L267.402 320.196Z',
]

/* The P outline paths (stem + bowl) — dim resting layer and finale glow */
const P_PATHS = [
  'M660.177 205.188C640.292 173.231 610.089 150.756 569.546 138.778C565.576 137.608 561.63 136.571 557.724 135.666C553.13 130.73 548.256 125.997 543.11 121.481C495.821 79.979 427.368 58.0347 345.158 58.0347H58.4163V158.554C49.5965 164.38 41.2289 171.141 33.4619 178.799C19.3314 192.75 8.27343 208.744 0.381592 225.892V0H345.151C441.662 0 523.349 26.9274 581.376 77.8812C610.097 103.077 632.29 133.53 647.365 168.372C652.496 180.226 656.769 192.516 660.169 205.188H660.177Z',
  'M649.089 395.558C631.979 436.749 604.561 472.239 567.48 500.663C506.638 547.281 424.039 571.924 328.596 571.924H228.45V792.17H0.390137V360.427C5.10809 370.627 10.988 380.453 18.022 389.725C29.7194 405.135 43.4132 417.854 58.4248 427.843V734.136H170.423V513.889H328.603C409.924 513.889 482.167 492.865 532.06 454.685C559.822 453.086 587.42 444.368 611.844 428.639C626.13 419.444 638.631 408.223 649.089 395.558Z',
]

const paths = (list) => list.map((d, i) => <path key={i} d={d} />)

export default function ManifestoSection() {
  useEffect(() => {
    const mScroll  = document.getElementById('manifestoScroll')
    const mHint    = document.getElementById('manifestoHint')
    const mSteps   = Array.from(document.querySelectorAll('.manifesto-step'))
    const mNumEl   = document.getElementById('manifestoCounterNum')
    const mFillEl  = document.getElementById('manifestoCounterFill')
    const ROMAN    = ['I', 'II', 'III', 'IV', 'V']
    if (!mScroll) return

    // logo trace elements
    const mltSolid   = document.getElementById('mltSolidRect')
    const mltFeather = document.getElementById('mltFeatherRect')
    const mltEdge    = document.getElementById('mltEdgeGlow')
    const mltPGlow   = document.getElementById('mltPGlow')
    const mltInfGlow = document.getElementById('mltInfGlow')

    let mTarget = 0   // raw scroll progress (0–1)
    let mCurrent = 0  // lerped progress
    let alive = true
    let raf = 0

    function ss(e0, e1, x) {
      const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
      return t * t * (3 - 2 * t)
    }

    function readScroll() {
      const rect  = mScroll.getBoundingClientRect()
      const total = mScroll.offsetHeight - window.innerHeight
      if (total <= 0) return
      mTarget = Math.max(0, Math.min(1, -rect.top / total))
    }

    function applyManifesto(p) {
      // Counter
      const idx = Math.min(4, Math.floor(p * 5 + 0.0001))
      if (mNumEl)  mNumEl.textContent  = ROMAN[idx]
      if (mFillEl) mFillEl.style.width = `${(idx / 4) * 100}%`
      if (mHint)   mHint.style.opacity = p > 0.02 ? '0' : '1'

      // Continuous proximity crossfade — no class toggles, pure JS
      const pos = p * 5  // 0 → 5 across all steps
      mSteps.forEach((el, i) => {
        const dist   = i - pos
        const opacity = Math.max(0, 1 - Math.abs(dist) * 2.8)
        const ty     = dist * 30  // ±30px per step unit
        el.style.opacity   = String(opacity)
        el.style.transform = `translateY(calc(-50% + ${ty}px))`
      })
    }

    function updateLogoTrace(p, t) {
      const pc     = Math.max(0, Math.min(1, p))
      // Phase 1: wipe draws ∞ left → right (0 → ~0.88)
      const pI     = ss(0.0, 0.88, pc)
      // Phase 2: after ∞ is drawn, P fills solid, then both lock
      const pFill  = ss(0.78, 0.94, pc)
      const infLock = ss(0.82, 0.96, pc)
      const wipeX  = 20 + (660 - 20) * pI

      if (mltSolid)   mltSolid.setAttribute('width', String(wipeX + 240))
      if (mltFeather) mltFeather.setAttribute('x', String(wipeX))
      if (mltEdge) {
        mltEdge.setAttribute('transform', `translate(${wipeX} 0)`)
        const breath = 0.85 + 0.15 * Math.sin(t * 0.006)
        const fade   = ss(0.0, 0.06, pc) * (1 - ss(0.72, 0.86, pc))
        mltEdge.style.opacity = String(fade * breath)
      }
      if (mltInfGlow) {
        const o = String(infLock)
        mltInfGlow.style.opacity = o
        mltInfGlow.setAttribute('opacity', o)
      }
      if (mltPGlow) {
        const o = String(pFill)
        mltPGlow.style.opacity = o
        mltPGlow.setAttribute('opacity', o)
      }
    }

    // single rAF loop: lerp + apply + logo
    function mLoop(t) {
      if (!alive) return
      readScroll()
      mCurrent += (mTarget - mCurrent) * 0.07
      if (Math.abs(mTarget - mCurrent) < 0.0003) mCurrent = mTarget
      applyManifesto(mCurrent)
      updateLogoTrace(mCurrent, t)
      raf = requestAnimationFrame(mLoop)
    }
    raf = requestAnimationFrame(mLoop)

    window.addEventListener('resize', readScroll, { passive: true })
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', readScroll)
    }
  }, [])

  return (
    <section className="manifesto" id="manifesto">
      <div className="manifesto-scroll" id="manifestoScroll">
        <div className="manifesto-stage" id="manifestoStage">
          <div className="manifesto-grid-bg"></div>

          {/* P∞ logo trace — revealed by scroll */}
          <div className="manifesto-logo-layer">
            <svg viewBox="0 0 672 793" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="mlt-grad" x1="0" y1="0" x2="672" y2="793" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.35" stopColor="#A78BFA" />
                  <stop offset="1" stopColor="#6C43D0" />
                </linearGradient>
                <filter id="mlt-bloom" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="mlt-bloom-strong" x="-120%" y="-120%" width="340%" height="340%">
                  <feGaussianBlur stdDeviation="20" />
                </filter>
                <filter id="mlt-edge-blur" x="-300%" y="-60%" width="700%" height="220%">
                  <feGaussianBlur stdDeviation="14" />
                </filter>
                <linearGradient id="mlt-feather" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="white" />
                  <stop offset="1" stopColor="black" />
                </linearGradient>
                <mask id="mlt-wipe" maskUnits="userSpaceOnUse" x="-240" y="-40" width="1152" height="873">
                  <rect x="-240" y="-40" width="1152" height="873" fill="black" />
                  <rect id="mltSolidRect" x="-240" y="-40" width="260" height="873" fill="white" />
                  <rect id="mltFeatherRect" x="20" y="-40" width="110" height="873" fill="url(#mlt-feather)" />
                </mask>
                <clipPath id="mlt-inf-clip">{paths(INF_PATHS)}</clipPath>
              </defs>

              {/* 1 — dim resting full P∞ (ghost guide only) */}
              <g fill="#A78BFA" opacity="0.09">
                {paths(P_PATHS)}
                {paths(INF_PATHS)}
              </g>

              {/* 2 — ∞ only: wipe fills left → right */}
              <g mask="url(#mlt-wipe)" filter="url(#mlt-bloom)" opacity="0.72">
                <g fill="url(#mlt-grad)">{paths(INF_PATHS)}</g>
              </g>

              {/* 3 — glowing leading edge clipped to ∞ ribbon */}
              <g clipPath="url(#mlt-inf-clip)">
                <g id="mltEdgeGlow" style={{ opacity: 0 }}>
                  <rect x="-16" y="138" width="32" height="320" fill="#A78BFA" filter="url(#mlt-edge-blur)" />
                  <rect x="-3" y="138" width="6" height="320" fill="#ffffff" filter="url(#mlt-edge-blur)" />
                </g>
              </g>

              {/* 4 — P fills solid after ∞ wipe completes */}
              <g id="mltPGlow" opacity="0">
                <g filter="url(#mlt-bloom-strong)" fill="#A78BFA" opacity="0.55">{paths(P_PATHS)}</g>
                <g fill="url(#mlt-grad)" opacity="1">{paths(P_PATHS)}</g>
              </g>

              {/* 5 — ∞ bloom lock once P is in */}
              <g id="mltInfGlow" opacity="0">
                <g filter="url(#mlt-bloom-strong)" fill="#A78BFA" opacity="0.5">{paths(INF_PATHS)}</g>
                <g fill="url(#mlt-grad)" opacity="1">{paths(INF_PATHS)}</g>
              </g>
            </svg>
          </div>

          <div className="manifesto-vignette"></div>

          <div className="manifesto-inner">
            <div className="manifesto-top">
              <div className="manifesto-label">
                A note. Read slowly.
              </div>
              <div className="manifesto-counter">
                <span className="manifesto-counter-num" id="manifestoCounterNum">I</span>
                <span className="manifesto-counter-of">/ V</span>
                <div className="manifesto-counter-bar">
                  <div className="manifesto-counter-fill" id="manifestoCounterFill"></div>
                </div>
              </div>
            </div>

            <div className="manifesto-headline-wrap">
              <div className="manifesto-headlines" id="manifestoHeadlines">
                {STEPS.map((step, i) => (
                  <div key={i} className={`manifesto-step${i === 0 ? ' is-active' : ' is-after'}`} data-step={i}>
                    <h2 className="manifesto-step-headline">{step.text}</h2>
                  </div>
                ))}
              </div>
            </div>

            <div className="manifesto-hint" id="manifestoHint">
              SCROLL
              <div className="manifesto-hint-arr"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
