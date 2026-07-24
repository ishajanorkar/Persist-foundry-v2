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
    // order matters — clockwise from top-right (seam at top, Co-Founder at bottom)
    arms: [
      {
        id: 'substudio', title: 'Sub Studio Program',
        body: 'Specialist studios under one roof. Deep craft on demand, so your team stays small and your edges stay sharp.',
        points: [
          'Specialist craft studios under one roof',
          'Deep expertise on demand without headcount',
          'Keep the core team small and sharp',
          'Plug-in talent for the hard edges',
        ],
      },
      {
        id: 'accelerator', title: 'Accelerator',
        body: 'A focused program that turns founder potential into a funded company. A salary to kickstart the team, mentorship from a 400 person network, and a deadline that forges.',
        points: [
          'Custom prototype engineering with tailored solutions',
          'Validation & positioning audit with detailed insights',
          'First-customer playbooks with step-by-step guidance',
          'Access to foundational capital and strategic funding',
        ],
      },
      {
        id: 'cofounder', title: 'Co-Founder Bridge',
        body: 'We match founders with the missing other half. The technical, the commercial, the one who stakes the next year beside you.',
        points: [
          'Matched with your complementary other half',
          'Technical and commercial pairing',
          'Shared stake for the next year together',
          'Chemistry screened by operators who have done it',
        ],
      },
      {
        id: 'companies', title: 'Studio for Companies',
        body: 'Operating muscle for companies ready to scale. Builders, designers, recruiters, and internal tools, embedded until the venture stands on its own.',
        points: [
          'Embedded builders, designers, recruiters',
          'Internal tools shipped alongside the team',
          'Operating muscle until the venture stands alone',
          'Scale without bloating the permanent headcount',
        ],
      },
      {
        id: 'founders', title: 'Studio for Founders',
        body: 'Zero to one for the founder with nothing but a bet. We provide the salary and the hands to build the first version with you, not for you.',
        points: [
          'Salary so you can leave the job and build',
          'Hands that build the first version with you',
          'Zero-to-one partnership, not consulting',
          'A bet on the founder, not just the idea',
        ],
      },
    ],
  }
  window.PF_CONFIG = PF_CONFIG
  window.PF = window.PF || {}
  window.PF._glideG = 0

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
  const stageFlareMask = document.getElementById('stageFlareMask')

  function bandOpacity(p, b) {
    const [a, c, d, e] = b
    if (p <= a || p >= e) return 0
    if (p < c) return (p - a) / (c - a)
    if (p <= d) return 1
    return 1 - (p - d) / (e - d)
  }
  function updateBeats(p) {
    let stageO = 0
    let thresholdO = 0
    const isMobile = window.matchMedia('(max-width: 1024px)').matches
    for (let i = 0; i < beatInners.length; i++) {
      const o = bandOpacity(p, BEAT_BANDS[i])
      const { inner, scrim } = beatInners[i]
      if (inner) {
        inner.style.opacity = o.toFixed(3)
        inner.style.transform = `translateY(${(1 - o) * 26}px)`
      }
      // Soft hero wash on mobile (match Funded-by depth); light on desktop
      const scrimMul = i === 2 ? 0 : i === 0 ? (isMobile ? 0.7 : 0.45) : 0.95
      if (scrim) scrim.style.opacity = (o * scrimMul).toFixed(3)
      // Soft stage fade on hero / tether; none on backstory
      if (i === 0) stageO = Math.max(stageO, o * (isMobile ? 0.38 : 0.18))
      if (i === 1) stageO = Math.max(stageO, o * 0.92)
      // i === 2 (threshold/backstory): intentionally no stage fade
      if (i === 2) thresholdO = o
    }
    if (stageFade) stageFade.style.opacity = stageO.toFixed(3)
    // Cover the baked center glow through Backstory only.
    // Once Five Ways owns scroll, orbit onUpdate drives the soft veil.
    if (stageFlareMask) {
      const orbitP = window.PF._orbitProgress || 0
      if (orbitP >= 0.01) {
        /* orbit handler owns the mask */
      } else if (p >= 0.78 || thresholdO > 0.05) {
        stageFlareMask.style.opacity = '1'
      } else {
        stageFlareMask.style.opacity = '0'
      }
    }
  }

  // Slide-in reveal for Tether heading + logos when the beat enters view
  // (band ~0.34–0.60; fire as the section fades in).
  const lockup = document.querySelector('#tether .lockup')
  let tetherRevealed = false
  function maybeRevealTether(p) {
    if (tetherRevealed || !lockup) return
    if (p >= 0.36) {
      tetherRevealed = true
      lockup.classList.add('is-revealed')
    }
  }

  // Subtle rise-in for Backstory header + body when the beat enters view
  const thresholdCopy = document.querySelector('#threshold .threshold-copy')
  let thresholdCopyRevealed = false
  function maybeRevealThresholdCopy(p) {
    if (thresholdCopyRevealed || !thresholdCopy) return
    if (p >= 0.82) {
      thresholdCopyRevealed = true
      thresholdCopy.classList.add('is-revealed')
    }
  }

  // count-up of the threshold stats (30+, $117M, 400+, 67B) as that beat
  // scrolls in. Each value is split into prefix / number / suffix so the
  // "$" and "+"/"M"/"B" are preserved while only the number animates.
  const statData = Array.from(document.querySelectorAll('#threshold .stat__num')).map((el) => {
    // Cache the original final value once; a re-init (StrictMode/HMR) must not
    // re-parse an already-zeroed element, which would make the target 0.
    if (!el.dataset.countFinal) el.dataset.countFinal = el.textContent.trim()
    const m = el.dataset.countFinal.match(/^(\D*)(\d[\d.]*)(\D*)$/)
    return { el, prefix: m ? m[1] : '', target: m ? parseFloat(m[2]) : 0, suffix: m ? m[3] : '' }
  })
  if (!reduceMotion) statData.forEach((s) => { s.el.textContent = s.prefix + '0' + s.suffix })
  let thresholdCounted = false
  let countRaf = null
  function countUpThreshold() {
    if (thresholdCounted) return
    thresholdCounted = true
    const dur = 1700
    const t0 = performance.now()
    function frame(now) {
      if (killed) return
      const t = Math.min(1, (now - t0) / dur)
      const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
      statData.forEach((s) => { s.el.textContent = s.prefix + Math.round(s.target * e) + s.suffix })
      if (t < 1) countRaf = requestAnimationFrame(frame)
    }
    countRaf = requestAnimationFrame(frame)
  }
  cleanups.push(() => { if (countRaf) cancelAnimationFrame(countRaf) })
  function maybeCountThreshold(p) {
    if (!thresholdCounted && p >= 0.84) countUpThreshold()
  }

  window.PF.heroProgress = 0
  function onScrub(p) {
    window.PF.heroProgress = p
    drawFrame(progressToFrame(p))
    updateBeats(p)
    maybeRevealTether(p)
    maybeRevealThresholdCopy(p)
    maybeCountThreshold(p)
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
  const armIcon = document.getElementById('armIcon')
  const armList = document.getElementById('armList')

  let renderer, scene, camera, stars, starSprite, raf = null, running = false
  let parX = 0, parY = 0
  /** 0 → far field; 1 → zoomed toward viewer (scroll-driven in the orbit section) */
  let starZoom = 0
  let starFieldOpacity = 0

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

    const N = window.innerWidth < 768 ? 420 : 900
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      // spherical-ish cloud so a camera/star zoom reads as flying through space
      const r = 4 + Math.random() * 36
      const a = Math.random() * Math.PI * 2
      const elev = (Math.random() - 0.5) * Math.PI * 0.85
      pos[i * 3]     = Math.cos(a) * Math.cos(elev) * r
      pos[i * 3 + 1] = Math.sin(elev) * r * 0.72
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(elev) * r - 8
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const starTex = makeStarTexture()
    const mat = new THREE.PointsMaterial({
      size: 0.42, map: starTex, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0xe8e4f8, opacity: 0.95,
      sizeAttenuation: true,
    })
    stars = new THREE.Points(geo, mat)
    scene.add(stars)

    const sMat = new THREE.SpriteMaterial({ map: starTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 1 })
    starSprite = new THREE.Sprite(sMat)
    starSprite.scale.set(4.2, 4.2, 1)
    starSprite.position.set(0, 0, 1.5)
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
    const z = starZoom
    // slow drift + scroll zoom: field expands toward the camera
    stars.rotation.z += 0.00045
    stars.rotation.y += 0.00018
    const fieldScale = 1 + z * 2.8
    stars.scale.setScalar(fieldScale)
    stars.position.z = z * 14
    if (stars.material) stars.material.opacity = 0.55 + (1 - z) * 0.4

    // big center star grows / approaches as zoom rises — present but not blown out
    if (starSprite) {
      const s = 2.8 + z * 16
      starSprite.scale.set(s, s, 1)
      starSprite.position.z = 1.5 + z * 5.5
      starSprite.material.opacity = Math.max(0, (0.62 - z * 0.32) * starFieldOpacity)
    }

    camera.position.z = 14 - z * 9.5
    camera.position.x += (parX * 1.2 - camera.position.x) * 0.04
    camera.position.y += (-parY * 0.85 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
    if (threeCanvas) threeCanvas.style.opacity = String(starFieldOpacity)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(render)
  }
  function startThree() { if (!running) { running = true; onResizeThree(); render() } }
  function stopThree() { running = false; if (raf) cancelAnimationFrame(raf); raf = null }

  window.PF.onHeroProgress = function (p) {
    // Starfield + center flare sprite only belong to Five Ways (#orbit).
    // Keep them fully off through Backstory so that glow never shows early.
    const orbitP = window.PF._orbitProgress || 0
    if (orbitP < 0.02) {
      starFieldOpacity = 0
      if (threeCanvas) threeCanvas.style.opacity = '0'
      stopThree()
      return
    }
  }

  /* ---- ORBIT: build the five arms as a segmented glass donut ---- */
  const armNodes = []
  let orbitLayer = null
  let orbitHeading = null
  let orbitDonut = null
  let orbitRing = null
  let orbitMoon = null
  let orbitSegLines = null
  let orbitFade = 1
  let injectedStyle = null
  const ORBIT_GAP_DEG = 3.2  // gap between petals (matches Frame reference)

  // recompute donut geometry: clip each petal to an annular sector with rounded
  // corners, place its icon+label at the segment's mid-radius, size the core.
  function layoutDonut() {
    if (!orbitDonut) return
    const vmin = Math.min(window.innerWidth, window.innerHeight)
    const w = window.innerWidth
    // Scale the wheel down so it doesn't dominate the viewport
    let scale = 0.66
    if (w <= 640) scale = 0.62
    else if (w <= 1024) scale = 0.42
    else if (w < 1100) scale = 0.48
    else if (w < 1280) scale = 0.56
    const D = Math.round(vmin * scale)
    const Ro = D / 2
    const Ri = Ro * 0.52
    const cx = Ro, cy = Ro
    const rc = Ri + (Ro - Ri) * 0.52
    orbitDonut.style.width = orbitDonut.style.height = D + 'px'
    if (orbitRing) {
      orbitRing.style.width = orbitRing.style.height = D + 'px'
    }

    const n = armNodes.length
    const seg = 360 / n
    // -90 puts 0deg at the top; +seg/2 offset leaves a seam at top-center and
    // seats a full petal at the bottom (matches the reference layout)
    const rad = (deg) => (deg - 90) * Math.PI / 180
    const P = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
    const f = (v) => v.toFixed(1)
    let linesHTML = ''

    armNodes.forEach(({ el }, i) => {
      const center = i * seg + seg / 2
      const a0 = rad(center - seg / 2 + ORBIT_GAP_DEG / 2)
      const a1 = rad(center + seg / 2 - ORBIT_GAP_DEG / 2)
      // clip defines the single even segment shape (active fill bleeds to this edge)
      const RoC = Ro
      const RiC = Ri
      const crC = (RoC - RiC) * 0.2
      const daOC = crC / RoC
      const daIC = crC / RiC
      const [oxS, oyS] = P(RoC, a0 + daOC)
      const [oxE, oyE] = P(RoC, a1 - daOC)
      const [ixE, iyE] = P(RiC, a1 - daIC)
      const [ixS, iyS] = P(RiC, a0 + daIC)
      const [rA1o_x, rA1o_y] = P(RoC - crC, a1)
      const [rA1i_x, rA1i_y] = P(RiC + crC, a1)
      const [rA0i_x, rA0i_y] = P(RiC + crC, a0)
      const [rA0o_x, rA0o_y] = P(RoC - crC, a0)
      const [coE_x, coE_y] = P(RoC, a1)
      const [ciE_x, ciE_y] = P(RiC, a1)
      const [ciS_x, ciS_y] = P(RiC, a0)
      const [coS_x, coS_y] = P(RoC, a0)
      const d =
        `M${f(oxS)} ${f(oyS)} ` +
        `A${f(RoC)} ${f(RoC)} 0 0 1 ${f(oxE)} ${f(oyE)} ` +
        `Q${f(coE_x)} ${f(coE_y)} ${f(rA1o_x)} ${f(rA1o_y)} ` +
        `L${f(rA1i_x)} ${f(rA1i_y)} ` +
        `Q${f(ciE_x)} ${f(ciE_y)} ${f(ixE)} ${f(iyE)} ` +
        `A${f(RiC)} ${f(RiC)} 0 0 0 ${f(ixS)} ${f(iyS)} ` +
        `Q${f(ciS_x)} ${f(ciS_y)} ${f(rA0i_x)} ${f(rA0i_y)} ` +
        `L${f(rA0o_x)} ${f(rA0o_y)} ` +
        `Q${f(coS_x)} ${f(coS_y)} ${f(oxS)} ${f(oyS)} Z`
      el.style.clipPath = `path('${d}')`
      el.style.webkitClipPath = `path('${d}')`
      // Active fill is full-bleed inside the clip (no nested card). Only icons need mid-arc placement.
      const [px, py] = P(rc, rad(center))
      const content = el.querySelector('.orbit-petal__content')
      if (content) { content.style.left = px + 'px'; content.style.top = py + 'px' }

      // hairline rim on top of the clipped glass (Frame-accurate)
      linesHTML += `<path class="orbit-seg-rim" d="${d}" />`
    })
    if (orbitSegLines) {
      orbitSegLines.setAttribute('viewBox', `0 0 ${D} ${D}`)
      orbitSegLines.setAttribute('width', String(D))
      orbitSegLines.setAttribute('height', String(D))
      orbitSegLines.innerHTML = linesHTML
    }

    const core = orbitDonut.querySelector('.orbit-core')
    if (core) { const c = Math.round(Ri * 2 * 0.78); core.style.width = core.style.height = c + 'px' }

    // SVG art only fills ~42% of the 2000² box — target visual P ≈ 22% of core
    if (persistLogo && core) {
      const corePx = parseFloat(core.style.width) || (Ri * 2 * 0.78)
      const markPx = Math.max(56, Math.round(corePx * 0.52))
      persistLogo.dataset.orbitMarkPx = String(markPx)
    }
  }

  function buildOrbit() {
    // drop any leftover injected styles / layers from a prior HMR pass
    document.querySelectorAll('style[data-orbit-styles]').forEach((n) => n.remove())
    document.querySelectorAll('#orbitLayer').forEach((n) => n.remove())

    const wrap = document.createElement('div')
    wrap.id = 'orbitLayer'
    // start hidden — the layer is only revealed inside the #orbit section
    // (opacity is driven by the scroll trigger), so it never bleeds over the hero
    wrap.style.cssText = 'position:fixed;inset:0;z-index:7;pointer-events:none;will-change:opacity;opacity:0;'
    document.body.appendChild(wrap)
    orbitLayer = wrap

    // charcoal technical backdrop (grid) — stars show through via partial alpha
    const backdrop = document.createElement('div')
    backdrop.className = 'orbit-backdrop'
    wrap.appendChild(backdrop)

    // Group_1 blueprint — two offset circles, axes, square nodes, corner circles
    const diagram = document.createElement('img')
    diagram.className = 'orbit-diagram'
    diagram.src = '/foundry/orbit-diagram.png'
    diagram.alt = ''
    diagram.setAttribute('aria-hidden', 'true')
    diagram.draggable = false
    wrap.appendChild(diagram)

    const heading = document.createElement('div')
    heading.className = 'orbit-heading'
    heading.innerHTML =
      '<span class="orbit-heading__title">Five Ways We Forge</span>' +
      '<p class="orbit-heading__body">Whether you bring an idea, half a team, or a company already moving, there is a door built for where you stand.</p>'
    wrap.appendChild(heading)
    orbitHeading = heading

    const oldEyebrow = document.getElementById('orbitEyebrow')
    if (oldEyebrow && oldEyebrow.parentElement) oldEyebrow.parentElement.style.display = 'none'

    const donut = document.createElement('div')
    donut.className = 'orbit-donut'
    donut.id = 'orbitDonut'
    wrap.appendChild(donut)
    orbitDonut = donut

    // eclipse moon: exact asset from design — full silver disc + amber corona
    // rotates as one rigid bitmap so colors/shade never remesh while spinning
    const core = document.createElement('div')
    core.className = 'orbit-core'
    core.innerHTML =
      '<span class="orbit-core__moon" aria-hidden="true">' +
        '<img class="orbit-core__eclipse" src="/foundry/orbit-eclipse.png" alt="" draggable="false" />' +
      '</span>'
    donut.appendChild(core)
    orbitMoon = core.querySelector('.orbit-core__moon')

    // spinning ring holds petals + segment strokes so the glass moon can
    // share the same rotation while the core body and P mark stay put
    const ring = document.createElement('div')
    ring.className = 'orbit-ring'
    donut.appendChild(ring)
    orbitRing = ring

    // segment border-lines drawn on top of the frosted petals
    const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    lines.setAttribute('class', 'orbit-seg-lines')
    ring.appendChild(lines)
    orbitSegLines = lines

    // line icons drawn to match the reference wheel (thin, rounded strokes)
    const ICONS = {
      // Saturn / planet — Studio for Founders
      founders: '<circle cx="12" cy="12" r="5.4"/><ellipse cx="12" cy="12" rx="10.2" ry="3.7" transform="rotate(-22 12 12)"/>',
      // stacked layers — Sub Studio Program
      substudio: '<path d="M12 3.2 3 8l9 4.8L21 8 12 3.2Z"/><path d="M3 12l9 4.8L21 12"/><path d="M3 15.9l9 4.8 9-4.8"/>',
      // upward rocket — Accelerator
      accelerator: '<path d="M12 2.8c2.4 3.4 3.6 6.8 3.6 9.6 0 2.6-1.1 4.5-3.6 6-2.5-1.5-3.6-3.4-3.6-6 0-2.8 1.2-6.2 3.6-9.6Z"/><path d="M9.1 14.2 6.2 19.4M14.9 14.2l2.9 5.2"/><path d="M10.4 11h3.2"/><circle cx="12" cy="9.2" r="1.1"/>',
      // suspension bridge — Co-Founder Bridge
      cofounder: '<path d="M3 19h18"/><path d="M5 19V8M19 19V8"/><path d="M5 8c4 4.4 10 4.4 14 0"/><path d="M9 19v-4.6M12 19v-6M15 19v-4.6"/>',
      // buildings — Studio for Companies
      companies: '<path d="M3 20.5h18"/><path d="M5.5 20.5V8l5-2.6v15.1"/><path d="M10.5 20.5V11l7.9 2.5v7"/><path d="M8 9.2v0M8 12.1v0M14 15v0M14 17.6v0"/>',
    }

    PF_CONFIG.arms.forEach((arm) => {
      const petal = document.createElement('button')
      petal.className = 'orbit-petal'
      petal.dataset.id = arm.id
      const iconSvg = ICONS[arm.id] || ''
      petal.innerHTML =
        '<span class="orbit-petal__content">' +
          `<span class="orbit-petal__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg></span>` +
          `<span class="orbit-petal__label">${arm.title}</span>` +
        '</span>'
      ring.appendChild(petal)
      armNodes.push({ el: petal, arm, iconSvg })

      petal.addEventListener('mouseenter', () => showArm(arm, petal))
      petal.addEventListener('mouseleave', hideArm)
      petal.addEventListener('focus', () => showArm(arm, petal))
      petal.addEventListener('blur', hideArm)
    })

    const st = document.createElement('style')
    st.setAttribute('data-orbit-styles', '1')
    st.textContent = `
      /* black field + faint grid — alpha lets the zooming starfield read through */
      .orbit-backdrop{position:absolute;inset:0;pointer-events:none;z-index:0;opacity:0;
        will-change:opacity;background-color:rgba(0,0,0,0.78);
        background-image:
          linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size:36px 36px, 36px 36px;
        background-position:center;}
      .orbit-diagram{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;
        opacity:0;will-change:opacity;object-fit:contain;object-position:center;
        /* viewport-sized Group_1 — faint hairline blueprint behind the wheel */}
      .orbit-heading{position:absolute;top:clamp(11vh,14vh,16vh);left:50%;
        transform:translateX(-50%);z-index:4;max-width:min(26rem,78vw);opacity:0;will-change:opacity;
        display:flex;flex-direction:column;align-items:center;gap:0.65rem;
        pointer-events:none;text-align:center;}
      .orbit-heading__title{font-family:'Montserrat',var(--pf-display),system-ui,sans-serif;
        font-weight:600;font-style:normal;
        font-size:clamp(1.05rem,1.55vw,1.35rem);line-height:1.2;letter-spacing:-0.04em;
        color:#ffffff;text-shadow:0 2px 22px rgba(0,0,0,0.85);text-align:center;}
      .orbit-heading__body{margin:0;font-family:'Montserrat',var(--pf-display),system-ui,sans-serif;
        font-weight:400;font-style:normal;
        font-size:clamp(0.78rem,0.95vw,0.9rem);line-height:1.4;letter-spacing:-0.03em;
        color:rgba(168,172,184,0.72);max-width:36ch;
        text-shadow:0 1px 14px rgba(0,0,0,0.75);text-align:center;}
      /* wheel dead-center — primary focal point of the section */
      .orbit-donut{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        transform-origin:center;will-change:transform,opacity;pointer-events:none;z-index:2;}
      .orbit-ring{position:absolute;inset:0;transform-origin:center;
        will-change:transform;pointer-events:none;}
      .orbit-core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        border-radius:50%;pointer-events:none;z-index:3;overflow:visible;
        background:#c3c3c3;
        box-shadow:
          0 0 0 1px rgba(255,255,255,0.12),
          0 0 28px 10px rgba(255,255,255,0.14),
          0 0 56px 18px rgba(255,255,255,0.08),
          0 0 48px 14px rgba(0,0,0,0.45),
          0 0 80px 20px rgba(255,200,140,0.1);}
      .orbit-core__moon{position:absolute;inset:0;border-radius:50%;pointer-events:none;
        transform-origin:center;will-change:transform;overflow:hidden;}
      .orbit-core__eclipse{position:absolute;inset:0;width:100%;height:100%;
        display:block;object-fit:cover;border-radius:50%;pointer-events:none;
        user-select:none;-webkit-user-drag:none;
        filter:saturate(0.55) brightness(1.08) contrast(0.94);
        opacity:0.95;
        -webkit-mask-image:radial-gradient(circle at 50% 50%,
          transparent 0%, transparent 28%, rgba(0,0,0,0.3) 38%,
          rgba(0,0,0,0.85) 50%, #000 60%);
        mask-image:radial-gradient(circle at 50% 50%,
          transparent 0%, transparent 28%, rgba(0,0,0,0.3) 38%,
          rgba(0,0,0,0.85) 50%, #000 60%);}
      .orbit-petal{position:absolute;inset:0;z-index:1;padding:0;border:0;cursor:pointer;
        isolation:isolate;
        /* idle glass — darker charcoal, frosted so blueprint softens behind */
        background:linear-gradient(160deg,
          rgba(48,46,56,0.82) 0%,
          rgba(32,30,40,0.88) 48%,
          rgba(22,20,28,0.92) 100%);
        -webkit-backdrop-filter:blur(16px) saturate(1.2);
        backdrop-filter:blur(16px) saturate(1.2);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);
        /* active purple lives on ::before — opacity fade stays inside clip-path */
        --orbit-active-fill:radial-gradient(circle at 50% 50%,
          rgb(18,14,28) 0%,
          rgb(28,20,48) 28%,
          rgb(55,36,95) 44%,
          rgb(105,72,158) 54%,
          rgb(145,108,190) 60%,
          rgb(190,168,220) 66%,
          rgb(235,230,245) 72%,
          rgb(255,255,255) 78%);}
      .orbit-petal::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
        background:var(--orbit-active-fill);opacity:0;
        transition:opacity .35s var(--ease-out);}
      .orbit-petal:hover::before,.orbit-petal.is-featured::before{opacity:1;}
      /* glow on the rim SVG only — never filter the petal (uncips a rectangle) */
      .orbit-seg-lines{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:visible;
        fill:none;}
      .orbit-seg-rim{fill:none;stroke:rgba(220,224,234,0.5);stroke-width:1;
        stroke-linecap:round;stroke-linejoin:round;
        transition:stroke .35s var(--ease-out), filter .35s var(--ease-out);}
      .orbit-seg-rim.is-lit{stroke:rgba(235,220,255,0.9);stroke-width:1.15;
        filter:drop-shadow(0 0 6px rgba(150,110,230,0.85)) drop-shadow(0 0 14px rgba(110,70,200,0.55));}
      .orbit-petal__content{position:absolute;transform:translate(-50%,-50%);
        display:flex;flex-direction:column;align-items:center;gap:12px;
        pointer-events:none;text-align:center;will-change:transform;z-index:3;}
      .orbit-petal__icon{width:28px;height:28px;display:block;
        color:rgba(245,245,248,0.95);transition:transform .4s var(--ease-out);}
      .orbit-petal__icon svg{width:100%;height:100%;display:block;}
      .orbit-petal:hover .orbit-petal__icon,.orbit-petal.is-featured .orbit-petal__icon{transform:scale(1.1);color:#fff;}
      .orbit-petal__label{font-family:'Montserrat',var(--pf-display),system-ui,sans-serif;font-weight:400;
        font-size:clamp(0.72rem,1.05vw,0.95rem);letter-spacing:-0.04em;line-height:1.2;
        color:rgba(250,250,252,0.96);max-width:10ch;
        text-shadow:0 1px 10px rgba(0,0,0,0.75);transition:color .3s;}
      .orbit-petal:hover .orbit-petal__label,.orbit-petal.is-featured .orbit-petal__label{color:#fff;}
      @media (max-width:1024px){
        .orbit-heading{
          left:50%;transform:translateX(-50%);
          max-width:min(22rem,86vw);top:clamp(5.5rem,12vh,7.5rem);
          align-items:center;text-align:center;
        }
        .orbit-heading__title{font-size:clamp(0.98rem,3.8vw,1.2rem);}
        .orbit-heading__body{max-width:32ch;font-size:clamp(0.75rem,2.8vw,0.86rem);}
        .orbit-petal__icon{width:22px;height:22px;}
        .orbit-petal__label{
          font-size:clamp(0.52rem,1.35vw,0.62rem);
          line-height:1.15;max-width:9ch;letter-spacing:-0.03em;
        }
        .orbit-petal__content{gap:8px;}
      }
      @media (max-width:640px){
        .orbit-heading{
          left:50%;transform:translateX(-50%);
          top:clamp(5.25rem,11.5vh,7rem);
          gap:0.7rem;max-width:min(20rem,88vw);
          align-items:center;text-align:center;
        }
        .orbit-heading__title,.orbit-heading__body{text-align:center;}
        .orbit-heading__body{max-width:28ch;font-size:0.88rem;}
        .orbit-petal__label{font-size:0.5rem;max-width:8ch;}
      }`
    document.head.appendChild(st)
    injectedStyle = st

    layoutDonut()
    on(window, 'resize', layoutDonut, { passive: true })
  }

  /* ---- ARM detail card: hover-only (bottom-right) ----
     Details appear only while a segment is hovered/focused. Scroll no longer
     auto-cycles the panel. */
  let featuredIndex = -1
  let hoverActive = false
  let lastProg = 0
  let lastOp = 0
  let swapTO = 0
  const armContent = document.getElementById('armContent')

  function setCardText(arm, iconSvg) {
    if (armTitle) armTitle.textContent = arm.title
    if (armBody) armBody.textContent = arm.body || ''
    if (armKicker) armKicker.textContent = 'Persist'
    if (armIcon) {
      armIcon.innerHTML = iconSvg
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>`
        : ''
    }
    if (armList) {
      const pts = arm.points || []
      armList.innerHTML = pts.map((t) => `<li>${t}</li>`).join('')
      armList.hidden = pts.length === 0
    }
  }
  function setRimLit(nodeEl) {
    if (!orbitSegLines) return
    const rims = orbitSegLines.querySelectorAll('.orbit-seg-rim')
    armNodes.forEach((x, i) => {
      const rim = rims[i]
      if (rim) rim.classList.toggle('is-lit', x.el === nodeEl)
    })
  }
  function setNodeFeatured(nodeEl) {
    armNodes.forEach((x) => x.el.classList.toggle('is-featured', x.el === nodeEl))
    setRimLit(nodeEl)
  }
  function clearCard() {
    clearTimeout(swapTO)
    hoverActive = false
    if (!armDetail) return
    armDetail.classList.remove('show', 'is-swapping')
    if (armContent) armContent.classList.remove('is-fading')
    featuredIndex = -1
    armNodes.forEach((x) => x.el.classList.remove('is-featured'))
    setRimLit(null)
  }

  function featureArm(arm, nodeEl, iconSvg, crossfade) {
    if (!armDetail) return
    armDetail.style.left = armDetail.style.top = armDetail.style.right =
      armDetail.style.bottom = armDetail.style.transform = ''
    armDetail.classList.add('portfolio-detail--anchored')
    setNodeFeatured(nodeEl)
    clearTimeout(swapTO)

    const apply = () => {
      setCardText(arm, iconSvg)
      armDetail.classList.add('show')
      armDetail.classList.remove('is-swapping')
      if (armContent) armContent.classList.remove('is-fading')
    }

    if (crossfade && armDetail.classList.contains('show')) {
      if (armContent) armContent.classList.add('is-fading')
      swapTO = setTimeout(apply, 220)
    } else {
      apply()
    }
  }

  function showArm(arm, nodeEl) {
    hoverActive = true
    const hit = armNodes.find((x) => x.arm === arm) || {}
    const el = nodeEl || hit.el
    const idx = armNodes.findIndex((x) => x.arm === arm)
    featuredIndex = idx
    featureArm(arm, el, hit.iconSvg || '', false)
  }
  function hideArm() {
    hoverActive = false
    clearCard()
  }

  // Hover/focus shows the panel; scroll past the active wheel always dismisses it
  // (mobile touch can leave hoverActive stuck true without a mouseleave).
  function updateFeatured(p, op) {
    lastProg = p
    lastOp = op
    const inActiveWheel = op > 0.35 && p > 0.30 && p < 0.94
    if (!inActiveWheel && (featuredIndex !== -1 || armDetail?.classList.contains('show'))) {
      clearCard()
      return
    }
    if (!hoverActive && (featuredIndex !== -1 || armDetail?.classList.contains('show'))) {
      clearCard()
    }
  }

  function layoutOrbit(expand, spin, opacity) {
    if (!orbitDonut) return
    const op = (opacity == null) ? (expand < 0.05 ? 0 : Math.min(1, expand * 1.4)) : opacity
    const vis = Math.max(0, op) * orbitFade
    // core star + ring scale up together as the zoom settles into the wheel
    const scale = 0.55 + 0.45 * expand
    const deg = (spin * 180 / Math.PI)
    orbitDonut.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`
    orbitDonut.style.opacity = String(vis)
    // spin the petal ring + glass moon together; counter-rotate labels so
    // they stay upright while the wheel turns
    if (orbitRing) orbitRing.style.transform = `rotate(${deg.toFixed(3)}deg)`
    if (orbitMoon) orbitMoon.style.transform = `rotate(${deg.toFixed(3)}deg)`
    armNodes.forEach(({ el }) => {
      const content = el.querySelector('.orbit-petal__content')
      if (content) content.style.transform = `translate(-50%, -50%) rotate(${(-deg).toFixed(3)}deg)`
    })
    // one pointer-events toggle on the container: petals stay hoverable while
    // the ring is visible, but a faded ring must not catch hovers over the
    // sections beneath (which would pop the detail card from nowhere)
    orbitDonut.style.pointerEvents = vis > 0.35 ? 'auto' : 'none'
    if (orbitRing) orbitRing.style.pointerEvents = vis > 0.35 ? 'auto' : 'none'
    // Fixed body panel must not outlive the wheel (esp. after touch hover)
    if (vis <= 0.35 && armDetail?.classList.contains('show')) clearCard()
  }

  /* ---- LOGO drop + nav glide ---- */
  let navTarget = { x: 0, y: 0 }
  let navScale = 0.12
  function computeNavTarget() {
    if (!navSlot || !persistLogo) return
    const r = navSlot.getBoundingClientRect()
    // the logo's left:50% resolves against the layout viewport (excludes the
    // scrollbar), so measure from clientWidth/Height — innerWidth would land
    // the mark half a scrollbar off-center
    const cx = document.documentElement.clientWidth / 2, cy = document.documentElement.clientHeight / 2
    // subtract the nav's hide/show translateY so the target is always the
    // SHOWN slot position — the mark's visibility is synced via .brand-hidden
    let navTy = 0
    const navBar = navSlot.closest('.nav, .pf-nav')
    if (navBar) {
      const t = getComputedStyle(navBar).transform
      if (t && t !== 'none') navTy = new DOMMatrixReadOnly(t).m42
    }
    navTarget.x = (r.left + r.width / 2) - cx
    navTarget.y = (r.top - navTy + r.height / 2) - cy
    const lw = persistLogo.offsetWidth || 280
    // land at the nav slot's rendered size so the mark sits flush with the wordmark
    const targetPx = r.height || 30
    navScale = targetPx / lw
  }
  function setLogo(drop, glide) {
    if (!persistLogo) return
    // while centered over the glass orb the mark must read much smaller
    // than its CSS box — size it from the core diameter (set in layoutDonut)
    const cssW = persistLogo.offsetWidth || 220
    const orbitPx = Number(persistLogo.dataset.orbitMarkPx) || Math.round(cssW * 0.42)
    const orbitScale = orbitPx / cssW
    const baseScale = orbitScale * (0.82 + 0.18 * drop)
    const scale = baseScale * (1 - glide) + navScale * glide
    const x = navTarget.x * glide
    const y = navTarget.y * glide
    persistLogo.style.opacity = String(Math.min(1, drop))
    persistLogo.style.transform =
      `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`
  }

  /* Reveal the shared React navbar only once the P begins traveling
     toward the brand slot — not during the centered orbit drop. */
  function setDockNavLock(on) {
    window.PF._forceNavVisible = !!on
    const nav = document.getElementById('nav')
    if (!nav) return
    if (on) {
      nav.classList.remove('is-hidden')
      nav.classList.add('nav-dock-lock')
    } else {
      nav.classList.remove('nav-dock-lock')
    }
  }
  function updateDockNavLock() {
    const g = window.PF._glideG || 0
    const gRaw = window.PF._glideRaw ?? 0
    // mapGlideProgress stays at 0 through the centered hold; g > 0 means
    // the mark has started moving toward the nav.
    setDockNavLock(g > 0.001 && gRaw < 0.99)
  }

  /* Map raw scroll progress → logo glide with a readable arc + settle dwell.
     First ~12%: stay centered. Next ~48%: ease into the nav. Last ~40%: hold docked. */
  function mapGlideProgress(p) {
    const holdStart = 0.12
    const settleAt = 0.60
    if (p <= holdStart) return 0
    if (p >= settleAt) return 1
    const t = (p - holdStart) / (settleAt - holdStart)
    // easeInOutCubic — slow start, clear travel, soft landing
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  let tickerFn = null
  function wireScroll() {
    computeNavTarget()
    on(window, 'resize', computeNavTarget, { passive: true })

    let spin = 0
    let spinDrift = 0
    let orbitProgress = 0

    function ringExpand(p) {
      // Wheel expands only after the star zoom phase
      return Math.min(1, Math.max(0, (p - 0.26) / 0.28))
    }
    function ringOpacity(p) {
      // Keep the 5-forge wheel hidden until the zoom-out has mostly played
      if (p <= 0.30 || p >= 0.94) return 0
      if (p < 0.46) return (p - 0.30) / 0.16
      if (p <= 0.74) return 1
      return 1 - (p - 0.74) / 0.20
    }
    // scroll turns the wheel; a slow drift keeps the moon/segments alive between scrolls
    function currentSpin() {
      return orbitProgress * Math.PI * 1.35 + spinDrift
    }

    mkTrigger({
      // Start early so the star zoom plays while leaving Backstory, before the wheel
      trigger: '#orbit',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: 0.5,
      onLeaveBack: () => {
        // scrolled back up out of the section — fully hide the wheel
        if (orbitLayer) orbitLayer.style.opacity = '0'
        clearCard()
        starZoom = 0
        starFieldOpacity = 0
        if (threeCanvas) threeCanvas.style.opacity = '0'
        stopThree()
        // re-cover the baked center flare while Backstory is on screen again
        if (stageFlareMask) stageFlareMask.style.opacity = '1'
        if (canvas) canvas.style.filter = ''
      },
      onLeave: () => {
        // scrolled past Five Ways — drop the fixed detail so it can't overlay portfolio
        clearCard()
      },
      onUpdate: (self) => {
        orbitProgress = self.progress
        window.PF._orbitProgress = orbitProgress
        spin = currentSpin()
        // Logo drop begins as the zoom settles / wheel approaches
        const drop = Math.min(1, Math.max(0, (orbitProgress - 0.18) / 0.28))
        window.PF._logoDrop = drop
        const ex = ringExpand(orbitProgress)
        const op = ringOpacity(orbitProgress)

        // Soften the baked flare without killing the glow — leave it readable
        if (stageFlareMask) {
          const lift = Math.min(1, orbitProgress / 0.22)
          stageFlareMask.style.opacity = (0.88 - lift * 0.72).toFixed(3)
        }
        // Mild canvas dim so the flare isn’t blinding, but still glows
        const entryDim = Math.min(1, orbitProgress / 0.18)
        const bright = Math.max(0.55, 1 - entryDim * 0.22 - drop * 0.2)
        canvas.style.filter = `brightness(${bright.toFixed(3)})`

        if (window.PF._gliding !== true) setLogo(drop, 0)
        orbitFade = 1
        if (orbitLayer) {
          // Layer visible for stars/backdrop once zoom starts; wheel opacity is separate
          orbitLayer.style.opacity = orbitProgress > 0.01 ? '1' : '0'
          const bd = orbitLayer.querySelector('.orbit-backdrop')
          const diag = orbitLayer.querySelector('.orbit-diagram')
          // Backdrop after zoom is underway
          const uiReveal = Math.min(1, Math.max(0, (orbitProgress - 0.22) / 0.28))
          if (bd) bd.style.opacity = String(uiReveal * 0.94)
          if (diag) diag.style.opacity = String(uiReveal * 0.28)
        }
        layoutOrbit(ex, spin, op)
        if (orbitHeading) {
          orbitHeading.style.opacity = String(Math.min(1, Math.max(0, (orbitProgress - 0.32) / 0.2)))
        }

        // ── Star zoom FIRST (progress 0 → ~0.28), then wheel fades in ──
        const zoomT = Math.min(1, orbitProgress / 0.28)
        starZoom = 1 - Math.pow(1 - zoomT, 3)
        // Visible glow during zoom; settle softer once the wheel arrives
        const zoomBoost = (1 - zoomT) * 0.55
        const holdStars = 0.28 + zoomBoost + (1 - Math.min(1, op)) * 0.2
        starFieldOpacity = Math.max(0.12, Math.min(0.85, holdStars))
        if (orbitProgress > 0.01) startThree()
        if (threeCanvas) threeCanvas.style.opacity = starFieldOpacity.toFixed(3)

        updateFeatured(orbitProgress, op)
        updateDockNavLock()
      },
    })

    if (!reduceMotion) {
      tickerFn = () => {
        // keep the ring + moon turning while the section is in view,
        // independent of the Three.js starfield render loop
        if (armNodes.length && orbitProgress > 0.32 && orbitProgress < 0.96) {
          spinDrift += 0.0012
          spin = currentSpin()
          const ex = ringExpand(orbitProgress)
          const op = ringOpacity(orbitProgress)
          if (ex > 0.02) layoutOrbit(ex, spin, op)
        }
      }
      gsap.ticker.add(tickerFn)
    }

    // Longer scroll window + laggy scrub so the dock reads clearly;
    // progress is remapped to hold → ease → settle in the nav.
    mkTrigger({
      trigger: '#portfolio',
      start: 'top 95%',
      end: 'top -40%',
      scrub: 1.85,
      onUpdate: (self) => {
        const gRaw = self.progress
        const g = mapGlideProgress(gRaw)
        if (orbitLayer) orbitLayer.style.opacity = String(Math.max(0, 1 - gRaw * 2.4))
        if (orbitHeading) orbitHeading.style.opacity = '0'
        // the portfolio renders transparent over the stage now — keep the
        // live starfield at full strength so it runs unbroken from the
        // backstory beat down through the notes section
        starFieldOpacity = 1
        threeCanvas.style.opacity = '1'
        if (!running) startThree()
        window.PF._gliding = gRaw > 0.001
        window.PF._glideG = g
        window.PF._glideRaw = gRaw
        // leaving the orbit for the dock — always drop the fixed arm card
        if (gRaw > 0.02 && armDetail?.classList.contains('show')) clearCard()
        // re-measure the slot mid-glide: its position can shift after load
        // (scrollbar, font swap, nav scrolled-state), and a stale target
        // lands the mark off-center next to the wordmark
        if (g > 0.001) computeNavTarget()
        setLogo(1, g)
        if (navSlot) navSlot.style.pointerEvents = g > 0.55 ? 'auto' : 'none'
        updateDockNavLock()
      },
    })

    // Value props → filter → final CTA stay over the live starfield.
    // Hold stars at full strength through #apply; ease out only at the
    // very end of the CTA so the footer can take over.
    mkTrigger({
      trigger: '#valueProps',
      endTrigger: '#apply',
      start: 'top 70%',
      end: 'bottom 20%',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress
        // no fade-in at the top edge — stars are already at full strength
        // coming out of the portfolio; only fade out late into the footer
        const fall = p > 0.92 ? (1 - p) / 0.08 : 1
        starFieldOpacity = Math.max(0.08, fall)
        threeCanvas.style.opacity = starFieldOpacity.toFixed(3)
        // baked footage stays dimmed for orbit legibility — ease it back up
        // so the galaxy reads behind these transparent sections
        const rise = Math.min(1, p / 0.15)
        canvas.style.filter = `brightness(${(0.45 + Math.min(rise, fall) * 0.35).toFixed(3)})`
        if (fall > 0.02) startThree()
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
      // lift the panel to <body>, but on cleanup RETURN it to its original
      // parent — removing it outright orphans the React-owned node, and the
      // next mount (StrictMode/HMR) finds no #armDetail, killing hover cards
      const armHome = armDetail.parentElement
      document.body.appendChild(armDetail)
      cleanups.push(() => { if (armDetail && armHome) armHome.appendChild(armDetail) })
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
    const usesSharedNav = !!(navEl && navEl.classList.contains('nav') && !navEl.classList.contains('pf-nav'))
    let lastNavY = window.scrollY
    const onWinScroll = () => {
      const y = window.scrollY
      if (cue) cue.style.opacity = y > 80 ? '0' : '1'
      if (!navEl || !persistLogo) return

      // Shared React Navbar owns hide/scrolled state — only sync the docked mark.
      if (usesSharedNav) {
        const docked = window.PF._glideG > 0.5
        const navHidden = navEl.classList.contains('is-hidden') && !window.PF._forceNavVisible
        persistLogo.classList.toggle('brand-hidden', docked && navHidden)
        // Keep the docked mark glued to the slot when nav padding/height changes
        // (is-scrolled) or when the bar reappears after being hidden.
        if (docked && window.PF._glideG != null) {
          computeNavTarget()
          setLogo(1, window.PF._glideG)
        }
        return
      }

      navEl.classList.toggle('scrolled', y > 40)
      // conditional visibility: hide scrolling down, show scrolling up,
      // always visible near the top
      const delta = y - lastNavY
      if (y < 120) navEl.classList.remove('nav-hidden')
      else if (delta > 6) navEl.classList.add('nav-hidden')
      else if (delta < -6) navEl.classList.remove('nav-hidden')
      if (Math.abs(delta) > 6) lastNavY = y
      // the docked brand mark is a separate fixed element — fade it in
      // sync with the nav (only once it has substantially glided in)
      const docked = window.PF._glideG > 0.5
      persistLogo.classList.toggle('brand-hidden', docked && navEl.classList.contains('nav-hidden'))
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

    // SOUND: ambient pad + UI ticks (toggle UI removed — muted by default)
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
        if (toggle) {
          toggle.classList.add('is-on')
          toggle.setAttribute('aria-pressed', 'true')
        }
        if (label) label.textContent = 'Sound on'
      } else {
        if (master && actx) master.gain.linearRampToValueAtTime(0, actx.currentTime + 0.4)
        if (toggle) {
          toggle.classList.remove('is-on')
          toggle.setAttribute('aria-pressed', 'false')
        }
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
    if (window.PF) {
      window.PF.onHeroProgress = null
      window.PF._gliding = false
      window.PF._forceNavVisible = false
      window.PF._logoDrop = 0
      window.PF._glideRaw = 0
    }
    const nav = document.getElementById('nav')
    if (nav) nav.classList.remove('nav-dock-lock')
  }
}
