import { useEffect, useRef, useState, useCallback } from 'react'

export default function Home() {
  const initialized = useRef(false)

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    /* ── CUSTOM CURSOR ───────────────────────────────────────── */
    const cursor = document.getElementById('cursor')
    let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX
      targetY = e.clientY
    })
    function animateCursor() {
      cursorX += (targetX - cursorX) * 0.18
      cursorY += (targetY - cursorY) * 0.18
      if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`
      requestAnimationFrame(animateCursor)
    }
    animateCursor()
    document.querySelectorAll('a, button, .pf-card, .filter-col, .backed-logo, .offer-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor && cursor.classList.add('is-hover'))
      el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('is-hover'))
    })

    /* ── MAGNETIC BUTTONS ────────────────────────────────────── */
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`
      })
      btn.addEventListener('mouseleave', () => { btn.style.transform = '' })
    })

    /* ── LOADER + SCROLL-SCRUBBED VIDEO ──────────────────────── */
    const video = document.getElementById('scrubVideo')
    const scrubBlock = document.getElementById('scrubBlock')
    const panel1 = document.getElementById('panel1')
    const panel2 = document.getElementById('panel2')
    const panel3 = document.getElementById('panel3')
    const scrollCue = document.getElementById('scrollCue')
    const progressBar = document.getElementById('progress')
    const loader = document.getElementById('loader')
    const loaderBar = document.getElementById('loaderBar')
    const loaderText = document.getElementById('loaderText')

    let videoDuration = 0
    let ticking = false
    let lastScrubTime = -1
    let videoReady = false
    let loadingFinished = false

    let loadProgress = 0
    const loaderInterval = setInterval(() => {
      loadProgress = Math.min(loadProgress + Math.random() * 14, 95)
      if (loaderBar) loaderBar.style.width = loadProgress + '%'
    }, 110)

    function tryInit() {
      if (loadingFinished) return
      if (!video || !video.duration || isNaN(video.duration)) return
      videoDuration = video.duration
      videoReady = true
      try {
        const warmup = video.play()
        if (warmup && warmup.then) warmup.then(() => { video.pause(); video.currentTime = 0 }).catch(() => {})
      } catch (e) {}
      finishLoading()
    }

    if (video) {
      video.addEventListener('loadedmetadata', tryInit)
      video.addEventListener('loadeddata', tryInit)
      video.addEventListener('canplay', tryInit)
      if (video.readyState >= 1) tryInit()
    }

    setTimeout(() => {
      if (!loadingFinished) {
        if (video && video.duration && !isNaN(video.duration)) {
          videoDuration = video.duration; videoReady = true
        } else {
          videoDuration = 15; videoReady = true
        }
        finishLoading()
      }
    }, 3000)

    function finishLoading() {
      if (loadingFinished) return
      loadingFinished = true
      clearInterval(loaderInterval)
      if (loaderBar) loaderBar.style.width = '100%'
      if (loaderText) loaderText.textContent = 'Welcome'
      setTimeout(() => {
        if (loader) loader.classList.add('is-hidden')
        document.body.classList.add('is-loaded')
        onScroll()
      }, 500)
    }

    function updateScrub() {
      if (!videoReady || !scrubBlock) return
      const rect = scrubBlock.getBoundingClientRect()
      const blockHeight = scrubBlock.offsetHeight
      const viewportHeight = window.innerHeight
      const scrollable = blockHeight - viewportHeight
      let progress = -rect.top / scrollable
      progress = Math.max(0, Math.min(1, progress))

      const targetTime = progress * videoDuration
      if (Math.abs(targetTime - lastScrubTime) > 0.01) {
        video.currentTime = targetTime
        lastScrubTime = targetTime
      }

      let active = 1
      if (progress > 0.900) active = 3
      else if (progress > 0.28) active = 2
      if (panel1) panel1.classList.toggle('is-active', active === 1)
      if (panel2) panel2.classList.toggle('is-active', active === 2)
      if (panel3) panel3.classList.toggle('is-active', active === 3)

      if (scrollCue) scrollCue.style.opacity = progress > 0.04 ? '0' : '1'

      const totalScroll = document.documentElement.scrollHeight - viewportHeight
      const pageProgress = (window.scrollY / totalScroll) * 100
      if (progressBar) progressBar.style.width = pageProgress + '%'

      updateSectionDots()
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => { updateScrub(); ticking = false })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    /* ── SECTION DOTS ────────────────────────────────────────── */
    const sectionIds = ['scrubBlock', 'impact', 'offer', 'manifestoScroll', 'filter', 'portfolio', 'apply']
    const dots = document.querySelectorAll('.section-dot')
    function updateSectionDots() {
      const center = window.innerHeight / 2
      let activeIdx = 0
      sectionIds.forEach((id, idx) => {
        const el = document.getElementById(id)
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top < center && r.bottom > center) activeIdx = idx
      })
      dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx))
    }

    /* ── IMPACT COUNT-UP ─────────────────────────────────────── */
    const impactSection = document.getElementById('impact')
    if (impactSection) {
      const impactObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { countUpAll(); impactObs.disconnect() }
        })
      }, { threshold: 0.4 })
      impactObs.observe(impactSection)
    }

    function countUpAll() {
      document.querySelectorAll('.impact-num').forEach((el) => {
        const target = parseInt(el.dataset.target, 10)
        const prefix = el.dataset.prefix || ''
        const symbol = el.querySelector('.symbol')
        const symbolText = symbol ? symbol.outerHTML : ''
        const duration = 1800
        const start = performance.now()
        function frame(now) {
          const elapsed = now - start
          const t = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          const value = Math.round(target * eased)
          el.innerHTML = prefix + value + symbolText
          if (t < 1) requestAnimationFrame(frame)
          else el.classList.add('is-done')
        }
        requestAnimationFrame(frame)
      })
    }

    /* ── FILTER LIST REVEAL ──────────────────────────────────── */
    const filterItems = document.querySelectorAll('.filter-list li')
    const filterRevealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const li = entry.target
          const delay = Array.from(li.parentElement.children).indexOf(li) * 120
          setTimeout(() => li.classList.add('is-revealed'), delay)
          filterRevealObs.unobserve(li)
        }
      })
    }, { threshold: 0.3 })
    filterItems.forEach(li => filterRevealObs.observe(li))

    /* ── MANIFESTO — LERP-DRIVEN SCROLL ─────────────────────── */
    ;(() => {
      const mScroll  = document.getElementById('manifestoScroll')
      const mHint    = document.getElementById('manifestoHint')
      const mSteps   = Array.from(document.querySelectorAll('.manifesto-step'))
      const mNumEl   = document.getElementById('manifestoCounterNum')
      const mFillEl  = document.getElementById('manifestoCounterFill')
      const ROMAN    = ['I','II','III','IV','V']
      if (!mScroll) return

      // logo trace elements
      const mltSolid   = document.getElementById('mltSolidRect')
      const mltFeather = document.getElementById('mltFeatherRect')
      const mltEdge    = document.getElementById('mltEdgeGlow')
      const mltPGlow   = document.getElementById('mltPGlow')
      const mltInfGlow = document.getElementById('mltInfGlow')

      let mTarget = 0   // raw scroll progress (0–1)
      let mCurrent = 0  // lerped progress

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
        const pI     = ss(0.0, 0.9, pc)
        const finale = ss(0.86, 1.0, pc)
        const wipeX  = 20 + (660 - 20) * pI

        if (mltSolid)   mltSolid.setAttribute('width', String(wipeX + 240))
        if (mltFeather) mltFeather.setAttribute('x', String(wipeX))
        if (mltEdge) {
          mltEdge.setAttribute('transform', `translate(${wipeX} 0)`)
          const breath = 0.85 + 0.15 * Math.sin(t * 0.006)
          const fade   = ss(0.0, 0.06, pc) * (1 - ss(0.82, 0.92, pc))
          mltEdge.style.opacity = String(fade * breath)
        }
        if (mltInfGlow) mltInfGlow.style.opacity = String(finale * (0.82 + 0.18 * Math.sin(t * 0.0028)))
        if (mltPGlow)   mltPGlow.style.opacity   = String(finale * (0.85 + 0.15 * Math.sin(t * 0.0028 + 1.1)))
      }

      // single rAF loop: lerp + apply + logo
      ;(function mLoop(t) {
        readScroll()
        mCurrent += (mTarget - mCurrent) * 0.07
        if (Math.abs(mTarget - mCurrent) < 0.0003) mCurrent = mTarget
        applyManifesto(mCurrent)
        updateLogoTrace(mCurrent, t)
        requestAnimationFrame(mLoop)
      })(0)

      window.addEventListener('resize', readScroll, { passive: true })
    })()

    /* ── FILTER DIVIDER DRAW-IN ──────────────────────────────── */
    const filterSec = document.querySelector('.filter-section')
    if (filterSec) {
      const filterObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { filterSec.classList.add('is-in-view'); filterObs.disconnect() }
        })
      }, { threshold: 0.15 })
      filterObs.observe(filterSec)
    }

    /* ── PORTFOLIO ROWS FADE-UP ──────────────────────────────── */
    const pfRows = document.querySelectorAll('.portfolio-row')
    const pfRowObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in-view'); pfRowObs.unobserve(e.target) }
      })
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' })
    pfRows.forEach(r => pfRowObs.observe(r))

    /* ── PORTFOLIO THUMBNAIL CURSOR TOOLTIP ─────────────────── */
    ;(() => {
      const cursor = document.getElementById('pfCursor')
      if (!cursor) return

      // The global dot cursor — hide it while the pill tooltip is active
      const globalCursor = document.getElementById('cursor')

      // Target only the thumbnail/right side — left text panel keeps normal cursor
      const thumbs = Array.from(document.querySelectorAll('.portfolio-row[data-url] .portfolio-row-right'))
      let mx = 0, my = 0, cx = 0, cy = 0

      document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY }, { passive: true })

      thumbs.forEach(thumb => {
        const row = thumb.closest('.portfolio-row[data-url]')
        const url = row ? row.dataset.url : null

        thumb.addEventListener('mouseenter', () => {
          cursor.classList.add('is-visible')
          if (globalCursor) globalCursor.style.opacity = '0'
        })
        thumb.addEventListener('mouseleave', () => {
          cursor.classList.remove('is-visible')
          if (globalCursor) globalCursor.style.opacity = '1'
        })
        thumb.addEventListener('click', () => {
          if (url) window.open(url, '_blank', 'noopener,noreferrer')
        })
      })

      function loop() {
        cx += (mx - cx) * 0.14
        cy += (my - cy) * 0.14
        cursor.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) translate(-50%, -50%)`
        requestAnimationFrame(loop)
      }
      loop()
    })()

    /* ── HERO MOUSE-MOVE PARALLAX ───────────────────────────── */
    ;(() => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

      // Exact same normalisation as vital-ventures/useMouseParallax.js:
      //   x = (clientX / W) * 2 - 1        → -1 left … +1 right
      //   y = -((clientY / H) * 2 - 1)     → +1 top  … -1 bottom (Y inverted)
      let W = window.innerWidth, H = window.innerHeight
      const tgt = { x: 0, y: 0 }
      const cur = { x: 0, y: 0 }

      // pointermove — matches vital-ventures; works for mouse and stylus
      window.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return   // skip touch/stylus
        tgt.x =  (e.clientX / W) * 2 - 1
        tgt.y = -((e.clientY / H) * 2 - 1)
      }, { passive: true })
      window.addEventListener('resize', () => {
        W = window.innerWidth; H = window.innerHeight
      }, { passive: true })

      const videoEl = document.getElementById('scrubVideo')

      const layers = [
        { el: videoEl,                                        xMax: 16, yMax: 10 },
        { el: document.querySelector('.panel-1-headline'),   xMax: 22, yMax: 13 },
        { el: document.querySelector('.panel-1-meta'),       xMax: 28, yMax: 17 },
        { el: document.querySelector('.panel-1-actions'),    xMax: 26, yMax: 15 },
        { el: document.querySelector('.panel-1-status'),     xMax: 38, yMax: 22 },
        { el: document.getElementById('scrollCue'),          xMax: 10, yMax:  6 },
      ].filter(l => l.el)

      layers.forEach(l => { l.el.style.willChange = 'transform' })

      // After entrance animations finish, strip the transform transition so the
      // CSS 0.7 s ease doesn't add lag on top of the rAF loop.
      setTimeout(() => {
        ['.panel-1-meta', '.panel-1-actions', '.panel-1-status'].forEach(sel => {
          const el = document.querySelector(sel)
          if (el) el.style.transition = 'opacity 0.7s ease'
        })
      }, 2200)

      function loop() {
        // friction = 0.05 — identical to vital-ventures/useMouseParallax.js
        cur.x += (tgt.x - cur.x) * 0.05
        cur.y += (tgt.y - cur.y) * 0.05

        // Translate all layers (depth by speed)
        for (const l of layers) {
          l.el.style.setProperty('--prl-x', (cur.x * l.xMax).toFixed(2) + 'px')
          l.el.style.setProperty('--prl-y', (cur.y * l.yMax).toFixed(2) + 'px')
        }

        // 3-D lens-tilt on the video — closest CSS approximation of the
        // vital-ventures UV-warp + barrel-distortion shader effect.
        // At mouse edge: ±1.4° rotateY, ±0.9° rotateX — imperceptible as
        // distortion but adds the "looking through a shifting lens" depth.
        if (videoEl) {
          videoEl.style.setProperty('--prl-rx',  (cur.x * 1.4).toFixed(3) + 'deg')
          videoEl.style.setProperty('--prl-ry', (-cur.y * 0.9).toFixed(3) + 'deg')
        }

        requestAnimationFrame(loop)
      }
      loop()
    })()

    /* ── FINAL CTA MOUSE PARALLAX ────────────────────────────── */
    const finalHeadline = document.getElementById('finalHeadline')
    const finalCta = document.getElementById('apply')
    if (finalCta && finalHeadline) {
      let fX = 0, fY = 0, tX = 0, tY = 0
      finalCta.addEventListener('mousemove', (e) => {
        const r = finalCta.getBoundingClientRect()
        tX = (e.clientX - r.left - r.width / 2) / r.width
        tY = (e.clientY - r.top - r.height / 2) / r.height
      })
      finalCta.addEventListener('mouseleave', () => { tX = 0; tY = 0 })
      function animateFinal() {
        fX += (tX - fX) * 0.08
        fY += (tY - fY) * 0.08
        finalHeadline.style.transform = `translate(${fX * 18}px, ${fY * 10}px)`
        requestAnimationFrame(animateFinal)
      }
      animateFinal()
    }

    /* ── VELOCITY MARQUEE ────────────────────────────────────── */
    const velTrack = document.getElementById('velocityTrack')
    const velSection = document.getElementById('velocityMarquee')
    if (velTrack && velSection) {
      let trackX = 0, lastY = window.scrollY, velocity = 0
      const baseSpeed = 3.0
      let halfWidth = 0
      function measureHalf() { halfWidth = velTrack.scrollWidth / 2 }
      requestAnimationFrame(() => requestAnimationFrame(measureHalf))
      window.addEventListener('resize', measureHalf)
      const originals = Array.from(velTrack.children)
      originals.forEach(node => velTrack.appendChild(node.cloneNode(true)))
      requestAnimationFrame(() => requestAnimationFrame(measureHalf))
      function tickMarquee() {
        const y = window.scrollY
        const dy = y - lastY
        lastY = y
        velocity = velocity * 0.88 + dy * 0.6
        trackX -= baseSpeed + Math.abs(velocity) * 0.35
        if (halfWidth > 0 && trackX <= -halfWidth) trackX += halfWidth
        velTrack.style.transform = `translate3d(${trackX}px, 0, 0)`
        velSection.classList.toggle('is-fast', Math.abs(velocity) > 6)
        requestAnimationFrame(tickMarquee)
      }
      tickMarquee()
    }

    /* ── FINAL CTA STATS COUNT-UP ────────────────────────────── */
    ;(() => {
      const statsEl = document.getElementById('finalStats')
      if (!statsEl) return
      const items = Array.from(statsEl.querySelectorAll('.final-cta-stat'))

      function animateCount(el, from, to, dur = 1100) {
        const valEl = el.querySelector('.final-cta-stat-val')
        if (!valEl) return
        const t0 = performance.now()
        function tick(now) {
          const k = Math.min(1, (now - t0) / dur)
          const e = 1 - Math.pow(1 - k, 3)
          valEl.textContent = String(Math.round(from + (to - from) * e))
          if (k < 1) requestAnimationFrame(tick)
          else valEl.textContent = String(to)
        }
        requestAnimationFrame(tick)
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const el = entry.target
          const idx = items.indexOf(el)
          setTimeout(() => {
            el.classList.add('is-in')
            if (el.dataset.type === 'count') {
              animateCount(el, parseFloat(el.dataset.from || '0'), parseFloat(el.dataset.to || '0'))
            }
          }, idx * 180)
          io.unobserve(el)
        })
      }, { threshold: 0.35 })

      items.forEach(el => io.observe(el))
    })()

    /* ── FINAL CTA SECTION REVEAL ────────────────────────────── */
    const finalCtaSection = document.getElementById('apply')
    if (finalCtaSection) {
      const finalCtaObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          e.target.classList.toggle('is-in-view', e.isIntersecting)
        })
      }, { threshold: 0.1 })
      finalCtaObs.observe(finalCtaSection)
    }

    /* ── STACKING PORTFOLIO CARDS ───────────────────────────── */
    const pfStack = document.querySelector('.pf-stack')
    if (pfStack) {
      const stackCards = Array.from(pfStack.querySelectorAll('.portfolio-row'))
      // Skip the scroll-reveal animation — cards are already visible in the stack
      stackCards.forEach(card => card.classList.add('is-in-view'))
      const STACK_TOP = 100 // matches sticky top in CSS
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
    }

  }, [])

  return (
    <>
      {/* CUSTOM CURSOR */}
      <div className="cursor" id="cursor"></div>

      {/* LOADER */}
      <div className="loader" id="loader">
        <div className="loader-inner">
          <img className="loader-logo" id="loaderLogo" src="/pv-favicon.png" alt="Persist Foundry" />
          <div className="loader-bar"><div className="loader-bar-fill" id="loaderBar"></div></div>
          <div className="loader-text" id="loaderText">Loading</div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="progress" id="progress"></div>

      {/* SECTION DOTS */}
      <div className="section-dots" id="sectionDots">
        <div className="section-dot is-active" data-section="hero"></div>
        <div className="section-dot" data-section="impact"></div>
        <div className="section-dot" data-section="offer"></div>
        <div className="section-dot" data-section="manifesto"></div>
        <div className="section-dot" data-section="filter"></div>
        <div className="section-dot" data-section="portfolio"></div>
        <div className="section-dot" data-section="apply"></div>
      </div>

      {/* SCROLL-SCRUB VIDEO */}
      <section className="scrub-block" id="scrubBlock">
        <div className="scrub-sticky">
          <video
            className="scrub-video"
            id="scrubVideo"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
          >
            <source src="/assets/scrub-video.mp4"  type="video/mp4"  />
          </video>

          <div className="scrub-vignette"></div>

          {/* PANEL 1 — HERO */}
          <div className="panel panel-1 is-active" id="panel1">
            {/* <div className="panel-1-meta"><span className="dot"></span>Cohort 2026 / Open</div> */}
            <h1 className="panel-1-headline">
              <span className="word" style={{'--i': 0}}><span>Bet</span></span>
              <span className="word" style={{'--i': 1}}><span>on</span></span>
              <span className="word" style={{'--i': 2}}><span><em>yourself.</em></span></span>
            </h1>
            <div className="panel-1-actions">
              <button className="btn-primary" data-magnetic onClick={() => scrollTo('apply')}>
                Apply for fellowship
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="panel-1-status">
              <span className="strong">Persist</span><br />
              Backed by founders of Tether
            </div>
          </div>

          {/* PANEL 2 — RECOGNITION */}
          <div className="panel panel-2" id="panel2">
            <div className="panel-2-inner">
              
              <div className="panel-2-plate">
                <h2 className="panel-2-headline">
                  <span className="word" style={{'--i': 0}}><span>The</span></span>
                  <span className="word" style={{'--i': 1}}><span>longer</span></span>
                  <span className="word" style={{'--i': 2}}><span>you</span></span>
                  <span className="word" style={{'--i': 3}}><span>hold,</span></span><br />
                  <span className="word" style={{'--i': 4}}><span><em>the</em></span></span>
                  <span className="word" style={{'--i': 5}}><span><em>more</em></span></span>
                  <span className="word" style={{'--i': 6}}><span><em>the</em></span></span>
                  <span className="word" style={{'--i': 7}}><span><em>world</em></span></span>
                  <span className="word" style={{'--i': 8}}><span><em>owes</em></span></span>
                  <span className="word" style={{'--i': 9}}><span><em>you.</em></span></span>
                </h2>
                <p className="panel-2-subline">Most people quit one year before it compounds.</p>
              </div>
            </div>
          </div>

          {/* PANEL 3 — TRANSFORMATION */}
          <div className="panel panel-3" id="panel3">
            
            <h2 className="panel-3-headline">
              <span className="word" style={{'--i': 0}}><span>You've</span></span>
              <span className="word" style={{'--i': 1}}><span>already</span></span>
              <span className="word" style={{'--i': 2}}><span>made</span></span>
              <span className="word" style={{'--i': 3}}><span>the</span></span>
              <span className="word" style={{'--i': 4}}><span>bet.</span></span><br />
              <span className="word" style={{'--i': 5}}><span><em>We're</em></span></span>
              <span className="word" style={{'--i': 6}}><span><em>just</em></span></span>
              <span className="word" style={{'--i': 7}}><span><em>here</em></span></span>
              <span className="word" style={{'--i': 8}}><span><em>to</em></span></span>
              <span className="word" style={{'--i': 9}}><span><em>match</em></span></span>
              <span className="word" style={{'--i': 10}}><span><em>it.</em></span></span>
            </h2>
            <div className="panel-3-actions">
              <button className="btn-primary" data-magnetic onClick={() => scrollTo('apply')}>
                Apply for fellowship
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="btn-ghost" onClick={() => scrollTo('filter')}>
                See if you fit
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO LOGO MARQUEE */}
      <div className="marquee-wrapper">
        <div className="marquee-eyebrow">
          <span className="marquee-eyebrow-inner">Forged at the Foundry</span>
        </div>
        <div className="marquee-band">
          <div className="marquee-track">
            <div className="marquee-logo"><img src="/assets/opendroids.png" alt="Open Droids" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/bumpfm.png" alt="Bump.fm" loading="lazy" /></div>
            <div className="marquee-logo is-stacked"><img src="/assets/mememates.png" alt="MemeMates" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/gifstudios.png" alt="GIFStudios" loading="lazy" /></div>
            <div className="marquee-logo is-stacked"><img src="/assets/ascension.png" alt="Ascension Studio" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/vibescoded.png" alt="Vibescoded" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/creatorships.png" alt="Creatorships" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/opendroids.png" alt="Open Droids" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/bumpfm.png" alt="Bump.fm" loading="lazy" /></div>
            <div className="marquee-logo is-stacked"><img src="/assets/mememates.png" alt="MemeMates" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/gifstudios.png" alt="GIFStudios" loading="lazy" /></div>
            <div className="marquee-logo is-stacked"><img src="/assets/ascension.png" alt="Ascension Studio" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/vibescoded.png" alt="Vibescoded" loading="lazy" /></div>
            <div className="marquee-logo"><img src="/assets/creatorships.png" alt="Creatorships" loading="lazy" /></div>
          </div>
        </div>
      </div>

      {/* BACKED BY — Who's behind us */}
      <section className="backed-v2" id="backed">
        <div className="backed-v2-inner">
          <div className="backed-v2-header">
            <div className="backed-v2-eyebrow">Forged at the Foundry · Who's behind us</div>
            <h3 className="backed-v2-statement">
              The same people who backed <em>Tether</em><br />
              when stablecoin wasn't even a word yet —<br />
              they wrote the cheque to us.
              <span className="small">We write the cheque to you. The chain stays unbroken.</span>
            </h3>
          </div>
          <div className="backed-v2-list">
            <a href="https://tether.to/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell is-featured" style={{'--brand-bg':'#26A17B','--logo-invert':'1'}}>
              <img src="/assets/tether.png" alt="Tether" className="backed-v2-logo" />
              <div className="backed-v2-tag">Founders of</div>
            </a>
            <a href="https://dna.fund/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell" style={{'--brand-bg':'#111111','--logo-invert':'1'}}>
              <img src="/assets/dna.png" alt="DNA Fund" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
            <a href="https://blockchainff.com/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell" style={{'--brand-bg':'#f89520','--logo-invert':'0'}}>
              <img src="/assets/blockchain-fund.png" alt="Blockchain FF" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
            <a href="https://percival.vc/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell" style={{'--brand-bg':'#111111','--logo-invert':'1'}}>
              <img src="/assets/percival.png" alt="Percival" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
            <a href="https://welara.com/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell is-welara" style={{'--brand-bg':'#fff6e5','--logo-invert':'0'}}>
              <img src="/assets/w.png" alt="Welara" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="impact" id="impact">
        <div className="impact-inner">
          <div className="impact-header">
            <div className="impact-eyebrow">
              <span className="impact-eyebrow-dot"></span>
              Nine years, in numbers
            </div>
            <div className="impact-year-range">2016 — 2025</div>
          </div>
          <div className="impact-grid">
            <div className="impact-stat">
              <div className="impact-num" data-target="30">0<span className="symbol">+</span></div>
              <div className="impact-label">Companies built</div>
            </div>
            <div className="impact-stat">
              <div className="impact-num" data-target="117" data-prefix="$">0<span className="symbol">M</span></div>
              <div className="impact-label">Net asset value</div>
            </div>
            <div className="impact-stat">
              <div className="impact-num" data-target="400">0<span className="symbol">+</span></div>
              <div className="impact-label">Operators &amp; allies</div>
            </div>
            <div className="impact-stat">
              <div className="impact-num" data-target="67">0<span className="symbol">B</span></div>
              <div className="impact-label">Impressions across portfolio</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS — WHAT WE RUN · 05 */}
      <ProgramsSection />

      {/* PORTFOLIO v2 */}
      <section className="portfolio-v2" id="portfolio">
        <div className="portfolio-v2-inner">
          <div className="portfolio-v2-header">
            <div>
              <h2 className="portfolio-v2-title"><em>They bet.</em><br />We backed it.</h2>
              <div className="portfolio-v2-meta">Three of thirty.</div>
            </div>
            <div className="portfolio-v2-sub">
              We don't pick winners. We pick people who can't stop. Here's what nine years of that looks like.
            </div>
          </div>

          <div className="pf-stack">

            <div className="portfolio-row" data-row="0" data-url="https://opendroids.com/">
              <div className="portfolio-row-left">
                <div className="portfolio-row-tag">Robotics</div>
                <h3 className="portfolio-row-name"><em>Open Droids</em></h3>
                <p className="portfolio-row-desc">
                  Home robots that earn their keep. Built by someone who got tired of waiting for the future to arrive.
                </p>
                <div className="portfolio-row-stats">
                  <div>
                    <div className="portfolio-row-stat-num">Pre-seed</div>
                    <div className="portfolio-row-stat-label">Where they started</div>
                  </div>
                  <div>
                    <div className="portfolio-row-stat-num">Series A<em>→</em></div>
                    <div className="portfolio-row-stat-label">Where they're going</div>
                  </div>
                </div>
              </div>
              <div className="portfolio-row-right">
                <img src="/assets/opendroid-thumbnail.webp" alt="Open Droids" className="portfolio-row-thumb" />
                <div className="portfolio-row-thumb-overlay"></div>
                <div className="portfolio-row-meta">Case 01 / 03</div>
                <div className="portfolio-row-visual-corner tl"></div>
                <div className="portfolio-row-visual-corner tr"></div>
                <div className="portfolio-row-visual-corner bl"></div>
                <div className="portfolio-row-visual-corner br"></div>
              </div>
            </div>

            <div className="portfolio-row is-reversed" data-row="1" data-url="https://facesearchai.com/">
              <div className="portfolio-row-left">
                <div className="portfolio-row-tag">AI Privacy</div>
                <h3 className="portfolio-row-name"><em>Face Search</em></h3>
                <p className="portfolio-row-desc">
                  Find every place your face lives online. Built by someone who couldn't sleep until the problem was solved.
                </p>
                <div className="portfolio-row-stats">
                  <div>
                    <div className="portfolio-row-stat-num">400K</div>
                    <div className="portfolio-row-stat-label">Users</div>
                  </div>
                  <div>
                    <div className="portfolio-row-stat-num">$8K<em>MRR</em></div>
                    <div className="portfolio-row-stat-label">Climbing</div>
                  </div>
                </div>
              </div>
              <div className="portfolio-row-right">
                <img src="/assets/facesearch-ai-thumbnail.webp" alt="Face Search AI" className="portfolio-row-thumb" />
                <div className="portfolio-row-thumb-overlay"></div>
                <div className="portfolio-row-meta">Case 02 / 03</div>
                <div className="portfolio-row-visual-corner tl"></div>
                <div className="portfolio-row-visual-corner tr"></div>
                <div className="portfolio-row-visual-corner bl"></div>
                <div className="portfolio-row-visual-corner br"></div>
              </div>
            </div>

            <div className="portfolio-row" data-row="2" data-url="https://swissmote.com/">
              <div className="portfolio-row-left">
                <div className="portfolio-row-tag">Talent</div>
                <h3 className="portfolio-row-name"><em>Swissmote</em></h3>
                <p className="portfolio-row-desc">
                  Hiring the world's most overlooked builders. Built by someone who heard "no" so many times he rewrote the rules.
                </p>
                <div className="portfolio-row-stats">
                  <div>
                    <div className="portfolio-row-stat-num">Profitable</div>
                    <div className="portfolio-row-stat-label">No outside capital</div>
                  </div>
                  <div>
                    <div className="portfolio-row-stat-num">Global</div>
                    <div className="portfolio-row-stat-label">Day one</div>
                  </div>
                </div>
              </div>
              <div className="portfolio-row-right">
                <img src="/assets/swissmote-thimbnaail.webp" alt="Swissmote" className="portfolio-row-thumb" />
                <div className="portfolio-row-thumb-overlay"></div>
                <div className="portfolio-row-meta">Case 03 / 03</div>
                <div className="portfolio-row-visual-corner tl"></div>
                <div className="portfolio-row-visual-corner tr"></div>
                <div className="portfolio-row-visual-corner bl"></div>
                <div className="portfolio-row-visual-corner br"></div>
              </div>
            </div>

          </div>

          <div className="portfolio-v2-cta">
            <p className="portfolio-v2-cta-label">Three of thirty. <em>The rest are just as relentless.</em></p>
            <a href="#" className="portfolio-v2-cta-link" data-magnetic>
              See all thirty <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Portfolio custom cursor tooltip — fixed, follows mouse over thumbnails */}
      <div className="pf-cursor" id="pfCursor" aria-hidden="true">
        <span className="pf-cursor-pip"></span>
        <span className="pf-cursor-label">Visit Website</span>
        <span className="pf-cursor-icon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 10L10 2M10 2H4.5M10 2V7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      

      {/* SIX THINGS — HORIZONTAL PINNED SCROLL */}
      <SixThingsSection />

      {/* MANIFESTO — CONVERGING DOTS NARRATIVE */}
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
                  <clipPath id="mlt-inf-clip">
                    <path d="M600.505 423.072C545.41 458.546 473.557 456.846 422.182 416.537C413.713 409.885 404.075 401.33 394.171 392.136L436.866 352.131C441.881 357.138 446.669 361.684 450.974 365.505C482.346 393.244 518.92 398.078 557.342 380.876C593.877 364.523 615.759 327.652 612.998 287.78C612.047 273.954 609.036 261.5 604.007 250.489L664.396 247.962C665.496 251.471 666.471 255.043 667.375 258.708C682.8 321.281 655.46 387.676 600.497 423.08L600.505 423.072Z" />
                    <path d="M164.512 447.894C114.595 450.81 64.3511 429.622 31.0681 385.765C-15.4485 324.455 -9.10075 237.769 45.8848 183.494C72.2663 157.455 105.97 142.319 140.634 138.786L141.757 196.79C132.835 198.349 123.75 201.188 114.572 205.259C78.7233 221.183 56.6932 257.897 58.284 296.42C59.9216 336.55 84.5564 370.917 122.401 384.127C134.294 388.268 145.757 390.397 156.807 390.561L164.52 447.894H164.512Z" />
                    <path d="M436.875 352.131L394.179 392.136C377.077 376.275 359.141 358.456 344.902 345.066C359.633 330.39 372.344 317.741 388.97 301.185C401.853 315.152 420.592 335.911 436.875 352.139V352.131Z" />
                    <path d="M605.41 165.962C565.031 153.618 521.345 173.651 484.779 200.314C470.321 205.328 456.783 214.202 444.236 226.594C385.07 285.026 326.544 344.098 266.934 402.078C237.535 430.682 201.117 445.772 164.512 447.885L156.799 390.552C182.807 390.95 206.42 380.469 227.311 359.89C286.991 301.122 345.743 241.418 406.024 183.243C449.343 141.445 501.709 127.907 559.946 145.11C577.009 150.155 592.161 157.127 605.402 165.962H605.41Z" />
                    <path d="M664.404 247.954L604.014 250.48C593.853 228.17 575.426 211.793 548.997 202.123C526.078 193.74 504.586 193.421 484.779 200.314C521.337 173.644 565.031 153.618 605.41 165.963C633.913 184.983 653.58 212.596 664.412 247.954H664.404Z" />
                    <path d="M328.097 243.688C313.303 257.047 299.672 269.36 281.954 285.37C270.319 272.745 250.13 249.638 233.153 232.552C228.794 228.154 224.653 224.154 220.917 220.839C197.063 199.651 170.182 191.799 141.749 196.789L140.626 138.786C178.565 134.918 217.65 144.939 249.584 169.737C257.944 176.225 267.551 184.889 277.478 194.333C295.118 211.084 313.764 230.221 328.097 243.696V243.688Z" />
                    <path d="M267.402 320.196C254.208 333.313 240.623 346.055 227.382 359.133C214.834 371.524 201.226 380.843 186.768 385.858C150.21 412.528 106.586 432.109 66.207 419.772C79.4485 428.608 94.6005 435.579 111.663 440.625C169.901 457.828 222.274 444.29 265.585 402.491C278.546 389.983 291.421 377.404 304.257 364.779C292.84 348.847 281.595 333.305 267.394 320.204L267.402 320.196Z" />
                  </clipPath>
                </defs>

                {/* 1 — dim resting full P∞ */}
                <g fill="#A78BFA" opacity="0.09">
                  <path d="M660.177 205.188C640.292 173.231 610.089 150.756 569.546 138.778C565.576 137.608 561.63 136.571 557.724 135.666C553.13 130.73 548.256 125.997 543.11 121.481C495.821 79.979 427.368 58.0347 345.158 58.0347H58.4163V158.554C49.5965 164.38 41.2289 171.141 33.4619 178.799C19.3314 192.75 8.27343 208.744 0.381592 225.892V0H345.151C441.662 0 523.349 26.9274 581.376 77.8812C610.097 103.077 632.29 133.53 647.365 168.372C652.496 180.226 656.769 192.516 660.169 205.188H660.177Z" />
                  <path d="M649.089 395.558C631.979 436.749 604.561 472.239 567.48 500.663C506.638 547.281 424.039 571.924 328.596 571.924H228.45V792.17H0.390137V360.427C5.10809 370.627 10.988 380.453 18.022 389.725C29.7194 405.135 43.4132 417.854 58.4248 427.843V734.136H170.423V513.889H328.603C409.924 513.889 482.167 492.865 532.06 454.685C559.822 453.086 587.42 444.368 611.844 428.639C626.13 419.444 638.631 408.223 649.089 395.558Z" />
                  <path d="M600.505 423.072C545.41 458.546 473.557 456.846 422.182 416.537C413.713 409.885 404.075 401.33 394.171 392.136L436.866 352.131C441.881 357.138 446.669 361.684 450.974 365.505C482.346 393.244 518.92 398.078 557.342 380.876C593.877 364.523 615.759 327.652 612.998 287.78C612.047 273.954 609.036 261.5 604.007 250.489L664.396 247.962C665.496 251.471 666.471 255.043 667.375 258.708C682.8 321.281 655.46 387.676 600.497 423.08L600.505 423.072Z" />
                  <path d="M164.512 447.894C114.595 450.81 64.3511 429.622 31.0681 385.765C-15.4485 324.455 -9.10075 237.769 45.8848 183.494C72.2663 157.455 105.97 142.319 140.634 138.786L141.757 196.79C132.835 198.349 123.75 201.188 114.572 205.259C78.7233 221.183 56.6932 257.897 58.284 296.42C59.9216 336.55 84.5564 370.917 122.401 384.127C134.294 388.268 145.757 390.397 156.807 390.561L164.52 447.894H164.512Z" />
                  <path d="M436.875 352.131L394.179 392.136C377.077 376.275 359.141 358.456 344.902 345.066C359.633 330.39 372.344 317.741 388.97 301.185C401.853 315.152 420.592 335.911 436.875 352.139V352.131Z" />
                  <path d="M605.41 165.962C565.031 153.618 521.345 173.651 484.779 200.314C470.321 205.328 456.783 214.202 444.236 226.594C385.07 285.026 326.544 344.098 266.934 402.078C237.535 430.682 201.117 445.772 164.512 447.885L156.799 390.552C182.807 390.95 206.42 380.469 227.311 359.89C286.991 301.122 345.743 241.418 406.024 183.243C449.343 141.445 501.709 127.907 559.946 145.11C577.009 150.155 592.161 157.127 605.402 165.962H605.41Z" />
                  <path d="M664.404 247.954L604.014 250.48C593.853 228.17 575.426 211.793 548.997 202.123C526.078 193.74 504.586 193.421 484.779 200.314C521.337 173.644 565.031 153.618 605.41 165.963C633.913 184.983 653.58 212.596 664.412 247.954H664.404Z" />
                  <path d="M328.097 243.688C313.303 257.047 299.672 269.36 281.954 285.37C270.319 272.745 250.13 249.638 233.153 232.552C228.794 228.154 224.653 224.154 220.917 220.839C197.063 199.651 170.182 191.799 141.749 196.789L140.626 138.786C178.565 134.918 217.65 144.939 249.584 169.737C257.944 176.225 267.551 184.889 277.478 194.333C295.118 211.084 313.764 230.221 328.097 243.696V243.688Z" />
                  <path d="M267.402 320.196C254.208 333.313 240.623 346.055 227.382 359.133C214.834 371.524 201.226 380.843 186.768 385.858C150.21 412.528 106.586 432.109 66.207 419.772C79.4485 428.608 94.6005 435.579 111.663 440.625C169.901 457.828 222.274 444.29 265.585 402.491C278.546 389.983 291.421 377.404 304.257 364.779C292.84 348.847 281.595 333.305 267.394 320.204L267.402 320.196Z" />
                </g>

                {/* 2 — ∞ progressively revealed by wipe */}
                <g mask="url(#mlt-wipe)" filter="url(#mlt-bloom)" opacity="0.62">
                  <g fill="url(#mlt-grad)">
                    <path d="M600.505 423.072C545.41 458.546 473.557 456.846 422.182 416.537C413.713 409.885 404.075 401.33 394.171 392.136L436.866 352.131C441.881 357.138 446.669 361.684 450.974 365.505C482.346 393.244 518.92 398.078 557.342 380.876C593.877 364.523 615.759 327.652 612.998 287.78C612.047 273.954 609.036 261.5 604.007 250.489L664.396 247.962C665.496 251.471 666.471 255.043 667.375 258.708C682.8 321.281 655.46 387.676 600.497 423.08L600.505 423.072Z" />
                    <path d="M164.512 447.894C114.595 450.81 64.3511 429.622 31.0681 385.765C-15.4485 324.455 -9.10075 237.769 45.8848 183.494C72.2663 157.455 105.97 142.319 140.634 138.786L141.757 196.79C132.835 198.349 123.75 201.188 114.572 205.259C78.7233 221.183 56.6932 257.897 58.284 296.42C59.9216 336.55 84.5564 370.917 122.401 384.127C134.294 388.268 145.757 390.397 156.807 390.561L164.52 447.894H164.512Z" />
                    <path d="M436.875 352.131L394.179 392.136C377.077 376.275 359.141 358.456 344.902 345.066C359.633 330.39 372.344 317.741 388.97 301.185C401.853 315.152 420.592 335.911 436.875 352.139V352.131Z" />
                    <path d="M605.41 165.962C565.031 153.618 521.345 173.651 484.779 200.314C470.321 205.328 456.783 214.202 444.236 226.594C385.07 285.026 326.544 344.098 266.934 402.078C237.535 430.682 201.117 445.772 164.512 447.885L156.799 390.552C182.807 390.95 206.42 380.469 227.311 359.89C286.991 301.122 345.743 241.418 406.024 183.243C449.343 141.445 501.709 127.907 559.946 145.11C577.009 150.155 592.161 157.127 605.402 165.962H605.41Z" />
                    <path d="M664.404 247.954L604.014 250.48C593.853 228.17 575.426 211.793 548.997 202.123C526.078 193.74 504.586 193.421 484.779 200.314C521.337 173.644 565.031 153.618 605.41 165.963C633.913 184.983 653.58 212.596 664.412 247.954H664.404Z" />
                    <path d="M328.097 243.688C313.303 257.047 299.672 269.36 281.954 285.37C270.319 272.745 250.13 249.638 233.153 232.552C228.794 228.154 224.653 224.154 220.917 220.839C197.063 199.651 170.182 191.799 141.749 196.789L140.626 138.786C178.565 134.918 217.65 144.939 249.584 169.737C257.944 176.225 267.551 184.889 277.478 194.333C295.118 211.084 313.764 230.221 328.097 243.696V243.688Z" />
                    <path d="M267.402 320.196C254.208 333.313 240.623 346.055 227.382 359.133C214.834 371.524 201.226 380.843 186.768 385.858C150.21 412.528 106.586 432.109 66.207 419.772C79.4485 428.608 94.6005 435.579 111.663 440.625C169.901 457.828 222.274 444.29 265.585 402.491C278.546 389.983 291.421 377.404 304.257 364.779C292.84 348.847 281.595 333.305 267.394 320.204L267.402 320.196Z" />
                  </g>
                </g>

                {/* 3 — glowing leading edge clipped to ∞ ribbon */}
                <g clipPath="url(#mlt-inf-clip)">
                  <g id="mltEdgeGlow" style={{opacity:0}}>
                    <rect x="-16" y="138" width="32" height="320" fill="#A78BFA" filter="url(#mlt-edge-blur)" />
                    <rect x="-3"  y="138" width="6"  height="320" fill="#ffffff" filter="url(#mlt-edge-blur)" />
                  </g>
                </g>

                {/* 4 — P glow at finale */}
                <g id="mltPGlow" opacity="0">
                  <g filter="url(#mlt-bloom-strong)" fill="#A78BFA" opacity="0.4">
                    <path d="M660.177 205.188C640.292 173.231 610.089 150.756 569.546 138.778C565.576 137.608 561.63 136.571 557.724 135.666C553.13 130.73 548.256 125.997 543.11 121.481C495.821 79.979 427.368 58.0347 345.158 58.0347H58.4163V158.554C49.5965 164.38 41.2289 171.141 33.4619 178.799C19.3314 192.75 8.27343 208.744 0.381592 225.892V0H345.151C441.662 0 523.349 26.9274 581.376 77.8812C610.097 103.077 632.29 133.53 647.365 168.372C652.496 180.226 656.769 192.516 660.169 205.188H660.177Z" />
                    <path d="M649.089 395.558C631.979 436.749 604.561 472.239 567.48 500.663C506.638 547.281 424.039 571.924 328.596 571.924H228.45V792.17H0.390137V360.427C5.10809 370.627 10.988 380.453 18.022 389.725C29.7194 405.135 43.4132 417.854 58.4248 427.843V734.136H170.423V513.889H328.603C409.924 513.889 482.167 492.865 532.06 454.685C559.822 453.086 587.42 444.368 611.844 428.639C626.13 419.444 638.631 408.223 649.089 395.558Z" />
                  </g>
                  <g fill="url(#mlt-grad)" opacity="0.72">
                    <path d="M660.177 205.188C640.292 173.231 610.089 150.756 569.546 138.778C565.576 137.608 561.63 136.571 557.724 135.666C553.13 130.73 548.256 125.997 543.11 121.481C495.821 79.979 427.368 58.0347 345.158 58.0347H58.4163V158.554C49.5965 164.38 41.2289 171.141 33.4619 178.799C19.3314 192.75 8.27343 208.744 0.381592 225.892V0H345.151C441.662 0 523.349 26.9274 581.376 77.8812C610.097 103.077 632.29 133.53 647.365 168.372C652.496 180.226 656.769 192.516 660.169 205.188H660.177Z" />
                    <path d="M649.089 395.558C631.979 436.749 604.561 472.239 567.48 500.663C506.638 547.281 424.039 571.924 328.596 571.924H228.45V792.17H0.390137V360.427C5.10809 370.627 10.988 380.453 18.022 389.725C29.7194 405.135 43.4132 417.854 58.4248 427.843V734.136H170.423V513.889H328.603C409.924 513.889 482.167 492.865 532.06 454.685C559.822 453.086 587.42 444.368 611.844 428.639C626.13 419.444 638.631 408.223 649.089 395.558Z" />
                  </g>
                </g>

                {/* 5 — ∞ bloom at finale */}
                <g id="mltInfGlow" opacity="0">
                  <g filter="url(#mlt-bloom-strong)" fill="#A78BFA" opacity="0.5">
                    <path d="M600.505 423.072C545.41 458.546 473.557 456.846 422.182 416.537C413.713 409.885 404.075 401.33 394.171 392.136L436.866 352.131C441.881 357.138 446.669 361.684 450.974 365.505C482.346 393.244 518.92 398.078 557.342 380.876C593.877 364.523 615.759 327.652 612.998 287.78C612.047 273.954 609.036 261.5 604.007 250.489L664.396 247.962C665.496 251.471 666.471 255.043 667.375 258.708C682.8 321.281 655.46 387.676 600.497 423.08L600.505 423.072Z" />
                    <path d="M164.512 447.894C114.595 450.81 64.3511 429.622 31.0681 385.765C-15.4485 324.455 -9.10075 237.769 45.8848 183.494C72.2663 157.455 105.97 142.319 140.634 138.786L141.757 196.79C132.835 198.349 123.75 201.188 114.572 205.259C78.7233 221.183 56.6932 257.897 58.284 296.42C59.9216 336.55 84.5564 370.917 122.401 384.127C134.294 388.268 145.757 390.397 156.807 390.561L164.52 447.894H164.512Z" />
                    <path d="M436.875 352.131L394.179 392.136C377.077 376.275 359.141 358.456 344.902 345.066C359.633 330.39 372.344 317.741 388.97 301.185C401.853 315.152 420.592 335.911 436.875 352.139V352.131Z" />
                    <path d="M605.41 165.962C565.031 153.618 521.345 173.651 484.779 200.314C470.321 205.328 456.783 214.202 444.236 226.594C385.07 285.026 326.544 344.098 266.934 402.078C237.535 430.682 201.117 445.772 164.512 447.885L156.799 390.552C182.807 390.95 206.42 380.469 227.311 359.89C286.991 301.122 345.743 241.418 406.024 183.243C449.343 141.445 501.709 127.907 559.946 145.11C577.009 150.155 592.161 157.127 605.402 165.962H605.41Z" />
                    <path d="M664.404 247.954L604.014 250.48C593.853 228.17 575.426 211.793 548.997 202.123C526.078 193.74 504.586 193.421 484.779 200.314C521.337 173.644 565.031 153.618 605.41 165.963C633.913 184.983 653.58 212.596 664.412 247.954H664.404Z" />
                    <path d="M328.097 243.688C313.303 257.047 299.672 269.36 281.954 285.37C270.319 272.745 250.13 249.638 233.153 232.552C228.794 228.154 224.653 224.154 220.917 220.839C197.063 199.651 170.182 191.799 141.749 196.789L140.626 138.786C178.565 134.918 217.65 144.939 249.584 169.737C257.944 176.225 267.551 184.889 277.478 194.333C295.118 211.084 313.764 230.221 328.097 243.696V243.688Z" />
                    <path d="M267.402 320.196C254.208 333.313 240.623 346.055 227.382 359.133C214.834 371.524 201.226 380.843 186.768 385.858C150.21 412.528 106.586 432.109 66.207 419.772C79.4485 428.608 94.6005 435.579 111.663 440.625C169.901 457.828 222.274 444.29 265.585 402.491C278.546 389.983 291.421 377.404 304.257 364.779C292.84 348.847 281.595 333.305 267.394 320.204L267.402 320.196Z" />
                  </g>
                  <g fill="url(#mlt-grad)" opacity="0.72">
                    <path d="M600.505 423.072C545.41 458.546 473.557 456.846 422.182 416.537C413.713 409.885 404.075 401.33 394.171 392.136L436.866 352.131C441.881 357.138 446.669 361.684 450.974 365.505C482.346 393.244 518.92 398.078 557.342 380.876C593.877 364.523 615.759 327.652 612.998 287.78C612.047 273.954 609.036 261.5 604.007 250.489L664.396 247.962C665.496 251.471 666.471 255.043 667.375 258.708C682.8 321.281 655.46 387.676 600.497 423.08L600.505 423.072Z" />
                    <path d="M164.512 447.894C114.595 450.81 64.3511 429.622 31.0681 385.765C-15.4485 324.455 -9.10075 237.769 45.8848 183.494C72.2663 157.455 105.97 142.319 140.634 138.786L141.757 196.79C132.835 198.349 123.75 201.188 114.572 205.259C78.7233 221.183 56.6932 257.897 58.284 296.42C59.9216 336.55 84.5564 370.917 122.401 384.127C134.294 388.268 145.757 390.397 156.807 390.561L164.52 447.894H164.512Z" />
                    <path d="M436.875 352.131L394.179 392.136C377.077 376.275 359.141 358.456 344.902 345.066C359.633 330.39 372.344 317.741 388.97 301.185C401.853 315.152 420.592 335.911 436.875 352.139V352.131Z" />
                    <path d="M605.41 165.962C565.031 153.618 521.345 173.651 484.779 200.314C470.321 205.328 456.783 214.202 444.236 226.594C385.07 285.026 326.544 344.098 266.934 402.078C237.535 430.682 201.117 445.772 164.512 447.885L156.799 390.552C182.807 390.95 206.42 380.469 227.311 359.89C286.991 301.122 345.743 241.418 406.024 183.243C449.343 141.445 501.709 127.907 559.946 145.11C577.009 150.155 592.161 157.127 605.402 165.962H605.41Z" />
                    <path d="M664.404 247.954L604.014 250.48C593.853 228.17 575.426 211.793 548.997 202.123C526.078 193.74 504.586 193.421 484.779 200.314C521.337 173.644 565.031 153.618 605.41 165.963C633.913 184.983 653.58 212.596 664.412 247.954H664.404Z" />
                    <path d="M328.097 243.688C313.303 257.047 299.672 269.36 281.954 285.37C270.319 272.745 250.13 249.638 233.153 232.552C228.794 228.154 224.653 224.154 220.917 220.839C197.063 199.651 170.182 191.799 141.749 196.789L140.626 138.786C178.565 134.918 217.65 144.939 249.584 169.737C257.944 176.225 267.551 184.889 277.478 194.333C295.118 211.084 313.764 230.221 328.097 243.696V243.688Z" />
                    <path d="M267.402 320.196C254.208 333.313 240.623 346.055 227.382 359.133C214.834 371.524 201.226 380.843 186.768 385.858C150.21 412.528 106.586 432.109 66.207 419.772C79.4485 428.608 94.6005 435.579 111.663 440.625C169.901 457.828 222.274 444.29 265.585 402.491C278.546 389.983 291.421 377.404 304.257 364.779C292.84 348.847 281.595 333.305 267.394 320.204L267.402 320.196Z" />
                  </g>
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
                  {[
                    { roman: 'I',   text: <>You've been sitting on this for years.</> },
                    { roman: 'II',  text: <>Building it quietly. In your head. On whatever's nearby.</> },
                    { roman: 'III', text: <>Choosing the harder thing. <em>Every single time.</em></> },
                    { roman: 'IV',  text: <>We've watched founders like you for nine years.</> },
                    { roman: 'V',   text: <>We know what this looks like. <em>It looks like you.</em></> },
                  ].map((step, i) => (
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

      {/* FILTER — TWIN COLUMNS */}
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

      {/* FINAL CTA */}
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
                <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIX THINGS — "What you get · Six things. Nothing extra. Nothing missing."
   Desktop/tablet ≥901px: cinematic horizontal pinned scroll (600vh)
   Mobile ≤900px: clean vertical stack
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

function SixThingsSection() {
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
              <span className="st-kicker-dash"></span>
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

/* ─────────────────────────────────────────────────────────────
   PROGRAMS SECTION — "WHAT WE RUN · 05 / Five rooms. One bet."
───────────────────────────────────────────────────────────── */

const PROGRAMS = [
  {
    roman: 'I', idx: '01', name: 'Accelerator', tag: 'The sprint',
    essence: 'A focused sprint for the bet already in motion.',
    points: ['8–12 week intensive', 'Capital + conviction up front', 'A room that moves at your pace'],
    icon: 'rocket',
  },
  {
    roman: 'II', idx: '02', name: 'Co-Founder Bridge', tag: 'The match',
    essence: 'For the founder still missing their other half.',
    points: ['Matched on conviction, not résumés', 'We stake the partnership', 'Built to outlast the honeymoon'],
    icon: 'bridge',
  },
  {
    roman: 'III', idx: '03', name: 'Studio for Companies', tag: 'The spin-out',
    essence: 'New ventures spun out from inside proven walls.',
    points: ['Partner with established companies', 'De-risked zero-to-one', 'Shared upside, shared spine'],
    icon: 'company',
  },
  {
    roman: 'IV', idx: '04', name: 'Studio for Founders', tag: 'The build',
    essence: 'Zero to one, with us in the room.',
    points: ['For the bet without the build yet', 'Hands-on from day one', 'Pre-idea to first customers'],
    icon: 'founder',
  },
  {
    roman: 'V', idx: '05', name: 'Sub Studio Program', tag: 'The network',
    essence: 'A network of focused studios — each one a single thesis.',
    points: ['Specialized rooms', 'One thesis, compounded', 'Plugged into the whole foundry'],
    icon: 'substudio',
  },
]

const HUB_PATHS = [
  'M660.177 205.188C640.292 173.231 610.089 150.756 569.546 138.778C565.576 137.608 561.63 136.571 557.724 135.666C553.13 130.73 548.256 125.997 543.11 121.481C495.821 79.979 427.368 58.0347 345.158 58.0347H58.4163V158.554C49.5965 164.38 41.2289 171.141 33.4619 178.799C19.3314 192.75 8.27343 208.744 0.381592 225.892V0H345.151C441.662 0 523.349 26.9274 581.376 77.8812C610.097 103.077 632.29 133.53 647.365 168.372C652.496 180.226 656.769 192.516 660.169 205.188H660.177Z',
  'M649.089 395.558C631.979 436.749 604.561 472.239 567.48 500.663C506.638 547.281 424.039 571.924 328.596 571.924H228.45V792.17H0.390137V360.427C5.10809 370.627 10.988 380.453 18.022 389.725C29.7194 405.135 43.4132 417.854 58.4248 427.843V734.136H170.423V513.889H328.603C409.924 513.889 482.167 492.865 532.06 454.685C559.822 453.086 587.42 444.368 611.844 428.639C626.13 419.444 638.631 408.223 649.089 395.558Z',
  'M600.505 423.072C545.41 458.546 473.557 456.846 422.182 416.537C413.713 409.885 404.075 401.33 394.171 392.136L436.866 352.131C441.881 357.138 446.669 361.684 450.974 365.505C482.346 393.244 518.92 398.078 557.342 380.876C593.877 364.523 615.759 327.652 612.998 287.78C612.047 273.954 609.036 261.5 604.007 250.489L664.396 247.962C665.496 251.471 666.471 255.043 667.375 258.708C682.8 321.281 655.46 387.676 600.497 423.08L600.505 423.072Z',
  'M164.512 447.894C114.595 450.81 64.3511 429.622 31.0681 385.765C-15.4485 324.455 -9.10075 237.769 45.8848 183.494C72.2663 157.455 105.97 142.319 140.634 138.786L141.757 196.79C132.835 198.349 123.75 201.188 114.572 205.259C78.7233 221.183 56.6932 257.897 58.284 296.42C59.9216 336.55 84.5564 370.917 122.401 384.127C134.294 388.268 145.757 390.397 156.807 390.561L164.52 447.894H164.512Z',
  'M605.41 165.962C565.031 153.618 521.345 173.651 484.779 200.314C470.321 205.328 456.783 214.202 444.236 226.594C385.07 285.026 326.544 344.098 266.934 402.078C237.535 430.682 201.117 445.772 164.512 447.885L156.799 390.552C182.807 390.95 206.42 380.469 227.311 359.89C286.991 301.122 345.743 241.418 406.024 183.243C449.343 141.445 501.709 127.907 559.946 145.11C577.009 150.155 592.161 157.127 605.402 165.962H605.41Z',
  'M328.097 243.688C313.303 257.047 299.672 269.36 281.954 285.37C270.319 272.745 250.13 249.638 233.153 232.552C228.794 228.154 224.653 224.154 220.917 220.839C197.063 199.651 170.182 191.799 141.749 196.789L140.626 138.786C178.565 134.918 217.65 144.939 249.584 169.737C257.944 176.225 267.551 184.889 277.478 194.333C295.118 211.084 313.764 230.221 328.097 243.696V243.688Z',
]

function ProgramIcon({ name }) {
  const common = { width: '100%', height: '100%', viewBox: '0 0 48 48', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'rocket': return (<svg {...common}><path d="M24 6c6 4 9 10 9 18 0 4-1 7-2 9H17c-1-2-2-5-2-9 0-8 3-14 9-18Z"/><circle cx="24" cy="20" r="3.4"/><path d="M17 33c-3 1-5 3-6 9 6-1 8-3 9-6M31 33c3 1 5 3 6 9-6-1-8-3-9-6"/><path d="M21 42c1 2 2 3 3 3s2-1 3-3"/></svg>)
    case 'bridge': return (<svg {...common}><circle cx="13" cy="17" r="4.2"/><circle cx="35" cy="17" r="4.2"/><path d="M13 21v6M35 21v6"/><path d="M7 33c0-6 5-8 6-8M41 33c0-6-5-8-6-8"/><path d="M9 33h30" opacity="0.5"/></svg>)
    case 'company': return (<svg {...common}><path d="M10 40V14l11-5v31"/><path d="M21 40V20l13 4v16"/><path d="M14 18v0M14 24v0M14 30v0M27 27v0M27 33v0"/><path d="M30 16l5-5M35 11h-4M35 11v4"/></svg>)
    case 'founder': return (<svg {...common}><circle cx="19" cy="16" r="5"/><path d="M11 39c0-6 3.5-10 8-10s8 4 8 10"/><circle cx="35" cy="14" r="5.5"/><path d="M35 9.5v1M35 17.5v1M30.5 14h1M38.5 14h1" opacity="0.7"/></svg>)
    case 'substudio': return (<svg {...common}><rect x="8" y="8" width="13" height="13" rx="2"/><rect x="27" y="8" width="13" height="13" rx="2"/><rect x="8" y="27" width="13" height="13" rx="2"/><rect x="27" y="27" width="13" height="13" rx="2"/><path d="M21 14.5h6M14.5 21v6M33.5 21v6M21 33.5h6" opacity="0.5"/></svg>)
    default: return null
  }
}

function ProgramsSection() {
  const [active, setActive] = useState(0)
  const [locked, setLocked] = useState(false)
  const [paused, setPaused] = useState(false)
  const [autoplay] = useState(true)
  const sectionRef = useRef(null)

  const go = useCallback((i) => setActive(((i % PROGRAMS.length) + PROGRAMS.length) % PROGRAMS.length), [])

  // Reset to card 1 every time the section enters the viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(0)
          setLocked(false)
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // auto-advance
  useEffect(() => {
    if (!autoplay || paused || locked) return
    const id = setTimeout(() => go(active + 1), 4200)
    return () => clearTimeout(id)
  }, [active, autoplay, paused, locked, go])

  // keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') { go(active + 1); setLocked(true) }
      else if (e.key === 'ArrowLeft') { go(active - 1); setLocked(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, go])

  return (
    <section className="prog-section" id="programs" ref={sectionRef}>
      <div className="prog-grid-bg" aria-hidden="true"></div>
      <div className="prog-inner">

        <header className="prog-head">
          <div className="prog-kicker">
            WHAT WE RUN · 05
          </div>
          <div className="prog-head-row">
            <h2 className="prog-title serif">Five rooms. <em>One bet.</em></h2>
            <p className="prog-sub">
              Every founder meets us through one of five doors. Same conviction behind each — a different way in.{' '}
              <span className="prog-sub-hint">Hover a panel.</span>
            </p>
          </div>
        </header>

        <div
          className="prog-panels"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); setLocked(false) }}
        >
          {PROGRAMS.map((p, i) => {
            const on = i === active
            return (
              <article
                key={p.name}
                className={'prog-panel' + (on ? ' on' : '')}
                onMouseEnter={() => { if (!locked) go(i) }}
                onClick={() => { go(i); setLocked(true) }}
                tabIndex={0}
                onFocus={() => go(i)}
              >
                {/* ambient bg */}
                <div className="prog-p-bg" aria-hidden="true">
                  <svg className="prog-p-ghost" viewBox="0 0 672 793">
                    {HUB_PATHS.map((d, k) => <path key={k} d={d} fill="currentColor" />)}
                  </svg>
                </div>

                {/* collapsed spine */}
                <div className="prog-spine">
                  <span className="prog-spine-idx">{p.idx}</span>
                  <span className="prog-spine-name serif">{p.name}</span>
                  <span className="prog-spine-plus" aria-hidden="true">
                    <svg width="13" height="13" viewBox="0 0 13 13"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </span>
                </div>

                {/* expanded content */}
                <div className="prog-content">
                  <div className="prog-c-top">
                    <span className="prog-c-icon"><ProgramIcon name={p.icon} /></span>
                    <span className="prog-c-tag">{p.idx} · {p.tag}</span>
                  </div>
                  <div className="prog-c-mid">
                    <h3 className="prog-c-name serif">{p.name}</h3>
                    <p className="prog-c-ess serif">{p.essence}</p>
                  </div>
                  <ul className="prog-c-points">
                    {p.points.map((pt) => (
                      <li key={pt}><span className="prog-pip"></span>{pt}</li>
                    ))}
                  </ul>
                  <a className="prog-c-cta" href="#apply" onClick={(e) => e.stopPropagation()}>
                    Explore {p.name}
                    <span className="prog-c-cta-arr">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9 9 2M9 2H4.5M9 2V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </a>
                </div>
              </article>
            )
          })}
        </div>


      </div>
    </section>
  )
}
