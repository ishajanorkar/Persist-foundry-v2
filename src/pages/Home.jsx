import { useEffect, useRef } from 'react'

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
    document.querySelectorAll('a, button, .pf-card, .filter-col, .backed-logo, .offer-item').forEach(el => {
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
    let lastScrubTime = 0
    let targetScrubTime = 0
    let scrubAnimId = null
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

    function animateScrub() {
      if (!video || !videoReady) { scrubAnimId = null; return }
      const diff = targetScrubTime - lastScrubTime
      if (Math.abs(diff) > 0.008) {
        lastScrubTime += diff * 0.16
        video.currentTime = lastScrubTime
        scrubAnimId = requestAnimationFrame(animateScrub)
      } else {
        lastScrubTime = targetScrubTime
        video.currentTime = lastScrubTime
        scrubAnimId = null
      }
    }

    function updateScrub() {
      if (!videoReady || !scrubBlock) return
      const rect = scrubBlock.getBoundingClientRect()
      const blockHeight = scrubBlock.offsetHeight
      const viewportHeight = window.innerHeight
      const scrollable = blockHeight - viewportHeight
      let progress = -rect.top / scrollable
      progress = Math.max(0, Math.min(1, progress))

      targetScrubTime = progress * videoDuration
      if (!scrubAnimId && video) scrubAnimId = requestAnimationFrame(animateScrub)

      // Panel 3 at exactly 13s into the video, derived from actual duration
      const panel3Threshold = videoDuration > 0 ? 14 / videoDuration : 0.95
      let active = 1
      if (progress > panel3Threshold) active = 3
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
    const sectionIds = ['scrubBlock', 'impact', 'offer', 'manifesto', 'filter', 'portfolio', 'apply']
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

    /* ── OFFER STAIRCASE REVEAL + PROGRESS ───────────────────── */
    const offerSteps = document.querySelectorAll('.offer-step')
    const offerProgressNum = document.getElementById('offerProgressNum')
    const offerProgressFill = document.getElementById('offerProgressFill')
    const offerVPips = document.querySelectorAll('.offer-v-pip')
    const offerVFill = document.getElementById('offerVFill')

    function positionVPips() {
      const rail = document.getElementById('offerVRail')
      if (!rail || !offerVPips.length) return
      const railTop = rail.getBoundingClientRect().top + window.scrollY
      const railH = rail.offsetHeight
      offerSteps.forEach((step, i) => {
        if (!offerVPips[i]) return
        const stepTop = step.getBoundingClientRect().top + window.scrollY
        const cy = stepTop - railTop + step.offsetHeight / 2
        offerVPips[i].style.top = Math.max(0, Math.min(100, cy / railH * 100)) + '%'
      })
    }
    requestAnimationFrame(() => requestAnimationFrame(positionVPips))
    window.addEventListener('resize', positionVPips, { passive: true })

    function setOfferStep(idx) {
      if (offerProgressNum) offerProgressNum.textContent = String(idx + 1).padStart(2, '0')
      if (offerProgressFill) offerProgressFill.style.width = ((idx + 1) / offerSteps.length) * 100 + '%'
      offerVPips.forEach((pip, i) => {
        pip.classList.toggle('is-done', i < idx)
        pip.classList.toggle('is-active', i === idx)
      })
      const activePip = offerVPips[idx]
      if (offerVFill && activePip && activePip.style.top) {
        offerVFill.style.height = activePip.style.top
      }
    }

    const stepRevealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.idx, 10) || 0
          setTimeout(() => entry.target.classList.add('is-revealed'), idx % 2 * 80)
          stepRevealObs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' })
    offerSteps.forEach(step => stepRevealObs.observe(step))

    const stepProgressObs = new IntersectionObserver(() => {
      let mostVisible = null, highestRatio = 0
      offerSteps.forEach(step => {
        const r = step.getBoundingClientRect()
        const vh = window.innerHeight
        const visH = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top))
        const ratio = visH / Math.min(r.height, vh)
        if (ratio > highestRatio) { highestRatio = ratio; mostVisible = step }
      })
      if (mostVisible) {
        const idx = parseInt(mostVisible.dataset.idx, 10) || 0
        setOfferStep(idx)
      }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] })
    offerSteps.forEach(step => stepProgressObs.observe(step))

    let offerScrollTicking = false
    function updateOfferProgress() {
      const vh = window.innerHeight
      let mostVisible = null, highestRatio = 0
      offerSteps.forEach(step => {
        const r = step.getBoundingClientRect()
        const visH = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top))
        const ratio = visH / Math.min(r.height, vh)
        if (ratio > highestRatio) { highestRatio = ratio; mostVisible = step }
      })
      if (mostVisible) {
        const idx = parseInt(mostVisible.dataset.idx, 10) || 0
        setOfferStep(idx)
      }
      offerScrollTicking = false
    }
    window.addEventListener('scroll', () => {
      if (!offerScrollTicking) { requestAnimationFrame(updateOfferProgress); offerScrollTicking = true }
    }, { passive: true })

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

    /* ── MANIFESTO PINNED CROSSFADE ──────────────────────────── */
    const manifestoEl = document.getElementById('manifesto')
    const manifestoLines = document.querySelectorAll('.manifesto-line')
    const manifestoCountNum = document.getElementById('manifestoCounterNum')
    const manifestoCountFill = document.getElementById('manifestoCounterFill')
    const manifestoGrid = document.getElementById('manifestoGrid')
    const manifestoAura = document.getElementById('manifestoAura')
    const manifestoCta = document.getElementById('manifestoCta')
    const romanNums = ['i', 'ii', 'iii', 'iv', 'v']

    function updateManifesto() {
      if (!manifestoEl || !manifestoLines.length) return
      const rect = manifestoEl.getBoundingClientRect()
      const vh = window.innerHeight
      const scrollable = manifestoEl.offsetHeight - vh
      if (scrollable <= 0) return
      let progress = -rect.top / scrollable
      progress = Math.max(0, Math.min(1, progress))

      const stepCount = manifestoLines.length
      let activeStep = Math.floor(progress * stepCount)
      if (activeStep >= stepCount) activeStep = stepCount - 1

      manifestoLines.forEach((line, idx) => {
        if (idx === activeStep) {
          line.classList.add('is-active'); line.classList.remove('is-past')
        } else if (idx < activeStep) {
          line.classList.remove('is-active'); line.classList.add('is-past')
        } else {
          line.classList.remove('is-active'); line.classList.remove('is-past')
        }
      })

      if (manifestoCountNum) manifestoCountNum.textContent = romanNums[activeStep] || 'i'
      if (manifestoCountFill) manifestoCountFill.style.width = ((activeStep + 1) / stepCount * 100) + '%'
      if (manifestoGrid) {
        manifestoGrid.style.transform = `scale(${1 + progress * 0.35}) rotate(${progress * 6}deg)`
      }
      if (manifestoAura) {
        const s = 0.9 + Math.sin(progress * Math.PI) * 0.35
        manifestoAura.style.transform = `translate(-50%, -50%) scale(${s})`
        manifestoAura.style.opacity = String(0.55 + Math.sin(progress * Math.PI) * 0.45)
      }
      if (manifestoCta) manifestoCta.classList.toggle('is-visible', progress > 0.01 && progress < 0.96)
    }

    let mTicking = false
    function onManifestoScroll() {
      if (!mTicking) {
        requestAnimationFrame(() => { updateManifesto(); mTicking = false })
        mTicking = true
      }
    }
    window.addEventListener('scroll', onManifestoScroll, { passive: true })
    window.addEventListener('resize', onManifestoScroll, { passive: true })
    updateManifesto()

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

    /* ── FINAL CTA MOUSE PARALLAX ────────────────────────────── */
    const finalHeadline = document.getElementById('finalHeadline')
    const finalOrb = document.getElementById('finalOrb')
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
        finalHeadline.style.transform = `translate(${fX * 22}px, ${fY * 14}px)`
        if (finalOrb) finalOrb.style.transform = `translate(${-50 + fX * 8}%, ${-50 + fY * 6}%)`
        requestAnimationFrame(animateFinal)
      }
      animateFinal()
    }

    /* ── VELOCITY MARQUEE ────────────────────────────────────── */
    const velTrack = document.getElementById('velocityTrack')
    const velSection = document.getElementById('velocityMarquee')
    if (velTrack && velSection) {
      let trackX = 0, lastY = window.scrollY, velocity = 0
      const baseSpeed = 1.2
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

    /* ── APPLY BUTTON MAILTO ─────────────────────────────────── */
    document.querySelectorAll('.final-cta-massive-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.open('mailto:apply@persist.foundry?subject=Foundry%20Cohort%202026', '_blank')
      })
    })

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
            src="/assets/scrub-video.mp4"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
          />
          <div className="scrub-vignette"></div>

          {/* PANEL 1 — HERO */}
          <div className="panel panel-1 is-active" id="panel1">
            <div className="panel-1-meta"><span className="dot"></span>Cohort 2026 / Open</div>
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
              <button className="btn-ghost" onClick={() => scrollTo('impact')}>
                See proof
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="panel-1-status">
              <span className="strong">Persist</span><br />
              Backed by founders of Tether
            </div>
          </div>

          <div className="scroll-cue" id="scrollCue">Scroll<div className="line"></div></div>

          {/* PANEL 2 — RECOGNITION */}
          <div className="panel panel-2" id="panel2">
            <div className="panel-2-inner">
              <div className="panel-2-eyebrow">01 / The compound</div>
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
            <div className="panel-3-eyebrow">02 / The offer</div>
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
            <a href="https://tether.to/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell is-featured">
              <img src="/assets/tether.png" alt="Tether" className="backed-v2-logo" />
              <div className="backed-v2-tag">Founders of</div>
            </a>
            <a href="https://dna.fund/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell">
              <img src="/assets/dna.png" alt="DNA Fund" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
            <a href="https://percival.vc/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell">
              <img src="/assets/percival.png" alt="Percival" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
            <a href="https://blockchainff.com/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell">
              <img src="/assets/blockchain-fund.png" alt="Blockchain FF" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
            <a href="https://welara.com/" target="_blank" rel="noopener noreferrer" className="backed-v2-cell">
              <img src="/assets/w.png" alt="Welara" className="backed-v2-logo" />
              <div className="backed-v2-tag">Capital partner</div>
            </a>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="impact" id="impact">
        <div className="impact-inner">
          <div className="impact-eyebrow">Nine years, in numbers</div>
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

          <div className="portfolio-row" data-row="0">
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

          <div className="portfolio-row is-reversed" data-row="1">
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
                  <div className="portfolio-row-stat-num">$8K<em>mrr</em></div>
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

          <div className="portfolio-row" data-row="2">
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

          <div className="portfolio-v2-cta">
            <p className="portfolio-v2-cta-label">Three of thirty. <em>The rest are just as relentless.</em></p>
            <a href="#" className="portfolio-v2-cta-link" data-magnetic>
              See all thirty <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* VELOCITY MARQUEE */}
      <section className="velocity-marquee" id="velocityMarquee">
        <div className="velocity-marquee-track" id="velocityTrack">
          <span className="velocity-marquee-item">You made the bet. We matched it.</span>
          <span className="velocity-marquee-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.6 7.5h7.9l-6.4 4.7 2.4 7.8L12 15.4 5.5 20l2.4-7.8L1.5 7.5h7.9z"/></svg>
          </span>
          <span className="velocity-marquee-item is-outline">You made the bet. We matched it.</span>
          <span className="velocity-marquee-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.6 7.5h7.9l-6.4 4.7 2.4 7.8L12 15.4 5.5 20l2.4-7.8L1.5 7.5h7.9z"/></svg>
          </span>
          <span className="velocity-marquee-item">You made the bet. We matched it.</span>
          <span className="velocity-marquee-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.6 7.5h7.9l-6.4 4.7 2.4 7.8L12 15.4 5.5 20l2.4-7.8L1.5 7.5h7.9z"/></svg>
          </span>
          <span className="velocity-marquee-item is-outline">You made the bet. We matched it.</span>
          <span className="velocity-marquee-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.6 7.5h7.9l-6.4 4.7 2.4 7.8L12 15.4 5.5 20l2.4-7.8L1.5 7.5h7.9z"/></svg>
          </span>
        </div>
      </section>

      {/* OFFER — DIAGONAL STAIRCASE */}
      <section className="offer" id="offer">
        <div className="offer-header">
          <div className="offer-header-left">
            <div className="offer-eyebrow">What you get</div>
            <h2 className="offer-title">Six things.<br /><em>Nothing extra. Nothing missing.</em></h2>
          </div>
        </div>

        <div className="offer-stairs" id="offerStairs">
          <div className="offer-v-rail" id="offerVRail">
            <div className="offer-v-track"></div>
            <div className="offer-v-fill" id="offerVFill"></div>
            <div className="offer-v-pip" data-pip="0"></div>
            <div className="offer-v-pip" data-pip="1"></div>
            <div className="offer-v-pip" data-pip="2"></div>
            <div className="offer-v-pip" data-pip="3"></div>
            <div className="offer-v-pip" data-pip="4"></div>
            <div className="offer-v-pip" data-pip="5"></div>
          </div>
          <div className="offer-step" data-idx="0">
            <div className="offer-card">
              <div className="offer-card-num">01</div>
              <div className="offer-card-top">
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>
                  </svg>
                </span>
                <span className="offer-card-label">The runway.</span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">Your <em>move.</em></div>
                <p className="offer-card-proof">Monthly capital so you can leave the job, stop explaining yourself, and start. Full-time or nothing.</p>
              </div>
              <div className="offer-card-step-of">Step 01 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="1">
            <div className="offer-card">
              <div className="offer-card-num">02</div>
              <div className="offer-card-top">
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="9" cy="8" r="4"/><circle cx="17" cy="10" r="3"/>
                    <path d="M3 20v-1.5a4 4 0 014-4h4a4 4 0 014 4V20M22 20v-1a3 3 0 00-2-2.83"/>
                  </svg>
                </span>
                <span className="offer-card-label">The team.</span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">Your <em>team.</em></div>
                <p className="offer-card-proof">Designers, engineers, growth operators from day one. No hiring lag. No founder isolation.</p>
              </div>
              <div className="offer-card-step-of">Step 02 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="2">
            <div className="offer-card">
              <div className="offer-card-num">03</div>
              <div className="offer-card-top">
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="6" width="20" height="13" rx="2"/>
                    <path d="M2 11h20M6 15h2M11 15h3"/>
                  </svg>
                </span>
                <span className="offer-card-label">The investment.</span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>capital.</em></div>
                <p className="offer-card-proof">Pre-seed in at signing. Follow-on ready when you hit the next inflection point.</p>
              </div>
              <div className="offer-card-step-of">Step 03 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="3">
            <div className="offer-card">
              <div className="offer-card-num">04</div>
              <div className="offer-card-top">
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
                    <circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/>
                    <path d="M6 7l4 3M18 7l-4 3M6 17l4-3M18 17l-4-3"/>
                  </svg>
                </span>
                <span className="offer-card-label">The room.</span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>network.</em></div>
                <p className="offer-card-proof">400+ operators, advisors, allies. The conversations that usually take a decade to get access to.</p>
              </div>
              <div className="offer-card-step-of">Step 04 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="4">
            <div className="offer-card">
              <div className="offer-card-num">05</div>
              <div className="offer-card-top">
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 4h13a3 3 0 013 3v13M4 4v16h16M4 4l8 8 4-4 4 4"/>
                  </svg>
                </span>
                <span className="offer-card-label">The shortcut.</span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>playbook.</em></div>
                <p className="offer-card-proof">Nine years of frameworks, dead ends, and hard-won calls — so you skip the mistakes we already made.</p>
              </div>
              <div className="offer-card-step-of">Step 05 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="5">
            <div className="offer-card">
              <div className="offer-card-num">06</div>
              <div className="offer-card-top">
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 12l9-9 9 9M5 10v10h14V10M9 20v-6h6v6"/>
                  </svg>
                </span>
                <span className="offer-card-label">The ownership.</span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>company.</em></div>
                <p className="offer-card-proof">Yours. We back the bet. You run the company. The work belongs to you.</p>
              </div>
              <div className="offer-card-step-of">Step 06 / 06</div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO — PINNED KINETIC NARRATIVE */}
      <section className="manifesto" id="manifesto">
        <div className="manifesto-sticky">
          <div className="manifesto-grid" id="manifestoGrid"></div>
          <div className="manifesto-aura" id="manifestoAura"></div>
          <div className="manifesto-corner-label">A note. Read slowly.</div>
          <div className="manifesto-counter">
            <span className="manifesto-counter-num" id="manifestoCounterNum">i</span>
            <span>/ v</span>
            <div className="manifesto-counter-bar"><div className="manifesto-counter-fill" id="manifestoCounterFill"></div></div>
          </div>
          <div className="manifesto-stage">
            <div className="manifesto-line is-active" data-step="0">
              <span>
                <span className="manifesto-line-num">i.</span>
                You've been sitting on this for years.
              </span>
            </div>
            <div className="manifesto-line" data-step="1">
              <span>
                <span className="manifesto-line-num">ii.</span>
                Building it quietly. In your head. On whatever's nearby.
              </span>
            </div>
            <div className="manifesto-line" data-step="2">
              <span>
                <span className="manifesto-line-num">iii.</span>
                Choosing the harder thing. Every single time.
              </span>
            </div>
            <div className="manifesto-line" data-step="3">
              <span>
                <span className="manifesto-line-num">iv.</span>
                We've watched founders like you for nine years.
              </span>
            </div>
            <div className="manifesto-line" data-step="4">
              <span>
                <span className="manifesto-line-num">v.</span>
                We know what this looks like. <em>It looks like you.</em>
              </span>
            </div>
          </div>
          <div className="manifesto-cta" id="manifestoCta">
            <span className="pulse"></span>If that's you — keep reading. →
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

      {/* FINAL CTA v2 */}
      <section className="final-cta" id="apply">
        <div className="final-cta-orb" id="finalOrb"></div>
        <div className="final-cta-inner">
          <div className="final-cta-eyebrow"><span className="live-dot"></span>Cohort 2026 / Open / 12 seats</div>
          <p className="final-cta-preline">
            You've made this bet a thousand times in your head.
          </p>
          <h2 className="final-cta-headline-v2" id="finalHeadline">
            Once on paper<br /><em>changes everything.</em>
          </h2>
          <div className="final-cta-divider"></div>
          <div className="final-cta-button-wrap">
            <button className="final-cta-massive-btn" data-magnetic>
              Apply <span className="arrow">→</span>
            </button>
            <a href="#" className="final-cta-secondary">Or talk to a partner first</a>
          </div>
          <div className="final-cta-meta-v2">
            <div className="final-cta-meta-item">
              <div className="final-cta-meta-num">20<em>min</em></div>
              <div className="final-cta-meta-label">To apply</div>
            </div>
            <div className="final-cta-meta-item">
              <div className="final-cta-meta-num">2<em>wks</em></div>
              <div className="final-cta-meta-label">To hear back</div>
            </div>
            <div className="final-cta-meta-item">
              <div className="final-cta-meta-num">Day<em>one</em></div>
              <div className="final-cta-meta-label">After we say yes</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
