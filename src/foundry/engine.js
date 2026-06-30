/* ============================================================
   PERSIST FOUNDRY — landing engine
   Faithful 1:1 port of the static design's three scripts
   (scrubber.js + finale.js + main.js) into a single init that
   returns a cleanup fn so it can mount/unmount inside React.
   ============================================================ */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

export default function initFoundry({ base = '/foundry' } = {}) {
  /* ---- app config: frame anchors + the five Persist arms ---- */
  const PF_CONFIG = {
    frames: {
      path: base + '/frames/frame_',
      ext: '.webp',
      count: 289,
      pad: 4,
      anchors: { hero: 10, tether: 100, what: 160, threshold: 285 },
    },
    arms: [
      { id: 'accelerator', title: 'Accelerator',          body: 'A focused program that turns founder potential into a funded company. A salary to kickstart the team, mentorship from a 400 person network, and a deadline that forges.' },
      { id: 'cofounder',   title: 'Co-Founder Bridge',     body: 'We match founders with the missing other half. The technical, the commercial, the one who stakes the next year beside you.' },
      { id: 'companies',   title: 'Studio for Companies',  body: 'Operating muscle for companies ready to scale. Builders, designers, recruiters, and internal tools, embedded until the venture stands on its own.' },
      { id: 'founders',    title: 'Studio for Founders',   body: 'Zero to one for the founder with nothing but a bet. We provide the salary and the hands to build the first version with you, not for you.' },
      { id: 'substudio',   title: 'Sub Studio Program',    body: 'Specialist studios under one roof. Deep craft on demand, so your team stays small and your edges stay sharp.' },
    ],
  }
  window.PF_CONFIG = PF_CONFIG
  window.PF = window.PF || {}

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []
  const createdTriggers = []
  let killed = false

  // helper: tracked listener
  const on = (target, type, handler, opts) => {
    target.addEventListener(type, handler, opts)
    cleanups.push(() => target.removeEventListener(type, handler, opts))
  }
  const mkTrigger = (cfg) => {
    const t = ScrollTrigger.create(cfg)
    createdTriggers.push(t)
    return t
  }

  /* ============================================================
     1) CANVAS FRAME-SEQUENCE SCRUBBER
     ============================================================ */
  const CFG = PF_CONFIG.frames
  const canvas = document.getElementById('hero-canvas')
  const ctx = canvas.getContext('2d', { alpha: false })

  const frames = new Array(CFG.count)
  const loaded = new Array(CFG.count).fill(false)
  let dpr = Math.min(window.devicePixelRatio || 1, 2)

  function frameURL(i) {
    const n = String(i + 1).padStart(CFG.pad, '0')
    return CFG.path + n + CFG.ext
  }
  function loadFrame(i) {
    return new Promise((res) => {
      if (loaded[i]) return res()
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => { frames[i] = img; loaded[i] = true; res() }
      img.onerror = () => { loaded[i] = true; res() }
      img.src = frameURL(i)
    })
  }

  let cw = 0, ch = 0
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    cw = window.innerWidth; ch = window.innerHeight
    canvas.width = Math.round(cw * dpr)
    canvas.height = Math.round(ch * dpr)
    canvas.style.width = cw + 'px'
    canvas.style.height = ch + 'px'
    drawFrame(currentFrame, true)
  }
  function drawCover(img) {
    if (!img) return
    const iw = img.naturalWidth, ih = img.naturalHeight
    const cWpx = canvas.width, cHpx = canvas.height
    const scale = Math.max(cWpx / iw, cHpx / ih)
    const w = iw * scale, h = ih * scale
    const x = (cWpx - w) / 2, y = (cHpx - h) / 2
    ctx.fillStyle = '#050409'
    ctx.fillRect(0, 0, cWpx, cHpx)
    ctx.drawImage(img, x, y, w, h)
  }
  let currentFrame = -1
  function drawFrame(i, force) {
    i = Math.max(0, Math.min(CFG.count - 1, Math.round(i)))
    if (i === currentFrame && !force) return
    let j = i
    if (!frames[j]) {
      let lo = j, hi = j
      while (lo >= 0 || hi < CFG.count) {
        if (lo >= 0 && frames[lo]) { j = lo; break }
        if (hi < CFG.count && frames[hi]) { j = hi; break }
        lo--; hi++
      }
    }
    if (frames[j]) { drawCover(frames[j]); currentFrame = i }
  }

  const A = CFG.anchors
  const KEY = [
    [0.00,   6], [0.16,  20],
    [0.40,  96], [0.52, 110],
    [0.84, 276], [1.00, 288],
  ]
  const smooth = (t) => t * t * (3 - 2 * t)
  function progressToFrame(p) {
    p = Math.max(0, Math.min(1, p))
    for (let k = 0; k < KEY.length - 1; k++) {
      const [p0, f0] = KEY[k], [p1, f1] = KEY[k + 1]
      if (p >= p0 && p <= p1) {
        if (p1 === p0) return f1
        const t = (p - p0) / (p1 - p0)
        const isHold = Math.abs(f1 - f0) <= 16
        const e = isHold ? t : smooth(t)
        return f0 + (f1 - f0) * e
      }
    }
    return KEY[KEY.length - 1][1]
  }

  const BEAT_BANDS = [
    [-0.10, -0.05, 0.16, 0.26],
    [ 0.34,  0.42, 0.52, 0.60],
    [ 0.80,  0.86, 1.00, 1.01],
  ]
  const beatInners = Array.from(document.querySelectorAll('.beat[data-beat]'))
    .filter((el) => +el.dataset.beat < 4)
    .map((el) => ({ inner: el.querySelector('.beat__inner'), scrim: el.querySelector('.beat__scrim') }))
  const stageFade = document.getElementById('stageFade')

  function bandOpacity(p, b) {
    const [a, c, d, e] = b
    if (p <= a || p >= e) return 0
    if (p < c) return (p - a) / (c - a)
    if (p <= d) return 1
    return 1 - (p - d) / (e - d)
  }
  function updateBeats(p) {
    for (let i = 0; i < beatInners.length; i++) {
      const o = bandOpacity(p, BEAT_BANDS[i])
      const { inner, scrim } = beatInners[i]
      if (inner) {
        inner.style.opacity = o.toFixed(3)
        inner.style.transform = `translateY(${(1 - o) * 26}px)`
      }
      if (scrim) scrim.style.opacity = (o * 0.95).toFixed(3)
      if (i === 1 && stageFade) stageFade.style.opacity = (o * 0.92).toFixed(3)
    }
  }

  // one-by-one reveal of the Tether partner logos, fired off the same scrub
  // progress that drives the Tether beat (band ~0.34–0.60, full at 0.42–0.52).
  const lockupRow = document.querySelector('.lockup__row')
  let tetherRevealed = false
  function maybeRevealTether(p) {
    if (tetherRevealed || !lockupRow) return
    if (p >= 0.40) { tetherRevealed = true; lockupRow.classList.add('is-revealed') }
  }

  window.PF.heroProgress = 0
  function onScrub(p) {
    window.PF.heroProgress = p
    drawFrame(progressToFrame(p))
    updateBeats(p)
    maybeRevealTether(p)
    if (window.PF.onHeroProgress) window.PF.onHeroProgress(p)
  }

  async function preload() {
    const loaderBar = document.getElementById('loaderBar')
    const loaderPct = document.getElementById('loaderPct')
    const loader = document.getElementById('loader')

    const priority = [A.hero, A.tether, A.what, A.threshold, CFG.count - 1]
    for (let i = 0; i < 50; i++) priority.push(i)
    const seen = new Set()
    const ordered = priority.filter((i) => (!seen.has(i) && seen.add(i)))
    for (let i = 0; i < CFG.count; i++) if (!seen.has(i)) { ordered.push(i); seen.add(i) }

    let done = 0
    const total = CFG.count
    const updateLoader = () => {
      const pct = Math.round((done / total) * 100)
      if (loaderBar) loaderBar.style.width = pct + '%'
      if (loaderPct) loaderPct.textContent = String(pct).padStart(3, '0')
    }

    const REVEAL_AT = 18
    let revealed = false
    const revealIfReady = () => {
      if (revealed || done < REVEAL_AT) return
      revealed = true
      drawFrame(A.hero, true)
      if (loader) loader.classList.add('done')
      document.dispatchEvent(new Event('pf:ready'))
    }

    const CONC = 6
    let idx = 0
    async function worker() {
      while (idx < ordered.length && !killed) {
        const i = ordered[idx++]
        await loadFrame(i)
        done++; updateLoader(); revealIfReady()
      }
    }
    await Promise.all(Array.from({ length: CONC }, worker))
    if (killed) return
    updateLoader()
    revealIfReady()
    document.dispatchEvent(new Event('pf:framesComplete'))
  }

  function initScrubber() {
    resizeCanvas()
    on(window, 'resize', resizeCanvas, { passive: true })

    if (reduceMotion) {
      drawFrame(A.hero, true)
      updateBeats(0)
      mkTrigger({
        trigger: '#hero', start: 'top top', endTrigger: '#threshold', end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress
          window.PF.heroProgress = p
          drawFrame(progressToFrame(p))
          updateBeats(p)
          if (window.PF.onHeroProgress) window.PF.onHeroProgress(p)
        },
      })
      return
    }

    mkTrigger({
      trigger: '#hero',
      start: 'top top',
      endTrigger: '#threshold',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => onScrub(self.progress),
    })
    onScrub(0)
  }

  /* ============================================================
     2) FINALE — Three.js handoff + orbit
     ============================================================ */
  const threeCanvas = document.getElementById('three-canvas')
  const persistLogo = document.getElementById('persistLogo')
  const navSlot = document.getElementById('navBrandSlot')
  let armDetail = document.getElementById('armDetail')
  const armKicker = document.getElementById('armKicker')
  const armTitle = document.getElementById('armTitle')
  const armBody = document.getElementById('armBody')

  let renderer, scene, camera, stars, starSprite, raf = null, running = false
  let parX = 0, parY = 0

  function makeStarTexture() {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.18, 'rgba(244,240,255,0.95)')
    grd.addColorStop(0.4, 'rgba(185,160,255,0.45)')
    grd.addColorStop(1, 'rgba(120,84,213,0)')
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128)
    const t = new THREE.Texture(c); t.needsUpdate = true; return t
  }

  function initThree() {
    renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 14

    const N = window.innerWidth < 768 ? 320 : 700
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      const r = 6 + Math.random() * 30
      const a = Math.random() * Math.PI * 2
      const z = -Math.random() * 30
      pos[i * 3]     = Math.cos(a) * r * (0.4 + Math.random() * 0.6)
      pos[i * 3 + 1] = Math.sin(a) * r * (0.3 + Math.random() * 0.5)
      pos[i * 3 + 2] = z
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const starTex = makeStarTexture()
    const mat = new THREE.PointsMaterial({
      size: 0.5, map: starTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0xcfc6f0, opacity: 0.9,
    })
    stars = new THREE.Points(geo, mat)
    scene.add(stars)

    const sMat = new THREE.SpriteMaterial({ map: starTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 1 })
    starSprite = new THREE.Sprite(sMat)
    starSprite.scale.set(5, 5, 1)
    starSprite.position.set(0, 0, 2)
    scene.add(starSprite)

    on(window, 'resize', onResizeThree, { passive: true })
    if (!reduceMotion) on(window, 'mousemove', onMouse, { passive: true })
  }
  function onResizeThree() {
    if (!renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight, false)
  }
  function onMouse(e) {
    parX = (e.clientX / window.innerWidth - 0.5)
    parY = (e.clientY / window.innerHeight - 0.5)
  }
  function render() {
    if (!running) return
    stars.rotation.z += 0.0006
    camera.position.x += (parX * 1.6 - camera.position.x) * 0.04
    camera.position.y += (-parY * 1.0 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(render)
  }
  function startThree() { if (!running) { running = true; onResizeThree(); render() } }
  function stopThree() { running = false; if (raf) cancelAnimationFrame(raf); raf = null }

  window.PF.onHeroProgress = function (p) {
    const a = THREE.MathUtils
      ? THREE.MathUtils.clamp((p - 0.82) / (0.985 - 0.82), 0, 1)
      : Math.max(0, Math.min(1, (p - 0.82) / 0.165))
    threeCanvas.style.opacity = a.toFixed(3)
    if (a > 0.01) startThree(); else stopThree()
    if (starSprite) starSprite.material.opacity = 1 - a * 0.15
  }

  /* ---- ORBIT: build the five arms ---- */
  const armNodes = []
  let orbitLayer = null
  let orbitHeading = null
  let orbitFade = 1
  let injectedStyle = null
  function buildOrbit() {
    const wrap = document.createElement('div')
    wrap.id = 'orbitLayer'
    wrap.style.cssText = 'position:fixed;inset:0;z-index:7;pointer-events:none;will-change:opacity;'
    document.body.appendChild(wrap)
    orbitLayer = wrap

    const heading = document.createElement('div')
    heading.className = 'orbit-heading'
    heading.innerHTML = '<span class="eyebrow">Five ways we forge</span>'
    heading.style.cssText = 'position:absolute;top:11vh;left:50%;transform:translateX(-50%);opacity:0;text-align:center;will-change:opacity;'
    wrap.appendChild(heading)
    orbitHeading = heading

    const oldEyebrow = document.getElementById('orbitEyebrow')
    if (oldEyebrow && oldEyebrow.parentElement) oldEyebrow.parentElement.style.display = 'none'

    PF_CONFIG.arms.forEach((arm) => {
      const node = document.createElement('button')
      node.className = 'orbit-node'
      node.dataset.id = arm.id
      node.innerHTML =
        '<span class="orbit-node__medallion">' +
          `<img class="orbit-node__icon" src="${base}/icons/${arm.id}.png" alt="" />` +
          '<span class="orbit-node__dot"></span>' +
        '</span>' +
        `<span class="orbit-node__label">${arm.title}</span>`
      node.style.cssText = [
        'position:absolute', 'left:50%', 'top:50%', 'transform:translate(-50%,-50%) scale(0.2)',
        'opacity:0', 'pointer-events:auto', 'background:none', 'border:0', 'cursor:pointer',
        'display:flex', 'flex-direction:column', 'align-items:center', 'gap:12px',
        'font-family:var(--pf-mono)', 'font-size:0.66rem', 'letter-spacing:0.18em',
        'text-transform:uppercase', 'color:var(--pf-ink-soft)', 'white-space:nowrap', 'will-change:transform,opacity',
      ].join(';')
      wrap.appendChild(node)
      armNodes.push({ el: node, arm })

      const icon = node.querySelector('.orbit-node__icon')
      const dot = node.querySelector('.orbit-node__dot')
      icon.addEventListener('load', () => { if (icon.naturalWidth) dot.style.display = 'none' })
      icon.addEventListener('error', () => { icon.remove() })

      node.addEventListener('mouseenter', () => showArm(arm))
      node.addEventListener('mouseleave', hideArm)
      node.addEventListener('focus', () => showArm(arm))
      node.addEventListener('blur', hideArm)
    })

    const st = document.createElement('style')
    st.textContent = `
      .orbit-node__medallion{position:relative;width:92px;height:92px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:1px solid var(--pf-line);
        background:radial-gradient(circle at 50% 32%, rgba(120,84,213,0.28), rgba(8,6,16,0.42));
        box-shadow:0 0 34px rgba(120,84,213,0.26), inset 0 0 24px rgba(120,84,213,0.14);
        backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);
        transition:transform .4s var(--ease-out),border-color .4s,box-shadow .6s,background .4s;}
      .orbit-node__icon{width:44px;height:44px;object-fit:contain;
        filter:drop-shadow(0 0 8px rgba(185,160,255,0.55));}
      .orbit-node__dot{width:12px;height:12px;border-radius:50%;background:var(--pf-violet-bright);
        box-shadow:0 0 16px var(--pf-violet);transition:transform .3s var(--ease-out),background .3s;}
      .orbit-node__label{transition:color .3s;font-size:0.7rem;}
      .orbit-node:hover .orbit-node__medallion,.orbit-node:focus-visible .orbit-node__medallion{
        transform:scale(1.12);border-color:var(--pf-violet);
        background:radial-gradient(circle at 50% 32%, rgba(120,84,213,0.42), rgba(8,6,16,0.5));
        box-shadow:0 0 52px rgba(120,84,213,0.6), inset 0 0 28px rgba(120,84,213,0.25);}
      .orbit-node:hover .orbit-node__dot,.orbit-node:focus-visible .orbit-node__dot{transform:scale(1.4);background:#fff;}
      .orbit-node:hover .orbit-node__label,.orbit-node:focus-visible .orbit-node__label{color:var(--pf-violet-white);}`
    document.head.appendChild(st)
    injectedStyle = st
  }

  function showArm(arm) {
    armKicker.textContent = 'Persist'
    armTitle.textContent = arm.title
    armBody.textContent = arm.body
    armDetail.classList.add('show')
  }
  function hideArm() {
    armDetail.classList.remove('show')
  }

  function layoutOrbit(expand, spin, opacity) {
    const R = Math.min(window.innerWidth, window.innerHeight) * (window.innerWidth < 768 ? 0.34 : 0.28)
    const n = armNodes.length
    const op = (opacity == null) ? (expand < 0.05 ? 0 : Math.min(1, expand * 1.4)) : opacity
    armNodes.forEach((node, i) => {
      const ang = (-Math.PI / 2) + (i / n) * Math.PI * 2 + spin
      const r = R * expand
      const x = Math.cos(ang) * r
      const y = Math.sin(ang) * r
      const s = 0.2 + 0.8 * expand
      node.el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${s})`
      node.el.style.opacity = String(Math.max(0, op) * orbitFade)
    })
  }

  /* ---- LOGO drop + nav glide ---- */
  let navTarget = { x: 0, y: 0 }
  let navScale = 0.12
  function computeNavTarget() {
    const r = navSlot.getBoundingClientRect()
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2
    navTarget.x = (r.left + r.width / 2) - cx
    navTarget.y = (r.top + r.height / 2) - cy
    const lw = persistLogo.offsetWidth || 280
    const targetPx = 46
    navScale = targetPx / lw
  }
  function setLogo(drop, glide) {
    const baseScale = 0.6 + 0.4 * drop
    const scale = baseScale * (1 - glide) + navScale * glide
    const x = navTarget.x * glide
    const y = navTarget.y * glide
    persistLogo.style.opacity = String(Math.min(1, drop))
    persistLogo.style.transform =
      `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`
  }

  let tickerFn = null
  function wireScroll() {
    computeNavTarget()
    on(window, 'resize', computeNavTarget, { passive: true })

    let spin = 0
    let orbitProgress = 0

    function ringExpand(p) { return Math.min(1, Math.max(0, p) / 0.30) }
    function ringOpacity(p) {
      if (p <= 0.14 || p >= 0.92) return 0
      if (p < 0.30) return (p - 0.14) / 0.16
      if (p <= 0.66) return 1
      return 1 - (p - 0.66) / 0.26
    }

    mkTrigger({
      trigger: '#orbit',
      start: 'top 75%',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        orbitProgress = self.progress
        const drop = Math.min(1, orbitProgress / 0.26)
        const ex = ringExpand(orbitProgress)
        const op = ringOpacity(orbitProgress)
        if (window.PF._gliding !== true) setLogo(drop, 0)
        orbitFade = 1
        if (orbitLayer) orbitLayer.style.opacity = '1'
        layoutOrbit(ex, spin, op)
        if (orbitHeading) orbitHeading.style.opacity = String(op)
        threeCanvas.style.opacity = '1'; startThree()
        if (starSprite) starSprite.material.opacity = Math.max(0, 0.8 - drop * 0.8)
      },
    })

    if (!reduceMotion) {
      tickerFn = () => {
        if (running && armNodes.length) {
          spin += 0.0012
          const ex = ringExpand(orbitProgress)
          const op = ringOpacity(orbitProgress)
          if (ex > 0.02) layoutOrbit(ex, spin, op)
        }
      }
      gsap.ticker.add(tickerFn)
    }

    mkTrigger({
      trigger: '#what',
      start: 'top 78%',
      end: 'top 12%',
      scrub: 0.5,
      onUpdate: (self) => {
        const g = self.progress
        if (orbitLayer) orbitLayer.style.opacity = String(Math.max(0, 1 - g * 3))
        if (orbitHeading) orbitHeading.style.opacity = '0'
        threeCanvas.style.opacity = String(Math.max(0.05, 1 - g * 1.2))
        window.PF._gliding = g > 0.001
        setLogo(1, g)
        navSlot.style.pointerEvents = g > 0.55 ? 'auto' : 'none'
      },
    })

    persistLogo.style.pointerEvents = 'auto'
    on(persistLogo, 'click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  function initFinale() {
    if (!THREE) { console.warn('Three.js not loaded'); return }
    // lift the hover panel out of the scroll-track stacking context
    if (armDetail && armDetail.parentElement !== document.body) {
      document.body.appendChild(armDetail)
      cleanups.push(() => { if (armDetail && armDetail.parentElement) armDetail.parentElement.removeChild(armDetail) })
    }
    initThree()
    buildOrbit()
    setLogo(0, 0)
    wireScroll()
  }

  /* ============================================================
     3) ORCHESTRATION — loader, sound, cursor, scroll cue
     ============================================================ */
  function initMain() {
    // logo swap-in fallbacks (Tether lockup)
    function swapLogo(img) {
      if (img.dataset.swapped) return
      img.dataset.swapped = '1'
      const span = document.createElement('span')
      span.className = 'logo-fallback'
      span.textContent = img.dataset.fallback || img.alt || ''
      if (img.parentNode) img.parentNode.replaceChild(span, img)
    }
    document.querySelectorAll('.logo-swap').forEach((img) => {
      img.addEventListener('error', () => swapLogo(img))
      if (img.complete && img.naturalWidth === 0) swapLogo(img)
    })

    const loader = document.getElementById('loader')
    const onReady = () => loader && loader.classList.add('done')
    on(document, 'pf:ready', onReady)
    const hardFallback = setTimeout(() => loader && loader.classList.add('done'), 6000)
    cleanups.push(() => clearTimeout(hardFallback))

    const cue = document.getElementById('scrollCue')
    const navEl = document.getElementById('nav')
    const onWinScroll = () => {
      const y = window.scrollY
      if (cue) cue.style.opacity = y > 80 ? '0' : '1'
      if (navEl) navEl.classList.toggle('scrolled', y > 40)
    }
    on(window, 'scroll', onWinScroll, { passive: true })

    // custom cursor (desktop only)
    const dot = document.getElementById('cursorDot')
    const ring = document.getElementById('cursorRing')
    const fine = window.matchMedia('(pointer:fine)').matches
    if (fine && dot && ring && !reduceMotion) {
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my
      let cursorRaf = null
      on(window, 'mousemove', (e) => {
        mx = e.clientX; my = e.clientY
        dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`
      }, { passive: true })
      ;(function ringLoop() {
        if (killed) return
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`
        cursorRaf = requestAnimationFrame(ringLoop)
      })()
      cleanups.push(() => { if (cursorRaf) cancelAnimationFrame(cursorRaf) })
      const hov = 'a,button,.orbit-node,.btn,.sound-toggle'
      on(document, 'mouseover', (e) => { if (e.target.closest(hov)) { ring.style.width = '52px'; ring.style.height = '52px' } })
      on(document, 'mouseout', (e) => { if (e.target.closest(hov)) { ring.style.width = '34px'; ring.style.height = '34px' } })
    } else {
      if (dot) dot.style.display = 'none'
      if (ring) ring.style.display = 'none'
    }

    // SOUND: ambient pad + UI ticks, muted by default
    const toggle = document.getElementById('soundToggle')
    const label = document.getElementById('soundLabel')
    let actx = null, master = null, soundOn = false
    const padNodes = []

    function buildAudio() {
      actx = new (window.AudioContext || window.webkitAudioContext)()
      master = actx.createGain()
      master.gain.value = 0
      master.connect(actx.destination)
      const lp = actx.createBiquadFilter()
      lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.6
      lp.connect(master)
      ;[110, 110.4, 164.81].forEach((f, i) => {
        const o = actx.createOscillator()
        o.type = i === 2 ? 'sine' : 'sawtooth'
        o.frequency.value = f
        const g = actx.createGain()
        g.gain.value = i === 2 ? 0.05 : 0.04
        o.connect(g); g.connect(lp); o.start()
        padNodes.push(o)
      })
      const lfo = actx.createOscillator(); lfo.frequency.value = 0.05
      const lfoG = actx.createGain(); lfoG.gain.value = 180
      lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start()
    }
    function uiTick(freq) {
      if (!actx || !soundOn) return
      const o = actx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq || 880
      const g = actx.createGain(); g.gain.value = 0.0001
      o.connect(g); g.connect(master)
      const t = actx.currentTime
      g.gain.linearRampToValueAtTime(0.06, t + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.start(t); o.stop(t + 0.18)
    }
    function setSound(state) {
      soundOn = state
      if (soundOn) {
        if (!actx) buildAudio()
        if (actx.state === 'suspended') actx.resume()
        master.gain.cancelScheduledValues(actx.currentTime)
        master.gain.linearRampToValueAtTime(0.5, actx.currentTime + 1.2)
        toggle.classList.add('is-on'); toggle.setAttribute('aria-pressed', 'true')
        if (label) label.textContent = 'Sound on'
      } else {
        if (master) master.gain.linearRampToValueAtTime(0, actx.currentTime + 0.4)
        toggle.classList.remove('is-on'); toggle.setAttribute('aria-pressed', 'false')
        if (label) label.textContent = 'Sound'
      }
    }
    if (toggle) {
      on(toggle, 'click', () => setSound(!soundOn))
      on(document, 'mouseover', (e) => { if (e.target.closest('.orbit-node')) uiTick(1320) })
      document.querySelectorAll('.btn').forEach((b) => on(b, 'mouseenter', () => uiTick(660)))
    }
    cleanups.push(() => { if (actx) { try { actx.close() } catch { /* noop */ } } })

    // refresh ScrollTrigger after fonts/images settle
    const onFramesComplete = () => ScrollTrigger.refresh()
    on(document, 'pf:framesComplete', onFramesComplete)
    const onLoad = () => ScrollTrigger.refresh()
    on(window, 'load', onLoad)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!killed) ScrollTrigger.refresh() })
  }

  /* ============================================================
     BOOT  (scrubber → finale → orchestration, mirrors script order)
     ============================================================ */
  initScrubber()
  initFinale()
  initMain()
  preload()

  /* ---- teardown ---- */
  return function cleanup() {
    killed = true
    stopThree()
    if (tickerFn) gsap.ticker.remove(tickerFn)
    createdTriggers.forEach((t) => t && t.kill())
    cleanups.forEach((fn) => { try { fn() } catch { /* noop */ } })
    if (orbitLayer && orbitLayer.parentElement) orbitLayer.parentElement.removeChild(orbitLayer)
    if (injectedStyle && injectedStyle.parentElement) injectedStyle.parentElement.removeChild(injectedStyle)
    if (renderer) { try { renderer.dispose() } catch { /* noop */ } }
    if (window.PF) { window.PF.onHeroProgress = null; window.PF._gliding = false }
  }
}
