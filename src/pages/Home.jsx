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

    /* ── OFFER STAIRCASE REVEAL + PROGRESS ────────────────────── */
    const offerSteps = document.querySelectorAll('.offer-step')
    const offerProgressNum = document.getElementById('offerProgressNum')
    const offerProgressFill = document.getElementById('offerProgressFill')

    /* Reveal each step as it enters the viewport */
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

    /* Update progress pill to show whichever step is most visible */
    function updateOfferProgress() {
      const vh = window.innerHeight
      let mostVisible = null, highestRatio = 0
      offerSteps.forEach(step => {
        const rect = step.getBoundingClientRect()
        const visibleTop = Math.max(0, rect.top)
        const visibleBottom = Math.min(vh, rect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const ratio = visibleHeight / Math.min(rect.height, vh)
        if (ratio > highestRatio) { highestRatio = ratio; mostVisible = step }
      })
      if (mostVisible && offerProgressNum && offerProgressFill) {
        const idx = parseInt(mostVisible.dataset.idx, 10) || 0
        offerProgressNum.textContent = String(idx + 1).padStart(2, '0')
        offerProgressFill.style.width = ((idx + 1) / offerSteps.length) * 100 + '%'
      }
    }
    let offerProgTicking = false
    window.addEventListener('scroll', () => {
      if (!offerProgTicking) { requestAnimationFrame(() => { updateOfferProgress(); offerProgTicking = false }); offerProgTicking = true }
    }, { passive: true })
    updateOfferProgress()

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

    /* ── MANIFESTO — CONVERGING CANVAS ──────────────────────── */
    ;(() => {
      const mCanvas  = document.getElementById('manifestoBg')
      const mScroll  = document.getElementById('manifestoScroll')
      const mHint    = document.getElementById('manifestoHint')
      const mSteps   = document.querySelectorAll('.manifesto-step')
      const mNumEl   = document.getElementById('manifestoCounterNum')
      const mFillEl  = document.getElementById('manifestoCounterFill')
      const ROMAN    = ['I','II','III','IV','V']
      if (!mCanvas || !mScroll) return

      const ctx = mCanvas.getContext('2d')
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const ACCENT = '#8B5CF6'
      const V_COLOR = '#6145A9'
      const SPD = 1, DENS = 90, INTEN = 0.9
      let W = 0, H = 0, mProg = 0, mCompletedCount = 0

      // ── helpers ──────────────────────────────────────────────
      function cHex(hex, a) {
        const h = hex.replace('#','')
        const n = parseInt(h, 16)
        return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`
      }
      function ss(e0, e1, x) {
        const t = Math.max(0, Math.min(1, (x-e0)/(e1-e0)))
        return t*t*(3-2*t)
      }
      function bezAt(p0, p1, p2, t) {
        const u = 1-t
        return { x: u*u*p0.x+2*u*t*p1.x+t*t*p2.x, y: u*u*p0.y+2*u*t*p1.y+t*t*p2.y }
      }
      function midCtrl(a, b, curl) {
        const mx=(a.x+b.x)/2, my=(a.y+b.y)/2
        const dx=b.x-a.x, dy=b.y-a.y
        const len=Math.sqrt(dx*dx+dy*dy)||1
        return { x: mx+(-dy/len)*len*curl, y: my+(dx/len)*len*curl }
      }
      function doughnut(cx, cy, midR, thick, peakA, col) {
        const c = col || ACCENT
        const inner=Math.max(0, midR-thick), outer=midR+thick
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,outer)
        g.addColorStop(0, cHex(c,0))
        g.addColorStop(Math.max(0.0001, inner/outer), cHex(c,0))
        g.addColorStop(midR/outer, cHex(c,peakA))
        g.addColorStop(1, cHex(c,0))
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(cx,cy,outer,0,6.283); ctx.fill()
      }

      // ── state ─────────────────────────────────────────────────
      let anchors, Vpt, lines, starsBack, starsFront, shockwaves

      function initState() {
        anchors = [
          {x:W*0.18, y:H*0.18}, {x:W*0.82, y:H*0.18},
          {x:W*0.18, y:H*0.82}, {x:W*0.82, y:H*0.82},
          {x:W*0.50, y:H*0.50},
        ]
        Vpt = anchors[4]
        const curls = [0.10,-0.10,-0.12,0.12]
        lines = curls.map((curl,i) => ({
          A: anchors[i], V: Vpt, baseCurl: curl,
          seed: i*1.7+Math.random()*6,
          pulses: [], lastPulseT: 0, completedAt: null,
        }))
        const Nb=Math.round(DENS*1.0), Nf=Math.round(DENS*0.45)
        starsBack  = Array.from({length:Nb},()=>({ x:Math.random()*W, y:Math.random()*H, z:0.15+Math.random()*0.5, vx:(Math.random()-.5)*0.03, vy:(Math.random()-.5)*0.02, phase:Math.random()*Math.PI*2 }))
        starsFront = Array.from({length:Nf},()=>({ x:Math.random()*W, y:Math.random()*H, z:0.5+Math.random()*0.5,  vx:(Math.random()-.5)*0.07, vy:(Math.random()-.5)*0.04, phase:Math.random()*Math.PI*2 }))
        shockwaves = []
        mCompletedCount = 0
      }

      function resizeCanvas() {
        W = window.innerWidth
        H = window.innerHeight
        mCanvas.width  = Math.floor(W*dpr)
        mCanvas.height = Math.floor(H*dpr)
        mCanvas.style.width  = W + 'px'
        mCanvas.style.height = H + 'px'
        ctx.setTransform(dpr,0,0,dpr,0,0)
        initState()
      }
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas, {passive:true})

      // ── draw ──────────────────────────────────────────────────
      function drawFrame(t) {
        ctx.clearRect(0,0,W,H)
        const a = INTEN

        // back stars
        for (const st of starsBack) {
          st.x+=st.vx*SPD; st.y+=st.vy*SPD
          if(st.x<-4)st.x=W+4; if(st.x>W+4)st.x=-4
          if(st.y<-4)st.y=H+4; if(st.y>H+4)st.y=-4
          ctx.fillStyle=cHex('#B7A7CE', 0.08*a*st.z*(0.5+0.5*Math.sin(t*0.0008+st.phase)))
          ctx.beginPath(); ctx.arc(st.x,st.y,st.z*0.95,0,6.283); ctx.fill()
        }
        // front stars
        for (const st of starsFront) {
          st.x+=st.vx*SPD; st.y+=st.vy*SPD
          if(st.x<-4)st.x=W+4; if(st.x>W+4)st.x=-4
          if(st.y<-4)st.y=H+4; if(st.y>H+4)st.y=-4
          ctx.fillStyle=cHex('#D7C8F2', 0.13*a*st.z*(0.55+0.45*Math.sin(t*0.0012+st.phase)))
          ctx.beginPath(); ctx.arc(st.x,st.y,st.z*1.35,0,6.283); ctx.fill()
        }
        // neighbor links
        const stride=Math.max(2,Math.round(starsFront.length/60))
        for(let i=0;i<starsFront.length;i+=stride){
          const A=starsFront[i]
          for(let k=1;k<4;k++){
            const B=starsFront[(i+k*11)%starsFront.length]
            const d2=(A.x-B.x)**2+(A.y-B.y)**2
            if(d2<11000){ ctx.strokeStyle=cHex(ACCENT,(1-d2/11000)*0.022*a); ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke() }
          }
        }

        // per-line progress
        const stepF = mProg*5
        const drawP = lines.map((_,i)=>ss(i+0.05, i+0.75, stepF))
        const vFill = (drawP[0]+drawP[1]+drawP[2]+drawP[3])/4
        const vStep5 = ss(4.0, 4.6, stepF)

        // shockwave triggers
        let nowDone=0
        drawP.forEach((dp,i)=>{
          if(dp>0.92){ nowDone++; if(!lines[i].completedAt) lines[i].completedAt=t }
          if(dp<0.5) lines[i].completedAt=null
        })
        if(nowDone>mCompletedCount){
          for(let k=0;k<nowDone-mCompletedCount;k++) shockwaves.push({t0:t+k*60})
        }
        mCompletedCount=nowDone

        // draw lines
        for(let i=0;i<4;i++){
          const L=lines[i], dp=drawP[i]
          const ctrl=midCtrl(L.A, L.V, L.baseCurl+Math.sin(t*0.0009+L.seed)*0.025)
          // ghost full path
          ctx.lineWidth=0.8; ctx.strokeStyle=cHex(ACCENT,0.018*a)
          ctx.beginPath(); ctx.moveTo(L.A.x,L.A.y); ctx.quadraticCurveTo(ctrl.x,ctrl.y,L.V.x,L.V.y); ctx.stroke()
          if(dp<=0) continue
          // drawn portion
          const segs=48, k=Math.max(2,Math.floor(segs*dp))
          ctx.lineWidth=1.2; ctx.strokeStyle=cHex(ACCENT,0.28*a)
          ctx.shadowColor=ACCENT; ctx.shadowBlur=5*a
          ctx.beginPath(); ctx.moveTo(L.A.x,L.A.y)
          for(let j=1;j<=k;j++){ const pt=bezAt(L.A,ctrl,L.V,(j/segs)*dp); ctx.lineTo(pt.x,pt.y) }
          ctx.stroke(); ctx.shadowBlur=0
          // drawing head
          if(dp<0.99){
            const hd=bezAt(L.A,ctrl,L.V,dp), rg=12*a
            const g=ctx.createRadialGradient(hd.x,hd.y,0,hd.x,hd.y,rg)
            g.addColorStop(0,cHex(ACCENT,0.38*a)); g.addColorStop(1,cHex(ACCENT,0))
            ctx.fillStyle=g; ctx.beginPath(); ctx.arc(hd.x,hd.y,rg,0,6.283); ctx.fill()
            ctx.fillStyle=cHex('#FFF',0.55*a); ctx.beginPath(); ctx.arc(hd.x,hd.y,1.8,0,6.283); ctx.fill()
          }
          // traveling pulses
          if(dp>0.95 && t-L.lastPulseT>2400/Math.max(0.3,SPD)){ L.pulses.push({u:0}); L.lastPulseT=t }
          for(let q=L.pulses.length-1;q>=0;q--){
            const pu=L.pulses[q]; pu.u+=0.006*SPD
            if(pu.u>=1){ L.pulses.splice(q,1); continue }
            const pt=bezAt(L.A,ctrl,L.V,pu.u)
            for(let tt=1;tt<=6;tt++){
              const u2=pu.u-tt*0.012; if(u2<=0) break
              const pt2=bezAt(L.A,ctrl,L.V,u2)
              ctx.fillStyle=cHex(ACCENT,(1-tt/6)*0.14*a)
              ctx.beginPath(); ctx.arc(pt2.x,pt2.y,1.4-tt*0.16,0,6.283); ctx.fill()
            }
            const rg=7*a, g=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,rg)
            g.addColorStop(0,cHex(ACCENT,0.38*a)); g.addColorStop(1,cHex(ACCENT,0))
            ctx.fillStyle=g; ctx.beginPath(); ctx.arc(pt.x,pt.y,rg,0,6.283); ctx.fill()
            ctx.fillStyle=cHex('#FFF',0.5*a); ctx.beginPath(); ctx.arc(pt.x,pt.y,1.2,0,6.283); ctx.fill()
          }
        }

        // shockwaves — purple, dim
        for(let i=shockwaves.length-1;i>=0;i--){
          const sw=shockwaves[i], age=(t-sw.t0)/1000
          if(age<0) continue
          if(age>2.4){ shockwaves.splice(i,1); continue }
          ctx.strokeStyle=cHex(V_COLOR,(1-age/2.4)*0.14*a)
          ctx.lineWidth=1*(1-age/2.4)+0.3
          ctx.beginPath(); ctx.arc(Vpt.x,Vpt.y,30+age*240,0,6.283); ctx.stroke()
        }
        if(vStep5>0.4){
          const phase=((t/1000)%3.8)/3.8
          ctx.strokeStyle=cHex(V_COLOR,(1-phase)*0.07*a*vStep5)
          ctx.lineWidth=0.8
          ctx.beginPath(); ctx.arc(Vpt.x,Vpt.y,60+phase*320,0,6.283); ctx.stroke()
        }

        // outer anchors — slightly bigger
        const sc=Math.max(0.6,Math.min(1.1,Math.min(W,H)/820))
        for(let i=0;i<4;i++){
          const an=anchors[i], lit=stepF>=i?1:ss(i-0.4,i+0.1,stepF)*0.7
          const breath=0.92+0.08*Math.sin(t*0.002+i*1.3), R=50*(0.55+lit*1.0)*breath*sc
          const gr=ctx.createRadialGradient(an.x,an.y,0,an.x,an.y,R)
          gr.addColorStop(0,cHex(ACCENT,0.28*lit*a)); gr.addColorStop(1,cHex(ACCENT,0))
          ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(an.x,an.y,R,0,6.283); ctx.fill()
          ctx.fillStyle=cHex(ACCENT,(0.55*lit+0.12)*a)
          ctx.beginPath(); ctx.arc(an.x,an.y,(3+lit*1.8)*sc,0,6.283); ctx.fill()
        }

        // V bloom — brand purple (#6145A9), bigger + stronger glow at step 5
        const vBreath=0.92+0.08*Math.sin(t*0.0028), vsc=Math.max(0.6,Math.min(1.1,Math.min(W,H)/820))
        const fill=Math.max(vFill,0.12), bloom=vStep5
        doughnut(Vpt.x,Vpt.y,(180+bloom*80)*vBreath*vsc,(75+bloom*35)*vsc,(0.11+bloom*0.22)*a*(0.4+fill*0.6), V_COLOR)
        doughnut(Vpt.x,Vpt.y,75*vBreath*vsc,28*vsc,(0.16+bloom*0.20)*a*(0.4+fill*0.6), V_COLOR)
        ctx.fillStyle=cHex(V_COLOR,(0.55+bloom*0.25)*a)
        ctx.beginPath(); ctx.arc(Vpt.x,Vpt.y,3.5+fill*1.4+bloom*2,0,6.283); ctx.fill()
        // step-5 rays — longer and more visible
        if(bloom>0.08){
          for(let r=0;r<12;r++){
            const ang=(r/12)*Math.PI*2, osc=0.5+0.5*Math.sin(t*0.0018+r*0.7)
            const len=(200+osc*80)*bloom*vBreath*vsc, inn=(28+osc*8)*vsc
            const x1=Vpt.x+Math.cos(ang)*inn, y1=Vpt.y+Math.sin(ang)*inn
            const x2=Vpt.x+Math.cos(ang)*(inn+len), y2=Vpt.y+Math.sin(ang)*(inn+len)
            const g=ctx.createLinearGradient(x1,y1,x2,y2)
            g.addColorStop(0,cHex(V_COLOR,0.24*a*bloom)); g.addColorStop(1,cHex(V_COLOR,0))
            ctx.strokeStyle=g; ctx.lineWidth=1
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
          }
        }

        requestAnimationFrame(drawFrame)
      }
      requestAnimationFrame(drawFrame)

      // ── scroll → steps ────────────────────────────────────────
      function updateMScroll() {
        const rect  = mScroll.getBoundingClientRect()
        const total = mScroll.offsetHeight - window.innerHeight
        if(total<=0) return
        mProg = Math.max(0, Math.min(1, -rect.top/total))
        const idx = Math.min(4, Math.floor(mProg*5+0.0001))
        if(mNumEl)  mNumEl.textContent  = ROMAN[idx]
        if(mFillEl) mFillEl.style.width = `${(idx/4)*100}%`
        if(mHint)   mHint.style.opacity = mProg>0.02 ? '0' : '1'
        mSteps.forEach((el,i)=>{
          el.classList.remove('is-active','is-before','is-after')
          if(i===idx)       el.classList.add('is-active')
          else if(i<idx)    el.classList.add('is-before')
          else              el.classList.add('is-after')
        })
      }
      let mTick=false
      window.addEventListener('scroll',()=>{ if(!mTick){ requestAnimationFrame(()=>{ updateMScroll(); mTick=false }); mTick=true } },{passive:true})
      window.addEventListener('resize', updateMScroll, {passive:true})
      updateMScroll()
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

      {/* OFFER — STAIRCASE SCROLL REVEAL */}
      <section className="offer" id="offer">
        <div className="offer-header">
          <div className="offer-header-left">
            <div className="offer-eyebrow">What you get</div>
            <h2 className="offer-title">Six things.<br /><em>Nothing extra. Nothing missing.</em></h2>
          </div>
          <div className="offer-progress">
            <span><span className="offer-progress-num" id="offerProgressNum">01</span> / 06</span>
            <div className="offer-progress-bar"><div className="offer-progress-fill" id="offerProgressFill"></div></div>
          </div>
        </div>

        <div className="offer-stairs" id="offerStairs">

          <div className="offer-step" data-idx="0">
            <div className="offer-card">
              <div className="offer-card-num">01</div>
              <div className="offer-card-top">
                <span className="offer-card-label">The runway</span>
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>
                  </svg>
                </span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">Your <em>stake.</em></div>
                <p className="offer-card-proof">Monthly capital so you can leave the job, tell the family, and stop apologizing for the work.</p>
              </div>
              <div className="offer-card-step-of">Step 01 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="1">
            <div className="offer-card">
              <div className="offer-card-num">02</div>
              <div className="offer-card-top">
                <span className="offer-card-label">The people</span>
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="9" cy="8" r="4"/><circle cx="17" cy="10" r="3"/>
                    <path d="M3 20v-1.5a4 4 0 014-4h4a4 4 0 014 4V20M22 20v-1a3 3 0 00-2-2.83"/>
                  </svg>
                </span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">Your <em>team.</em></div>
                <p className="offer-card-proof">Designers, engineers, growth operators. From day one. No hiring, no founder loneliness.</p>
              </div>
              <div className="offer-card-step-of">Step 02 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="2">
            <div className="offer-card">
              <div className="offer-card-num">03</div>
              <div className="offer-card-top">
                <span className="offer-card-label">The fuel</span>
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="6" width="20" height="13" rx="2"/>
                    <path d="M2 11h20M6 15h2M11 15h3"/>
                  </svg>
                </span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>capital.</em></div>
                <p className="offer-card-proof">Pre-seed in. Follow-on capital ready when you hit the next inflection.</p>
              </div>
              <div className="offer-card-step-of">Step 03 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="3">
            <div className="offer-card">
              <div className="offer-card-num">04</div>
              <div className="offer-card-top">
                <span className="offer-card-label">The room</span>
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
                    <circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/>
                    <path d="M6 7l4 3M18 7l-4 3M6 17l4-3M18 17l-4-3"/>
                  </svg>
                </span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>network.</em></div>
                <p className="offer-card-proof">400+ advisors, operators, allies. The room you were never invited into.</p>
              </div>
              <div className="offer-card-step-of">Step 04 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="4">
            <div className="offer-card">
              <div className="offer-card-num">05</div>
              <div className="offer-card-top">
                <span className="offer-card-label">The shortcuts</span>
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 4h13a3 3 0 013 3v13M4 4v16h16M4 4l8 8 4-4 4 4"/>
                  </svg>
                </span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>playbook.</em></div>
                <p className="offer-card-proof">Nine years of frameworks, mistakes, shortcuts. So you stop repeating ours.</p>
              </div>
              <div className="offer-card-step-of">Step 05 / 06</div>
            </div>
          </div>

          <div className="offer-step" data-idx="5">
            <div className="offer-card">
              <div className="offer-card-num">06</div>
              <div className="offer-card-top">
                <span className="offer-card-label">The ownership</span>
                <span className="offer-card-icon-wrap">
                  <svg className="offer-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 12l9-9 9 9M5 10v10h14V10M9 20v-6h6v6"/>
                  </svg>
                </span>
              </div>
              <div className="offer-card-bottom">
                <div className="offer-card-name">The <em>company.</em></div>
                <p className="offer-card-proof">Yours. We back the bet. You make the call. The work is yours to own.</p>
              </div>
              <div className="offer-card-step-of">Step 06 / 06</div>
            </div>
          </div>

        </div>
      </section>

      {/* MANIFESTO — CONVERGING DOTS NARRATIVE */}
      <section className="manifesto" id="manifesto">
        <div className="manifesto-scroll" id="manifestoScroll">
          <div className="manifesto-stage" id="manifestoStage">
            <div className="manifesto-grid-bg"></div>
            <canvas className="manifesto-canvas" id="manifestoBg"></canvas>
            <div className="manifesto-vignette"></div>
            <div className="manifesto-inner">
              <div className="manifesto-top">
                <div className="manifesto-label">
                  <span className="manifesto-label-dash"></span>
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
                <div className="manifesto-headlines">
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
                Scroll
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
            <span className="final-cta-cohort-sep">/</span>
            <span>12 Seats</span>
          </div>

          {/* eyebrow */}
          <p className="final-cta-eyebrow">You've made this bet a thousand times in your head.</p>

          {/* hero headline */}
          <h2 className="final-cta-hero" id="finalHeadline">
            <span className="final-cta-hero-line1">Once on paper</span>
            <span className="final-cta-hero-line2">changes everything.</span>
          </h2>

          {/* hairline drop */}
          <div className="final-cta-drop" aria-hidden="true"></div>

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
