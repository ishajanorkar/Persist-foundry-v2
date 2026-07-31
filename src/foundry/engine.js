/* ============================================================
   PERSIST FOUNDRY — landing engine
   Faithful 1:1 port of the static design's three scripts
   (scrubber.js + finale.js + main.js) into a single init that
   returns a cleanup fn so it can mount/unmount inside React.
   ============================================================ */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Lazy-loaded — keeps Three.js (~160KB+) out of the initial mobile parse. */
let THREE = null;

export default function initFoundry({ base = "/foundry" } = {}) {
  /* ---- app config: frame anchors + the five Persist arms ---- */
  const PF_CONFIG = {
    frames: {
      path: base + "/frames/frame_",
      ext: ".webp",
      count: 289,
      pad: 4,
      anchors: { hero: 10, tether: 100, what: 160, threshold: 285 },
    },
    // order matters — clockwise from top-right (seam at top, Co-Founder at bottom)
    arms: [
      {
        id: "substudio",
        title: "Sub Studio Program",
        body: "Specialist studios under one roof. Deep craft on demand, so your team stays small and your edges stay sharp.",
        points: [
          "Specialist craft studios under one roof",
          "Deep expertise on demand without headcount",
          "Keep the core team small and sharp",
          "Plug-in talent for the hard edges",
        ],
      },
      {
        id: "accelerator",
        title: "Accelerator",
        body: "A focused program that turns founder potential into a funded company. A salary to kickstart the team, mentorship from a 400 person network, and a deadline that forges.",
        points: [
          "Custom prototype engineering with tailored solutions",
          "Validation & positioning audit with detailed insights",
          "First-customer playbooks with step-by-step guidance",
          "Access to foundational capital and strategic funding",
        ],
      },
      {
        id: "cofounder",
        title: "Co-Founder Bridge",
        body: "We match founders with the missing other half. The technical, the commercial, the one who stakes the next year beside you.",
        points: [
          "Matched with your complementary other half",
          "Technical and commercial pairing",
          "Shared stake for the next year together",
          "Chemistry screened by operators who have done it",
        ],
      },
      {
        id: "companies",
        title: "Studio for Companies",
        body: "Operating muscle for companies ready to scale. Builders, designers, recruiters, and internal tools, embedded until the venture stands on its own.",
        points: [
          "Embedded builders, designers, recruiters",
          "Internal tools shipped alongside the team",
          "Operating muscle until the venture stands alone",
          "Scale without bloating the permanent headcount",
        ],
      },
      {
        id: "founders",
        title: "Studio for Founders",
        body: "Zero to one for the founder with nothing but a bet. We provide the salary and the hands to build the first version with you, not for you.",
        points: [
          "Salary so you can leave the job and build",
          "Hands that build the first version with you",
          "Zero-to-one partnership, not consulting",
          "A bet on the founder, not just the idea",
        ],
      },
    ],
  };
  window.PF_CONFIG = PF_CONFIG;
  window.PF = window.PF || {};
  window.PF._glideG = 0;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const cleanups = [];
  const createdTriggers = [];
  let killed = false;

  // helper: tracked listener
  const on = (target, type, handler, opts) => {
    target.addEventListener(type, handler, opts);
    cleanups.push(() => target.removeEventListener(type, handler, opts));
  };
  const mkTrigger = (cfg) => {
    const t = ScrollTrigger.create(cfg);
    createdTriggers.push(t);
    return t;
  };

  /* ============================================================
     1) CANVAS FRAME-SEQUENCE SCRUBBER
     ============================================================ */
  const CFG = PF_CONFIG.frames;
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });

  const frames = new Array(CFG.count);
  const loaded = new Array(CFG.count).fill(false);
  // Phones / Save-Data: fewer pixels + sparse frame set (biggest load win)
  const isLitePerf =
    window.matchMedia("(max-width: 768px), (pointer: coarse)").matches ||
    !!navigator.connection?.saveData ||
    /2g/.test(navigator.connection?.effectiveType || "");
  let dpr = Math.min(window.devicePixelRatio || 1, isLitePerf ? 1.25 : 2);
  const FRAME_STEP = isLitePerf ? 4 : 1;

  function frameURL(i) {
    const n = String(i + 1).padStart(CFG.pad, "0");
    return CFG.path + n + CFG.ext;
  }
  function loadFrame(i) {
    return new Promise((res) => {
      if (loaded[i]) return res();
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        frames[i] = img;
        loaded[i] = true;
        res();
      };
      img.onerror = () => {
        loaded[i] = true;
        res();
      };
      img.src = frameURL(i);
    });
  }

  let cw = 0,
    ch = 0;

  /* ── Hero mouse parallax (Vital Ventures–style) ───────────────
     pointer → NDC (−1…1), lerp 0.05, UV warp:
       warpedUv = centered * (1.0 - r * 0.15) - uMouse * 0.03 + 0.5
     Canvas approximates that as overscan scale + opposite offset. */
  const MOUSE_LERP = 0.05;
  const MOUSE_UV_SHIFT = 0.03;
  const RADIAL_ZOOM = 0.15; // matches shader (1.0 - r * 0.15) overscan
  const mouseTarget = { x: 0, y: 0 };
  const mouseSmooth = { x: 0, y: 0 };
  let parallaxRaf = 0;

  function heroParallaxAmount() {
    // Full effect through hero; ease out before Funded-by / tether
    const p = window.PF.heroProgress || 0;
    if (p <= 0.18) return 1;
    if (p >= 0.36) return 0;
    return 1 - (p - 0.18) / 0.18;
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, isLitePerf ? 1.25 : 2);
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = cw + "px";
    canvas.style.height = ch + "px";
    drawFrame(currentFrame, true);
  }
  function drawCover(img) {
    if (!img) return;
    const iw = img.naturalWidth,
      ih = img.naturalHeight;
    const cWpx = canvas.width,
      cHpx = canvas.height;
    const cover = Math.max(cWpx / iw, cHpx / ih);
    // Overscan so radial zoom + mouse shift never flash edges
    const overscan = 1 / (1 - RADIAL_ZOOM * 0.707);
    const scale = cover * overscan;
    const w = iw * scale,
      h = ih * scale;

    const amt = reduceMotion ? 0 : heroParallaxAmount();
    const mx = mouseSmooth.x * amt;
    const my = mouseSmooth.y * amt;
    // Same as shader: warpedUv -= uMouse * 0.03  (screen UV → canvas px)
    const ox = -mx * MOUSE_UV_SHIFT * cWpx;
    const oy = -my * MOUSE_UV_SHIFT * cHpx;

    const x = (cWpx - w) / 2 + ox,
      y = (cHpx - h) / 2 + oy;
    ctx.fillStyle = "#050409";
    ctx.fillRect(0, 0, cWpx, cHpx);
    ctx.drawImage(img, x, y, w, h);
  }
  let currentFrame = -1;
  function drawFrame(i, force) {
    i = Math.max(0, Math.min(CFG.count - 1, Math.round(i)));
    if (i === currentFrame && !force) return;
    let j = i;
    if (!frames[j]) {
      let lo = j,
        hi = j;
      while (lo >= 0 || hi < CFG.count) {
        if (lo >= 0 && frames[lo]) {
          j = lo;
          break;
        }
        if (hi < CFG.count && frames[hi]) {
          j = hi;
          break;
        }
        lo--;
        hi++;
      }
    }
    if (frames[j]) {
      drawCover(frames[j]);
      currentFrame = i;
    }
  }

  function onHeroPointerMove(e) {
    // VitalV: x = clientX/w*2-1, y = -(clientY/h*2)+1
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function tickHeroParallax() {
    parallaxRaf = requestAnimationFrame(tickHeroParallax);
    if (killed || reduceMotion) return;

    mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * MOUSE_LERP;
    mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * MOUSE_LERP;

    const settling =
      Math.abs(mouseTarget.x - mouseSmooth.x) > 0.0004 ||
      Math.abs(mouseTarget.y - mouseSmooth.y) > 0.0004;
    if (!settling || currentFrame < 0) return;
    if (heroParallaxAmount() <= 0) return;
    drawFrame(currentFrame, true);
  }

  function initHeroParallax() {
    if (reduceMotion || !canvas) return;
    on(window, "pointermove", onHeroPointerMove, { passive: true });
    parallaxRaf = requestAnimationFrame(tickHeroParallax);
    cleanups.push(() => {
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
      parallaxRaf = 0;
    });
  }

  const A = CFG.anchors;
  const KEY = [
    [0.0, 6],
    [0.16, 20],
    [0.4, 96],
    [0.52, 110],
    [0.84, 276],
    [1.0, 288],
  ];
  const smooth = (t) => t * t * (3 - 2 * t);
  function progressToFrame(p) {
    p = Math.max(0, Math.min(1, p));
    for (let k = 0; k < KEY.length - 1; k++) {
      const [p0, f0] = KEY[k],
        [p1, f1] = KEY[k + 1];
      if (p >= p0 && p <= p1) {
        if (p1 === p0) return f1;
        const t = (p - p0) / (p1 - p0);
        const isHold = Math.abs(f1 - f0) <= 16;
        const e = isHold ? t : smooth(t);
        return f0 + (f1 - f0) * e;
      }
    }
    return KEY[KEY.length - 1][1];
  }

  const BEAT_BANDS = [
    [-0.1, -0.05, 0.16, 0.26],
    [0.34, 0.42, 0.52, 0.6],
    [0.8, 0.86, 1.0, 1.01],
  ];
  const beatInners = Array.from(document.querySelectorAll(".beat[data-beat]"))
    .filter((el) => +el.dataset.beat < 4)
    .map((el) => ({
      inner: el.querySelector(".beat__inner"),
      scrim: el.querySelector(".beat__scrim"),
    }));
  const stageFade = document.getElementById("stageFade");
  const stageFlareMask = document.getElementById("stageFlareMask");

  function bandOpacity(p, b) {
    const [a, c, d, e] = b;
    if (p <= a || p >= e) return 0;
    if (p < c) return (p - a) / (c - a);
    if (p <= d) return 1;
    return 1 - (p - d) / (e - d);
  }
  function updateBeats(p) {
    let stageO = 0;
    let thresholdO = 0;
    const isMobile = window.matchMedia("(max-width: 1024px)").matches;
    for (let i = 0; i < beatInners.length; i++) {
      const o = bandOpacity(p, BEAT_BANDS[i]);
      const { inner, scrim } = beatInners[i];
      if (inner) {
        inner.style.opacity = o.toFixed(3);
        inner.style.transform = `translateY(${(1 - o) * 26}px)`;
      }
      // Soft hero wash on mobile (match Funded-by depth); light on desktop
      const scrimMul = i === 2 ? 0 : i === 0 ? (isMobile ? 0.7 : 0.45) : 0.95;
      if (scrim) scrim.style.opacity = (o * scrimMul).toFixed(3);
      // Soft stage fade on hero / tether; none on backstory
      if (i === 0) stageO = Math.max(stageO, o * (isMobile ? 0.38 : 0.18));
      if (i === 1) stageO = Math.max(stageO, o * 0.92);
      // i === 2 (threshold/backstory): intentionally no stage fade
      if (i === 2) thresholdO = o;
    }
    if (stageFade) stageFade.style.opacity = stageO.toFixed(3);
    // Soft Backstory veil — track the beat like Tether's stageFade (no hard snap to black)
    if (stageFlareMask) {
      const orbitP = window.PF._orbitProgress || 0;
      if (orbitP >= 0.01) {
        /* orbit handler owns the mask */
      } else {
        const approach = Math.max(0, Math.min(1, (p - 0.68) / 0.16));
        const hold = Math.max(thresholdO, approach);
        // Mobile: fully veil the baked center star; desktop keeps a soft wash
        const maskStrength = isMobile ? 1 : 0.55;
        stageFlareMask.style.opacity = (hold * maskStrength).toFixed(3);
      }
    }
  }

  // Slide-in reveal for Tether heading + logos when the beat enters view
  // (band ~0.34–0.60; fire as the section fades in).
  const lockup = document.querySelector("#tether .lockup");
  let tetherRevealed = false;
  function maybeRevealTether(p) {
    if (tetherRevealed || !lockup) return;
    if (p >= 0.36) {
      tetherRevealed = true;
      lockup.classList.add("is-revealed");
    }
  }

  // Subtle rise-in for Backstory header + body when the beat enters view
  const thresholdCopy = document.querySelector("#threshold .threshold-copy");
  let thresholdCopyRevealed = false;
  function maybeRevealThresholdCopy(p) {
    if (thresholdCopyRevealed || !thresholdCopy) return;
    if (p >= 0.82) {
      thresholdCopyRevealed = true;
      thresholdCopy.classList.add("is-revealed");
    }
  }

  // count-up of the threshold stats (30+, $117M, 400+, 67B) as that beat
  // scrolls in. Each value is split into prefix / number / suffix so the
  // "$" and "+"/"M"/"B" are preserved while only the number animates.
  const statData = Array.from(
    document.querySelectorAll("#threshold .stat__num"),
  ).map((el) => {
    // Cache the original final value once; a re-init (StrictMode/HMR) must not
    // re-parse an already-zeroed element, which would make the target 0.
    if (!el.dataset.countFinal) el.dataset.countFinal = el.textContent.trim();
    const m = el.dataset.countFinal.match(/^(\D*)(\d[\d.]*)(\D*)$/);
    return {
      el,
      prefix: m ? m[1] : "",
      target: m ? parseFloat(m[2]) : 0,
      suffix: m ? m[3] : "",
    };
  });
  if (!reduceMotion)
    statData.forEach((s) => {
      s.el.textContent = s.prefix + "0" + s.suffix;
    });
  let thresholdCounted = false;
  let countRaf = null;
  function countUpThreshold() {
    if (thresholdCounted) return;
    thresholdCounted = true;
    const dur = 1700;
    const t0 = performance.now();
    function frame(now) {
      if (killed) return;
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      statData.forEach((s) => {
        s.el.textContent = s.prefix + Math.round(s.target * e) + s.suffix;
      });
      if (t < 1) countRaf = requestAnimationFrame(frame);
    }
    countRaf = requestAnimationFrame(frame);
  }
  cleanups.push(() => {
    if (countRaf) cancelAnimationFrame(countRaf);
  });
  function maybeCountThreshold(p) {
    if (!thresholdCounted && p >= 0.84) countUpThreshold();
  }

  window.PF.heroProgress = 0;
  function onScrub(p) {
    window.PF.heroProgress = p;
    drawFrame(progressToFrame(p));
    updateBeats(p);
    maybeRevealTether(p);
    maybeRevealThresholdCopy(p);
    maybeCountThreshold(p);
    if (window.PF.onHeroProgress) window.PF.onHeroProgress(p);
  }

  async function preload() {
    const loaderBar = document.getElementById("loaderBar");
    const loaderPct = document.getElementById("loaderPct");
    const loader = document.getElementById("loader");

    // Always front-load beat anchors so scrub never blanks early
    const priority = [A.hero, A.tether, A.what, A.threshold, CFG.count - 1];
    if (!isLitePerf) {
      for (let i = 0; i < 50; i++) priority.push(i);
    }
    const seen = new Set();
    const ordered = priority.filter((i) => !seen.has(i) && seen.add(i));

    if (isLitePerf) {
      // ~1/4 of frames (~3.5MB vs ~14MB) — nearest-neighbor fill on scrub
      for (let i = 0; i < CFG.count; i += FRAME_STEP) {
        if (!seen.has(i)) {
          ordered.push(i);
          seen.add(i);
        }
      }
    } else {
      for (let i = 0; i < CFG.count; i++) {
        if (!seen.has(i)) {
          ordered.push(i);
          seen.add(i);
        }
      }
    }

    let done = 0;
    const total = ordered.length;
    const updateLoader = () => {
      const pct = Math.round((done / Math.max(1, total)) * 100);
      if (loaderBar) loaderBar.style.width = pct + "%";
      if (loaderPct) loaderPct.textContent = String(pct).padStart(3, "0");
    };

    const REVEAL_AT = isLitePerf ? 5 : 18;
    let revealed = false;
    const revealIfReady = () => {
      if (revealed || done < REVEAL_AT) return;
      revealed = true;
      drawFrame(A.hero, true);
      if (loader) loader.classList.add("done");
      document.dispatchEvent(new Event("pf:ready"));
    };

    const CONC = isLitePerf ? 3 : 6;
    let idx = 0;
    async function worker() {
      while (idx < ordered.length && !killed) {
        const i = ordered[idx++];
        await loadFrame(i);
        done++;
        updateLoader();
        revealIfReady();
      }
    }
    await Promise.all(Array.from({ length: CONC }, worker));
    if (killed) return;
    updateLoader();
    revealIfReady();
    document.dispatchEvent(new Event("pf:framesComplete"));
  }

  function initScrubber() {
    resizeCanvas();
    on(window, "resize", resizeCanvas, { passive: true });
    initHeroParallax();

    if (reduceMotion) {
      drawFrame(A.hero, true);
      updateBeats(0);
      mkTrigger({
        trigger: "#hero",
        start: "top top",
        endTrigger: "#threshold",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          window.PF.heroProgress = p;
          drawFrame(progressToFrame(p));
          updateBeats(p);
          if (window.PF.onHeroProgress) window.PF.onHeroProgress(p);
        },
      });
      return;
    }

    mkTrigger({
      trigger: "#hero",
      start: "top top",
      endTrigger: "#threshold",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => onScrub(self.progress),
    });
    onScrub(0);
  }

  /* ============================================================
     2) FINALE — Three.js handoff + orbit
     ============================================================ */
  const threeCanvas = document.getElementById("three-canvas");
  const persistLogo = document.getElementById("persistLogo");
  const navSlot = document.getElementById("navBrandSlot");
  let armDetail = document.getElementById("armDetail");
  const armKicker = document.getElementById("armKicker");
  const armTitle = document.getElementById("armTitle");
  const armBody = document.getElementById("armBody");
  const armIcon = document.getElementById("armIcon");
  const armList = document.getElementById("armList");

  let renderer,
    scene,
    camera,
    stars,
    starSprite,
    raf = null,
    running = false;
  let parX = 0,
    parY = 0;
  /** 0 → far field; 1 → zoomed toward viewer (scroll-driven in the orbit section) */
  let starZoom = 0;
  let starFieldOpacity = 0;

  function makeStarTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.18, "rgba(244,240,255,0.95)");
    grd.addColorStop(0.4, "rgba(185,160,255,0.45)");
    grd.addColorStop(1, "rgba(120,84,213,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.Texture(c);
    t.needsUpdate = true;
    return t;
  }

  function initThree() {
    if (!THREE || !threeCanvas) return;
    renderer = new THREE.WebGLRenderer({
      canvas: threeCanvas,
      alpha: true,
      antialias: !isLitePerf,
      powerPreference: isLitePerf ? "low-power" : "default",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLitePerf ? 1.25 : 2));
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 14;

    const N = isLitePerf ? 140 : window.innerWidth < 768 ? 210 : 450;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // spherical-ish cloud so a camera/star zoom reads as flying through space
      const r = 4 + Math.random() * 36;
      const a = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.5) * Math.PI * 0.85;
      pos[i * 3] = Math.cos(a) * Math.cos(elev) * r;
      pos[i * 3 + 1] = Math.sin(elev) * r * 0.72;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(elev) * r - 8;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const starTex = makeStarTexture();
    const mat = new THREE.PointsMaterial({
      size: 0.42,
      map: starTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xe8e4f8,
      opacity: 0.95,
      sizeAttenuation: true,
    });
    stars = new THREE.Points(geo, mat);
    scene.add(stars);

    const sMat = new THREE.SpriteMaterial({
      map: starTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 1,
    });
    starSprite = new THREE.Sprite(sMat);
    starSprite.scale.set(4.2, 4.2, 1);
    starSprite.position.set(0, 0, 1.5);
    scene.add(starSprite);

    on(window, "resize", onResizeThree, { passive: true });
    if (!reduceMotion) on(window, "mousemove", onMouse, { passive: true });
  }
  function onResizeThree() {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  function onMouse(e) {
    parX = e.clientX / window.innerWidth - 0.5;
    parY = e.clientY / window.innerHeight - 0.5;
  }
  function render() {
    if (!running) return;
    const z = starZoom;
    // slow drift + scroll zoom: field expands toward the camera
    stars.rotation.z += 0.00045;
    stars.rotation.y += 0.00018;
    const fieldScale = 1 + z * 2.8;
    stars.scale.setScalar(fieldScale);
    stars.position.z = z * 14;
    if (stars.material) stars.material.opacity = 0.55 + (1 - z) * 0.4;

    // big center star grows / approaches as zoom rises — present but not blown out
    if (starSprite) {
      const s = 2.8 + z * 16;
      starSprite.scale.set(s, s, 1);
      starSprite.position.z = 1.5 + z * 5.5;
      starSprite.material.opacity = Math.max(
        0,
        (0.62 - z * 0.32) * starFieldOpacity,
      );
    }

    camera.position.z = 14 - z * 9.5;
    camera.position.x += (parX * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (-parY * 0.85 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    if (threeCanvas) threeCanvas.style.opacity = String(starFieldOpacity);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  }
  function startThree() {
    if (killed) return;
    if (!renderer) {
      // Fire-and-forget dynamic import — first orbit scroll pulls Three.js
      if (!THREE) {
        if (startThree._loading) return;
        startThree._loading = import("three")
          .then((mod) => {
            THREE = mod;
            startThree._loading = null;
            if (!killed) startThree();
          })
          .catch(() => {
            startThree._loading = null;
          });
        return;
      }
      initThree();
      if (!renderer) return;
    }
    if (!running) {
      running = true;
      onResizeThree();
      render();
    }
  }
  function stopThree() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  window.PF.onHeroProgress = function (p) {
    // Starfield + center flare sprite only belong to Five Ways (#orbit).
    // Keep them fully off through Backstory so that glow never shows early.
    const orbitP = window.PF._orbitProgress || 0;
    if (orbitP < 0.02) {
      starFieldOpacity = 0;
      if (threeCanvas) threeCanvas.style.opacity = "0";
      stopThree();
      return;
    }
  };

  /* ---- ORBIT: build the five arms as a segmented glass donut ---- */
  const armNodes = [];
  let orbitLayer = null;
  let orbitHeading = null;
  let orbitDonut = null;
  let orbitRing = null;
  let orbitMoon = null;
  let orbitSegLines = null;
  let orbitFade = 1;
  let injectedStyle = null;
  const ORBIT_GAP_DEG = 3.2; // gap between petals (matches Frame reference)

  // recompute donut geometry: clip each petal to an annular sector with rounded
  // corners, place its icon+label at the segment's mid-radius, size the core.
  function layoutDonut() {
    if (!orbitDonut) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const vmin = Math.min(vw, vh);
    // Desktop: scale from vmin. Tablet/phone: also respect height budget so
    // the ring clears the centered heading above + detail panel below.
    let D;
    if (vw <= 900) {
      // Mobile stack: left heading above, left detail below, wheel in the middle
      const headingBudget = vw <= 640 ? 150 : 140;
      const detailBudget = vw <= 640 ? 200 : 185;
      const availH = Math.max(200, vh - headingBudget - detailBudget - 16);
      const availW = vw * (vw <= 640 ? 0.92 : 0.72);
      const scale = vw <= 640 ? 0.58 : 0.44;
      D = Math.round(Math.min(vmin * scale, availH, availW));
      D = Math.max(vw <= 640 ? 220 : 200, Math.min(D, vw <= 640 ? 300 : 280));
    } else if (vw < 1100) {
      D = Math.round(vmin * 0.42);
    } else if (vw < 1280) {
      D = Math.round(vmin * 0.46);
    } else if (vw < 1440) {
      D = Math.round(vmin * 0.52);
    } else {
      D = Math.round(vmin * 0.56);
    }
    const Ro = D / 2;
    const Ri = Ro * 0.52;
    const cx = Ro,
      cy = Ro;
    const rc = Ri + (Ro - Ri) * 0.52;
    orbitDonut.style.width = orbitDonut.style.height = D + "px";
    if (orbitRing) {
      orbitRing.style.width = orbitRing.style.height = D + "px";
    }

    const n = armNodes.length;
    const seg = 360 / n;
    // -90 puts 0deg at the top; +seg/2 offset leaves a seam at top-center and
    // seats a full petal at the bottom (matches the reference layout)
    const rad = (deg) => ((deg - 90) * Math.PI) / 180;
    const P = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const f = (v) => v.toFixed(1);
    let linesHTML = "";

    armNodes.forEach(({ el }, i) => {
      const center = i * seg + seg / 2;
      const a0 = rad(center - seg / 2 + ORBIT_GAP_DEG / 2);
      const a1 = rad(center + seg / 2 - ORBIT_GAP_DEG / 2);
      // clip defines the single even segment shape (active fill bleeds to this edge)
      const RoC = Ro;
      const RiC = Ri;
      const crC = (RoC - RiC) * 0.2;
      const daOC = crC / RoC;
      const daIC = crC / RiC;
      const [oxS, oyS] = P(RoC, a0 + daOC);
      const [oxE, oyE] = P(RoC, a1 - daOC);
      const [ixE, iyE] = P(RiC, a1 - daIC);
      const [ixS, iyS] = P(RiC, a0 + daIC);
      const [rA1o_x, rA1o_y] = P(RoC - crC, a1);
      const [rA1i_x, rA1i_y] = P(RiC + crC, a1);
      const [rA0i_x, rA0i_y] = P(RiC + crC, a0);
      const [rA0o_x, rA0o_y] = P(RoC - crC, a0);
      const [coE_x, coE_y] = P(RoC, a1);
      const [ciE_x, ciE_y] = P(RiC, a1);
      const [ciS_x, ciS_y] = P(RiC, a0);
      const [coS_x, coS_y] = P(RoC, a0);
      const d =
        `M${f(oxS)} ${f(oyS)} ` +
        `A${f(RoC)} ${f(RoC)} 0 0 1 ${f(oxE)} ${f(oyE)} ` +
        `Q${f(coE_x)} ${f(coE_y)} ${f(rA1o_x)} ${f(rA1o_y)} ` +
        `L${f(rA1i_x)} ${f(rA1i_y)} ` +
        `Q${f(ciE_x)} ${f(ciE_y)} ${f(ixE)} ${f(iyE)} ` +
        `A${f(RiC)} ${f(RiC)} 0 0 0 ${f(ixS)} ${f(iyS)} ` +
        `Q${f(ciS_x)} ${f(ciS_y)} ${f(rA0i_x)} ${f(rA0i_y)} ` +
        `L${f(rA0o_x)} ${f(rA0o_y)} ` +
        `Q${f(coS_x)} ${f(coS_y)} ${f(oxS)} ${f(oyS)} Z`;
      el.style.clipPath = `path('${d}')`;
      el.style.webkitClipPath = `path('${d}')`;
      // Active fill is full-bleed inside the clip (no nested card). Only icons need mid-arc placement.
      const [px, py] = P(rc, rad(center));
      const content = el.querySelector(".orbit-petal__content");
      if (content) {
        content.style.left = px + "px";
        content.style.top = py + "px";
      }

      // hairline rim on top of the clipped glass (Frame-accurate)
      linesHTML += `<path class="orbit-seg-rim" d="${d}" />`;
    });
    if (orbitSegLines) {
      orbitSegLines.setAttribute("viewBox", `0 0 ${D} ${D}`);
      orbitSegLines.setAttribute("width", String(D));
      orbitSegLines.setAttribute("height", String(D));
      orbitSegLines.innerHTML = linesHTML;
    }

    const core = orbitDonut.querySelector(".orbit-core");
    if (core) {
      const c = Math.round(Ri * 2 * 0.78);
      core.style.width = core.style.height = c + "px";
    }

    // SVG art only fills ~42% of the 2000² box — target visual P ≈ 22% of core
    if (persistLogo && core) {
      const corePx = parseFloat(core.style.width) || Ri * 2 * 0.78;
      const markPx = Math.max(40, Math.round(corePx * 0.52));
      persistLogo.dataset.orbitMarkPx = String(markPx);
      // Re-anchor the mark to the (possibly reflowed) orb center
      const drop = window.PF?._logoDrop ?? 0;
      const glide = window.PF?._glideG ?? 0;
      if (drop > 0.01) setLogo(drop, glide);
    }
  }

  function buildOrbit() {
    // drop any leftover injected styles / layers from a prior HMR pass
    document
      .querySelectorAll("style[data-orbit-styles]")
      .forEach((n) => n.remove());
    document.querySelectorAll("#orbitLayer").forEach((n) => n.remove());

    const wrap = document.createElement("div");
    wrap.id = "orbitLayer";
    // start hidden — the layer is only revealed inside the #orbit section
    // (opacity is driven by the scroll trigger), so it never bleeds over the hero
    wrap.style.cssText =
      "position:fixed;inset:0;z-index:7;pointer-events:none;will-change:opacity;opacity:0;";
    document.body.appendChild(wrap);
    orbitLayer = wrap;

    // charcoal technical backdrop (grid) — stars show through via partial alpha
    const backdrop = document.createElement("div");
    backdrop.className = "orbit-backdrop";
    wrap.appendChild(backdrop);

    // Group_1 blueprint — two offset circles, axes, square nodes, corner circles
    const diagram = document.createElement("img");
    diagram.className = "orbit-diagram";
    diagram.src = "/foundry/orbit-diagram.png";
    diagram.alt = "";
    diagram.setAttribute("aria-hidden", "true");
    diagram.draggable = false;
    wrap.appendChild(diagram);

    const heading = document.createElement("div");
    heading.className = "orbit-heading";
    heading.innerHTML =
      '<span class="orbit-heading__title">Five Ways We Forge</span>' +
      '<p class="orbit-heading__body">Whether you bring an idea, half a team, or a company already moving, there is a door built for where you stand.</p>';
    wrap.appendChild(heading);
    orbitHeading = heading;

    const oldEyebrow = document.getElementById("orbitEyebrow");
    if (oldEyebrow && oldEyebrow.parentElement)
      oldEyebrow.parentElement.style.display = "none";

    const donut = document.createElement("div");
    donut.className = "orbit-donut";
    donut.id = "orbitDonut";
    wrap.appendChild(donut);
    orbitDonut = donut;

    // eclipse moon: exact asset from design — full silver disc + amber corona
    // rotates as one rigid bitmap so colors/shade never remesh while spinning
    const core = document.createElement("div");
    core.className = "orbit-core";
    core.innerHTML =
      '<span class="orbit-core__moon" aria-hidden="true">' +
      '<img class="orbit-core__eclipse" src="/foundry/orbit-eclipse.png" alt="" draggable="false" />' +
      "</span>";
    donut.appendChild(core);
    orbitMoon = core.querySelector(".orbit-core__moon");

    // spinning ring holds petals + segment strokes so the glass moon can
    // share the same rotation while the core body and P mark stay put
    const ring = document.createElement("div");
    ring.className = "orbit-ring";
    donut.appendChild(ring);
    orbitRing = ring;

    // segment border-lines drawn on top of the frosted petals
    const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lines.setAttribute("class", "orbit-seg-lines");
    ring.appendChild(lines);
    orbitSegLines = lines;

    // line icons drawn to match the reference wheel (thin, rounded strokes)
    const ICONS = {
      // Saturn / planet — Studio for Founders
      founders:
        '<circle cx="12" cy="12" r="5.4"/><ellipse cx="12" cy="12" rx="10.2" ry="3.7" transform="rotate(-22 12 12)"/>',
      // stacked layers — Sub Studio Program
      substudio:
        '<path d="M12 3.2 3 8l9 4.8L21 8 12 3.2Z"/><path d="M3 12l9 4.8L21 12"/><path d="M3 15.9l9 4.8 9-4.8"/>',
      // upward rocket — Accelerator
      accelerator:
        '<path d="M7 11.2947C12.284 1.44656 18.8635 1.333 21.4928 2.50724C22.667 5.1365 22.5534 11.716 12.7053 17C12.6031 16.4129 12.0352 14.8749 10.5801 13.4199C9.12512 11.9648 7.58712 11.3969 7 11.2947Z" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 16.8C16.0428 17.7334 16.2609 19.4069 16.5439 21C16.5439 21 20.8223 18.0481 18.0856 14" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.19998 10C6.26664 7.95722 4.59305 7.73912 3 7.45614C3 7.45614 5.95194 3.17766 10 5.91444" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.20864 14C5.57675 14.6319 4.50253 16.4644 5.2608 18.7392C7.53562 19.4975 9.36811 18.4233 9.99998 17.7914" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.0953 7.75298C18.0953 6.73278 17.2683 5.90576 16.2481 5.90576C15.2279 5.90576 14.4009 6.73278 14.4009 7.75298C14.4009 8.77317 15.2279 9.6002 16.2481 9.6002C17.2683 9.6002 18.0953 8.77317 18.0953 7.75298Z" stroke="white" stroke-width="1.3"/>',

      // suspension bridge — Co-Founder Bridge
      cofounder:
        '<path d="M3 19h18"/><path d="M5 19V8M19 19V8"/><path d="M5 8c4 4.4 10 4.4 14 0"/><path d="M9 19v-4.6M12 19v-6M15 19v-4.6"/>',
      // buildings — Studio for Companies
      companies:
        '<path d="M3 20.5h18"/><path d="M5.5 20.5V8l5-2.6v15.1"/><path d="M10.5 20.5V11l7.9 2.5v7"/><path d="M8 9.2v0M8 12.1v0M14 15v0M14 17.6v0"/>',
    };

    PF_CONFIG.arms.forEach((arm) => {
      const petal = document.createElement("button");
      petal.className = "orbit-petal";
      petal.dataset.id = arm.id;
      const iconSvg = ICONS[arm.id] || "";
      petal.innerHTML =
        '<span class="orbit-petal__content">' +
        `<span class="orbit-petal__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg></span>` +
        `<span class="orbit-petal__label">${arm.title}</span>` +
        "</span>";
      ring.appendChild(petal);
      armNodes.push({ el: petal, arm, iconSvg });

      petal.addEventListener("mouseenter", () => {
        if (window.matchMedia("(max-width: 900px)").matches) return;
        if (!orbitHoverLive) return;
        clearTimeout(hideArmTO);
        showArm(arm, petal);
      });
      petal.addEventListener("mouseleave", () => {
        if (window.matchMedia("(max-width: 900px)").matches) return;
        // Brief delay so moving between adjacent segments doesn't flash the panel off
        clearTimeout(hideArmTO);
        hideArmTO = setTimeout(() => {
          if (!orbitHoverLive) {
            hideArm();
            return;
          }
          const overPetal = armNodes.some((x) => x.el.matches(":hover"));
          if (!overPetal) hideArm();
        }, 120);
      });
      petal.addEventListener("focus", () => {
        if (window.matchMedia("(max-width: 900px)").matches) return;
        if (!orbitHoverLive) return;
        clearTimeout(hideArmTO);
        showArm(arm, petal);
      });
      petal.addEventListener("blur", () => {
        if (window.matchMedia("(max-width: 900px)").matches) return;
        clearTimeout(hideArmTO);
        hideArmTO = setTimeout(() => hideArm(), 120);
      });
      // Mobile: tap to select and keep the detail panel open
      petal.addEventListener("click", (e) => {
        if (!window.matchMedia("(max-width: 900px)").matches) return;
        if (!orbitHoverLive) return;
        e.preventDefault();
        showArm(arm, petal);
      });
    });

    const st = document.createElement("style");
    st.setAttribute("data-orbit-styles", "1");
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
      /* Desktop/laptop: top-left copy; phones center via media query */
      .orbit-heading{position:absolute;top:clamp(10vh,13vh,16vh);
        left:clamp(1.4rem,var(--gutter,2.5rem),5.5rem);transform:none;
        z-index:4;max-width:min(22rem,34vw);opacity:0;will-change:opacity;
        display:flex;flex-direction:column;align-items:flex-start;gap:0.85rem;
        pointer-events:none;text-align:left;}
      .orbit-heading__title{font-family:'Montserrat',var(--pf-display),system-ui,sans-serif;
        font-weight:600;font-style:normal;
        font-size:clamp(1.2rem,2.1vw,1.85rem);line-height:1.2;letter-spacing:-0.04em;
        color:#ffffff;text-shadow:0 2px 22px rgba(0,0,0,0.85);text-align:left;}
      .orbit-heading__body{margin:0;font-family:'Montserrat',var(--pf-display),system-ui,sans-serif;
        font-weight:400;font-style:normal;
        font-size:clamp(0.8rem,0.95vw,0.95rem);line-height:1.4;letter-spacing:-0.03em;
        color:rgba(168,172,184,0.72);max-width:34ch;
        text-shadow:0 1px 14px rgba(0,0,0,0.75);text-align:left;}
      /* wheel dead-center — primary focal point of the section */
      .orbit-donut{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        transform-origin:center;will-change:transform,opacity;pointer-events:none;z-index:2;}
      .orbit-ring{position:absolute;inset:0;transform-origin:center;
        will-change:transform;pointer-events:none;}
      .orbit-core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        border-radius:50%;pointer-events:none;z-index:3;overflow:visible;
        background:#c3c3c3;
        transition:opacity 0.35s ease, visibility 0.35s ease;
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
        /* off by default — JS enables only while the Five Ways wheel is live
           (children with pe:auto ignore a parent's pe:none, so this must start none) */
        pointer-events:none;isolation:isolate;
        /* frosted charcoal glass — matched to navbar pill */
        background:linear-gradient(165deg,
          rgba(58,56,66,0.52) 0%,
          rgba(30,28,38,0.7) 48%,
          rgba(16,14,22,0.8) 100%);
        -webkit-backdrop-filter:blur(28px) saturate(1.5);
        backdrop-filter:blur(28px) saturate(1.5);
        box-shadow:
          inset 0.5px 1px 0 rgba(255,255,255,0.32),
          inset 1px 0.5px 0 rgba(255,255,255,0.12),
          inset 0 -1px 0 rgba(0,0,0,0.4),
          inset -1px 0 0 rgba(0,0,0,0.18);
        /* active purple — muted lilac rim, no pure-white hotspot (OLED-safe) */
        --orbit-active-fill:radial-gradient(circle at 50% 50%,
          rgb(20,16,34) 0%,
          rgb(32,24,52) 28%,
          rgb(58,42,98) 46%,
          rgb(88,66,138) 56%,
          rgb(112,90,158) 64%,
          rgb(138,118,178) 72%,
          rgba(168,150,198,0.88) 82%,
          rgba(190,176,210,0.55) 92%);}
      .orbit-petal::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
        background:var(--orbit-active-fill);opacity:0;
        transition:opacity .35s var(--ease-out);}
      .orbit-petal:hover::before,.orbit-petal.is-featured::before{opacity:0.92;}
      /* soft static glass edge wash clipped with the petal */
      .orbit-petal::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
        background:linear-gradient(145deg,
          rgba(255,255,255,0.12) 0%,
          rgba(255,255,255,0.03) 35%,
          rgba(255,255,255,0) 60%,
          rgba(255,255,255,0.04) 100%);
        opacity:0.7;mix-blend-mode:soft-light;}
      /* glow on the rim SVG only — never filter the petal (unclips a rectangle) */
      .orbit-seg-lines{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:visible;
        fill:none;}
      .orbit-seg-rim{fill:none;
        stroke:rgba(255,255,255,0.28);
        stroke-width:1.2;
        stroke-linecap:round;stroke-linejoin:round;
        transition:stroke .35s var(--ease-out),filter .35s var(--ease-out),stroke-width .35s var(--ease-out);}
      .orbit-seg-rim.is-lit{stroke:rgba(220,210,240,0.75);stroke-width:1.3;
        filter:drop-shadow(0 0 4px rgba(160,130,210,0.35)) drop-shadow(0 0 10px rgba(120,90,180,0.28));}
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
      @media (max-width:1100px) and (min-width:901px){
        .orbit-heading{max-width:min(18rem,30vw);gap:0.65rem;}
        .orbit-heading__title{font-size:clamp(0.95rem,1.6vw,1.2rem);}
        .orbit-heading__body{font-size:clamp(0.72rem,0.9vw,0.82rem);max-width:30ch;}
        .orbit-petal__icon{width:22px;height:22px;}
        .orbit-petal__label{
          font-size:clamp(0.55rem,0.95vw,0.7rem);
          max-width:9ch;line-height:1.15;
        }
        .orbit-petal__content{gap:8px;}
      }
      @media (max-width:900px){
        .orbit-heading{
          left:var(--gutter,20px);right:var(--gutter,20px);transform:none;
          max-width:none;width:auto;top:clamp(4.75rem,9vh,5.75rem);
          align-items:flex-start;text-align:left;gap:0.65rem;
        }
        .orbit-heading__title{
          font-size:clamp(1.35rem,6.2vw,1.75rem);
          text-align:left;line-height:1.15;
        }
        .orbit-heading__body{
          max-width:none;width:100%;font-size:clamp(0.82rem,3.4vw,0.95rem);
          line-height:1.45;text-align:left;color:rgba(168,172,184,0.78);
        }
        /* Mid stack between heading + detail */
        .orbit-donut{top:48%;}
        .orbit-petal__icon{width:20px;height:20px;}
        .orbit-petal__label{
          font-size:clamp(0.52rem,2.4vw,0.64rem);
          line-height:1.15;max-width:10ch;letter-spacing:-0.03em;
        }
        .orbit-petal__content{gap:7px;}
        .orbit-petal{
          --orbit-active-fill:radial-gradient(circle at 50% 50%,
            rgb(28,18,58) 0%,
            rgb(58,36,110) 32%,
            rgb(98,68,170) 52%,
            rgb(128,92,200) 66%,
            rgb(158,122,220) 78%,
            rgba(186,154,235,0.92) 90%);
        }
        .orbit-petal.is-featured{
          box-shadow:
            inset 0.5px 1px 0 rgba(255,255,255,0.28),
            0 0 28px rgba(120,84,213,0.45),
            0 0 56px rgba(88,66,180,0.28);
        }
      }
      @media (max-width:900px) and (max-height:820px){
        .orbit-heading{top:clamp(4.35rem,8vh,5.35rem);gap:0.45rem;}
        .orbit-heading__body{display:block;-webkit-line-clamp:unset;overflow:visible;}
        .orbit-donut{top:47%;}
      }
      @media (max-width:640px){
        .orbit-heading{
          left:var(--gutter,20px);right:var(--gutter,20px);transform:none;
          top:clamp(4.5rem,8.5vh,5.5rem);
          gap:0.55rem;max-width:none;width:auto;
          align-items:flex-start;text-align:left;
        }
        .orbit-heading__title,.orbit-heading__body{text-align:left;}
        .orbit-heading__title{font-size:clamp(1.4rem,6.8vw,1.7rem);}
        .orbit-heading__body{max-width:none;font-size:clamp(0.84rem,3.6vw,0.95rem);line-height:1.45;}
        .orbit-donut{top:48%;}
        .orbit-petal__icon{width:18px;height:18px;}
        .orbit-petal__label{font-size:clamp(0.5rem,2.3vw,0.6rem);max-width:10ch;}
      }`;
    document.head.appendChild(st);
    injectedStyle = st;

    layoutDonut();
    on(window, "resize", layoutDonut, { passive: true });
  }

  /* ---- ARM detail card: hover-only (bottom-right) ----
     Details appear only while a segment is hovered/focused inside the live
     Five Ways wheel. Outside that window the fixed panel must never show,
     and petals must not receive pointer events (opacity:0 still hits). */
  let featuredIndex = -1;
  let hoverActive = false;
  let orbitHoverLive = false;
  let lastProg = 0;
  let lastOp = 0;
  let swapTO = 0;
  let hideArmTO = 0;
  const armContent = document.getElementById("armContent");

  function isActiveWheel(p, op) {
    // Settled wheel only — not during entry zoom, exit fade, or portfolio glide
    return op > 0.35 && p > 0.32 && p < 0.9 && orbitFade > 0.5;
  }

  /** Enable petal hits only while the wheel is the focused scene.
      Never flip #orbitLayer to auto — it is full-viewport and would steal
      hovers across the page. Petals use pe:auto in CSS which bypasses a
      parent's pe:none, so each petal must be toggled explicitly. */
  function setOrbitPointerEvents(enabled) {
    orbitHoverLive = !!enabled;
    if (orbitLayer) orbitLayer.style.pointerEvents = "none";
    if (orbitDonut) orbitDonut.style.pointerEvents = enabled ? "auto" : "none";
    if (orbitRing) orbitRing.style.pointerEvents = enabled ? "auto" : "none";
    armNodes.forEach(({ el }) => {
      el.style.pointerEvents = enabled ? "auto" : "none";
    });
    if (!enabled) clearCard();
  }

  function setCardText(arm, iconSvg) {
    if (armTitle) armTitle.textContent = arm.title;
    if (armBody) armBody.textContent = arm.body || "";
    if (armKicker) armKicker.textContent = "Persist";
    if (armIcon) {
      armIcon.innerHTML = iconSvg
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>`
        : "";
    }
    if (armList) {
      const pts = arm.points || [];
      armList.innerHTML = pts.map((t) => `<li>${t}</li>`).join("");
      armList.hidden = pts.length === 0;
    }
  }
  function setRimLit(nodeEl) {
    if (!orbitSegLines) return;
    const rims = orbitSegLines.querySelectorAll(".orbit-seg-rim");
    armNodes.forEach((x, i) => {
      const rim = rims[i];
      if (rim) rim.classList.toggle("is-lit", x.el === nodeEl);
    });
  }
  function setNodeFeatured(nodeEl) {
    armNodes.forEach((x) =>
      x.el.classList.toggle("is-featured", x.el === nodeEl),
    );
    setRimLit(nodeEl);
  }
  function clearCard() {
    clearTimeout(swapTO);
    clearTimeout(hideArmTO);
    hoverActive = false;
    if (!armDetail) return;
    armDetail.classList.remove("show", "is-swapping");
    if (armContent) armContent.classList.remove("is-fading");
    featuredIndex = -1;
    armNodes.forEach((x) => x.el.classList.remove("is-featured"));
    setRimLit(null);
  }

  function featureArm(arm, nodeEl, iconSvg, crossfade) {
    if (!armDetail || !orbitHoverLive) return;
    armDetail.style.left =
      armDetail.style.top =
      armDetail.style.right =
      armDetail.style.bottom =
      armDetail.style.transform =
        "";
    armDetail.classList.add("portfolio-detail--anchored");
    setNodeFeatured(nodeEl);
    clearTimeout(swapTO);

    const apply = () => {
      if (!orbitHoverLive) return;
      setCardText(arm, iconSvg);
      armDetail.classList.add("show");
      armDetail.classList.remove("is-swapping");
      if (armContent) armContent.classList.remove("is-fading");
    };

    if (crossfade && armDetail.classList.contains("show")) {
      if (armContent) armContent.classList.add("is-fading");
      swapTO = setTimeout(apply, 220);
    } else {
      apply();
    }
  }

  function showArm(arm, nodeEl) {
    if (!orbitHoverLive) return;
    hoverActive = true;
    const hit = armNodes.find((x) => x.arm === arm) || {};
    const el = nodeEl || hit.el;
    const idx = armNodes.findIndex((x) => x.arm === arm);
    featuredIndex = idx;
    featureArm(arm, el, hit.iconSvg || "", false);
  }
  function hideArm() {
    hoverActive = false;
    clearCard();
  }

  // Hover/focus shows the panel; leaving the live wheel always dismisses it.
  // Mobile: tap-to-select stays open; auto-feature Accelerator when the wheel arrives.
  function updateFeatured(p, op) {
    lastProg = p;
    lastOp = op;
    const inActiveWheel = isActiveWheel(p, op);
    const mobile = window.matchMedia("(max-width: 900px)").matches;

    setOrbitPointerEvents(inActiveWheel);

    if (!inActiveWheel) return;

    if (mobile) {
      if (featuredIndex === -1 && armNodes.length) {
        const pref =
          armNodes.find((x) => x.arm.id === "accelerator") ||
          armNodes[Math.floor(armNodes.length / 2)] ||
          armNodes[0];
        featuredIndex = armNodes.indexOf(pref);
        featureArm(pref.arm, pref.el, pref.iconSvg || "", false);
      }
      return;
    }
    if (
      !hoverActive &&
      (featuredIndex !== -1 || armDetail?.classList.contains("show"))
    ) {
      clearCard();
    }
  }

  function layoutOrbit(expand, spin, opacity) {
    if (!orbitDonut) return;
    const op =
      opacity == null
        ? expand < 0.05
          ? 0
          : Math.min(1, expand * 1.4)
        : opacity;
    const vis = Math.max(0, op) * orbitFade;
    // core star + ring scale up together as the zoom settles into the wheel
    const scale = 0.55 + 0.45 * expand;
    const deg = (spin * 180) / Math.PI;
    orbitDonut.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
    orbitDonut.style.opacity = String(vis);
    // spin the petal ring + glass moon together; counter-rotate labels so
    // they stay upright while the wheel turns
    if (orbitRing) orbitRing.style.transform = `rotate(${deg.toFixed(3)}deg)`;
    if (orbitMoon) orbitMoon.style.transform = `rotate(${deg.toFixed(3)}deg)`;

    // Eclipse "globe" stays only while the wheel is on screen; hide as soon
    // as the ring fades so the solo-P beat is just the mark + stars.
    setOrbitGlobeVisible(vis > 0.12);

    armNodes.forEach(({ el }) => {
      const content = el.querySelector(".orbit-petal__content");
      if (content)
        content.style.transform = `translate(-50%, -50%) rotate(${(-deg).toFixed(3)}deg)`;
    });
    // Hits + detail card are gated by updateFeatured / setOrbitPointerEvents —
    // never enable the full-viewport #orbitLayer, and never leave petals
    // hoverable when the wheel has faded (opacity alone does not block hits).
    if (!isActiveWheel(lastProg, op * orbitFade) && vis <= 0.35) {
      setOrbitPointerEvents(false);
    }
  }

  /** Show/hide the eclipse moon + Three.js center flare together. */
  function setOrbitGlobeVisible(show) {
    const core = orbitDonut && orbitDonut.querySelector(".orbit-core");
    if (core) {
      core.style.opacity = show ? "1" : "0";
      core.style.visibility = show ? "visible" : "hidden";
      core.style.pointerEvents = "none";
    }
    if (starSprite) starSprite.visible = !!show;
  }

  /* ---- LOGO drop + nav glide ---- */
  let navTarget = { x: 0, y: 0 };
  let navScale = 0.12;
  function computeNavTarget() {
    if (!navSlot || !persistLogo) return;
    const r = navSlot.getBoundingClientRect();
    // the logo's left:50% resolves against the layout viewport (excludes the
    // scrollbar), so measure from clientWidth/Height — innerWidth would land
    // the mark half a scrollbar off-center
    const cx = document.documentElement.clientWidth / 2,
      cy = document.documentElement.clientHeight / 2;
    // subtract the nav's hide/show translateY so the target is always the
    // SHOWN slot position — the mark's visibility is synced via .brand-hidden
    let navTy = 0;
    const navBar = navSlot.closest(".nav, .pf-nav");
    if (navBar) {
      const t = getComputedStyle(navBar).transform;
      if (t && t !== "none") navTy = new DOMMatrixReadOnly(t).m42;
    }
    navTarget.x = r.left + r.width / 2 - cx;
    navTarget.y = r.top - navTy + r.height / 2 - cy;
    const lw = persistLogo.offsetWidth || 280;
    // land at the nav slot's rendered size so the mark sits flush with the wordmark
    const targetPx = r.height || 30;
    navScale = targetPx / lw;
  }
  function setLogo(drop, glide) {
    if (!persistLogo) return;
    // while centered over the glass orb the mark must read much smaller
    // than its CSS box — size it from the core diameter (set in layoutDonut)
    const cssW = persistLogo.offsetWidth || 220;
    const orbitPx =
      Number(persistLogo.dataset.orbitMarkPx) || Math.round(cssW * 0.42);
    const orbitScale = orbitPx / cssW;
    const baseScale = orbitScale * (0.82 + 0.18 * drop);
    const scale = baseScale * (1 - glide) + navScale * glide;

    // Keep the P locked to the glass orb center (donut may sit off 50%/50%
    // on tablet), then blend toward the nav brand slot as glide progresses.
    let orbitOffX = 0;
    let orbitOffY = 0;
    if (orbitDonut && glide < 1) {
      const r = orbitDonut.getBoundingClientRect();
      if (r.width > 1 && r.height > 1) {
        const cx = document.documentElement.clientWidth / 2;
        const cy = document.documentElement.clientHeight / 2;
        orbitOffX = r.left + r.width / 2 - cx;
        orbitOffY = r.top + r.height / 2 - cy;
      }
    }
    const x = orbitOffX * (1 - glide) + navTarget.x * glide;
    const y = orbitOffY * (1 - glide) + navTarget.y * glide;

    persistLogo.style.opacity = String(Math.min(1, drop));
    persistLogo.style.transform = `translate(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px)) scale(${scale})`;
  }

  /* Reveal the shared React navbar only once the P begins traveling
     toward the brand slot — not during the centered orbit drop. */
  function setDockNavLock(on) {
    window.PF._forceNavVisible = !!on;
    const nav = document.getElementById("nav");
    if (!nav) return;
    if (on) {
      nav.classList.remove("is-hidden");
      nav.classList.add("nav-dock-lock");
    } else {
      nav.classList.remove("nav-dock-lock");
    }
  }
  function updateDockNavLock() {
    const g = window.PF._glideG || 0;
    const gRaw = window.PF._glideRaw ?? 0;
    // mapGlideProgress stays at 0 through the centered hold; g > 0 means
    // the mark has started moving toward the nav.
    setDockNavLock(g > 0.001 && gRaw < 0.99);
  }

  /* Map raw scroll progress → logo glide with a readable arc + settle dwell.
     First ~12%: stay centered. Next ~48%: ease into the nav. Last ~40%: hold docked. */
  function mapGlideProgress(p) {
    const holdStart = 0.12;
    const settleAt = 0.6;
    if (p <= holdStart) return 0;
    if (p >= settleAt) return 1;
    const t = (p - holdStart) / (settleAt - holdStart);
    // easeInOutCubic — slow start, clear travel, soft landing
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  let tickerFn = null;
  function wireScroll() {
    computeNavTarget();
    on(window, "resize", computeNavTarget, { passive: true });

    let spin = 0;
    let spinDrift = 0;
    let orbitProgress = 0;

    function ringExpand(p) {
      // Wheel expands only after the star zoom phase
      return Math.min(1, Math.max(0, (p - 0.26) / 0.28));
    }
    function ringOpacity(p) {
      // Keep the 5-forge wheel hidden until the zoom-out has mostly played
      if (p <= 0.3 || p >= 0.94) return 0;
      if (p < 0.46) return (p - 0.3) / 0.16;
      if (p <= 0.74) return 1;
      return 1 - (p - 0.74) / 0.2;
    }
    // scroll turns the wheel; a slow drift keeps the moon/segments alive between scrolls
    function currentSpin() {
      return orbitProgress * Math.PI * 1.35 + spinDrift;
    }

    mkTrigger({
      // Start early so the star zoom plays while leaving Backstory, before the wheel
      trigger: "#orbit",
      start: "top bottom",
      end: "bottom bottom",
      scrub: 0.5,
      onLeaveBack: () => {
        // scrolled back up out of the section — fully hide the wheel
        if (orbitLayer) orbitLayer.style.opacity = "0";
        orbitFade = 0;
        setOrbitPointerEvents(false);
        clearCard();
        starZoom = 0;
        starFieldOpacity = 0;
        if (threeCanvas) threeCanvas.style.opacity = "0";
        stopThree();
        // re-cover the baked center flare softly while Backstory is on screen again
        if (stageFlareMask) {
          const isMobile = window.matchMedia("(max-width: 1024px)").matches;
          stageFlareMask.style.opacity = isMobile ? "1" : "0.55";
        }
        if (canvas) canvas.style.filter = "";
      },
      onLeave: () => {
        // scrolled past Five Ways — drop the fixed detail so it can't overlay portfolio
        orbitFade = 0;
        setOrbitPointerEvents(false);
        clearCard();
        setOrbitGlobeVisible(false);
      },
      onUpdate: (self) => {
        orbitProgress = self.progress;
        window.PF._orbitProgress = orbitProgress;
        spin = currentSpin();
        // Logo drop begins as the zoom settles / wheel approaches
        const drop = Math.min(1, Math.max(0, (orbitProgress - 0.18) / 0.28));
        window.PF._logoDrop = drop;
        const ex = ringExpand(orbitProgress);
        const op = ringOpacity(orbitProgress);

        // Lift the soft veil smoothly as the zoom plays — no hard black flash
        if (stageFlareMask) {
          const isMobile = window.matchMedia("(max-width: 1024px)").matches;
          const base = isMobile ? 1 : 0.55;
          const lift = Math.min(1, orbitProgress / 0.28);
          stageFlareMask.style.opacity = Math.max(0, base * (1 - lift)).toFixed(
            3,
          );
        }
        // Mild canvas dim so the flare isn’t blinding, but still glows
        const entryDim = Math.min(1, orbitProgress / 0.18);
        const bright = Math.max(0.72, 1 - entryDim * 0.14 - drop * 0.12);
        canvas.style.filter = `brightness(${bright.toFixed(3)})`;

        if (window.PF._gliding !== true) setLogo(drop, 0);
        orbitFade = 1;
        if (orbitLayer) {
          // Layer visible for stars/backdrop once zoom starts; wheel opacity is separate
          orbitLayer.style.opacity = orbitProgress > 0.01 ? "1" : "0";
          const bd = orbitLayer.querySelector(".orbit-backdrop");
          const diag = orbitLayer.querySelector(".orbit-diagram");
          // Backdrop after zoom is underway
          const uiReveal = Math.min(
            1,
            Math.max(0, (orbitProgress - 0.22) / 0.28),
          );
          if (bd) bd.style.opacity = String(uiReveal * 0.94);
          if (diag) diag.style.opacity = String(uiReveal * 0.28);
        }
        layoutOrbit(ex, spin, op);
        if (orbitHeading) {
          orbitHeading.style.opacity = String(
            Math.min(1, Math.max(0, (orbitProgress - 0.32) / 0.2)),
          );
        }

        // ── Star zoom FIRST (progress 0 → ~0.28), then wheel fades in ──
        const zoomT = Math.min(1, orbitProgress / 0.28);
        starZoom = 1 - Math.pow(1 - zoomT, 3);
        // Visible glow during zoom; settle softer once the wheel arrives
        const zoomBoost = (1 - zoomT) * 0.55;
        const holdStars = 0.28 + zoomBoost + (1 - Math.min(1, op)) * 0.2;
        starFieldOpacity = Math.max(0.12, Math.min(0.85, holdStars));
        if (orbitProgress > 0.01) startThree();
        if (threeCanvas)
          threeCanvas.style.opacity = starFieldOpacity.toFixed(3);

        updateFeatured(orbitProgress, op);
        updateDockNavLock();
      },
    });

    if (!reduceMotion) {
      tickerFn = () => {
        // keep the ring + moon turning while the section is in view,
        // independent of the Three.js starfield render loop
        if (armNodes.length && orbitProgress > 0.32 && orbitProgress < 0.96) {
          spinDrift += 0.0012;
          spin = currentSpin();
          const ex = ringExpand(orbitProgress);
          const op = ringOpacity(orbitProgress);
          if (ex > 0.02) layoutOrbit(ex, spin, op);
        }
      };
      gsap.ticker.add(tickerFn);
    }

    // Longer scroll window + laggy scrub so the dock reads clearly;
    // progress is remapped to hold → ease → settle in the nav.
    mkTrigger({
      trigger: "#portfolio",
      start: "top 95%",
      end: "top -40%",
      scrub: 1.85,
      onLeaveBack: () => {
        // Back into Five Ways — footage + globe return with the wheel
        if (canvas) {
          canvas.style.opacity = "1";
          canvas.style.filter = "";
        }
        // layoutOrbit will re-show the globe once the ring is visible again
      },
      onUpdate: (self) => {
        const gRaw = self.progress;
        const g = mapGlideProgress(gRaw);
        if (orbitLayer)
          orbitLayer.style.opacity = String(Math.max(0, 1 - gRaw * 2.4));
        if (orbitHeading) orbitHeading.style.opacity = "0";
        // As soon as portfolio glide starts, kill petal hits + detail card —
        // the layer may still be partially visible / pe would otherwise leak
        if (gRaw > 0.001) {
          orbitFade = Math.max(0, 1 - gRaw * 2.4);
          setOrbitPointerEvents(false);
        }
        // Live starfield only — no eclipse globe, no baked footage flare
        starFieldOpacity = 1;
        if (threeCanvas) threeCanvas.style.opacity = "1";
        if (!running) startThree();

        setOrbitGlobeVisible(false);
        starZoom = 0;
        // Kill the cinematic frame flare so a bright orb can't sit beside the P
        if (canvas) {
          canvas.style.opacity = "0";
          canvas.style.filter = "none";
        }
        if (stageFlareMask) stageFlareMask.style.opacity = "0";

        window.PF._gliding = gRaw > 0.001;
        window.PF._glideG = g;
        window.PF._glideRaw = gRaw;
        if (gRaw > 0.001) clearCard();
        if (g > 0.001) computeNavTarget();
        setLogo(1, g);
        if (navSlot) navSlot.style.pointerEvents = g > 0.55 ? "auto" : "none";
        updateDockNavLock();
      },
    });

    // Value props -> filter -> final CTA: stars only (no baked footage / video).
    // Hide the frame-sequence canvas and center flare; keep mouse-parallax stars.
    mkTrigger({
      trigger: "#valueProps",
      endTrigger: "#apply",
      start: "top 70%",
      end: "bottom 20%",
      scrub: 0.5,
      onLeaveBack: () => {
        if (canvas) {
          canvas.style.opacity = "1";
          canvas.style.filter = "";
        }
        if (starSprite) starSprite.visible = true;
      },
      onUpdate: (self) => {
        const p = self.progress;
        // Stars already at full strength from portfolio; fade out late into footer
        const fall = p > 0.92 ? (1 - p) / 0.08 : 1;
        starFieldOpacity = Math.max(0.08, fall);
        if (threeCanvas) threeCanvas.style.opacity = starFieldOpacity.toFixed(3);

        // Drop cinematic frame footage — only the live starfield remains
        if (canvas) {
          canvas.style.opacity = "0";
          canvas.style.filter = "none";
        }
        // Hide bright center flare sprite (reads like a video glow)
        if (starSprite) starSprite.visible = false;
        // Settle zoom so stars drift with mouse, not a blown-out fly-through
        starZoom = 0;
        if (stageFlareMask) stageFlareMask.style.opacity = "0";

        if (fall > 0.02) startThree();
      },
    });

    persistLogo.style.pointerEvents = "auto";
    on(persistLogo, "click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initFinale() {
    // Three.js loads on-demand via startThree() when the orbit/starfield begins —
    // keep orbit UI + scroll wiring independent so first paint isn't blocked.
    if (armDetail && armDetail.parentElement !== document.body) {
      // lift the panel to <body>, but on cleanup RETURN it to its original
      // parent — removing it outright orphans the React-owned node, and the
      // next mount (StrictMode/HMR) finds no #armDetail, killing hover cards
      const armHome = armDetail.parentElement;
      document.body.appendChild(armDetail);
      cleanups.push(() => {
        if (armDetail && armHome) armHome.appendChild(armDetail);
      });
    }
    buildOrbit();
    setLogo(0, 0);
    wireScroll();
  }

  /* ============================================================
     3) ORCHESTRATION — loader, sound, cursor, scroll cue
     ============================================================ */
  function initMain() {
    // logo swap-in fallbacks (Tether lockup)
    function swapLogo(img) {
      if (img.dataset.swapped) return;
      img.dataset.swapped = "1";
      const span = document.createElement("span");
      span.className = "logo-fallback";
      span.textContent = img.dataset.fallback || img.alt || "";
      if (img.parentNode) img.parentNode.replaceChild(span, img);
    }
    document.querySelectorAll(".logo-swap").forEach((img) => {
      img.addEventListener("error", () => swapLogo(img));
      if (img.complete && img.naturalWidth === 0) swapLogo(img);
    });

    const loader = document.getElementById("loader");
    const onReady = () => loader && loader.classList.add("done");
    on(document, "pf:ready", onReady);
    const hardFallback = setTimeout(
      () => loader && loader.classList.add("done"),
      isLitePerf ? 2200 : 6000,
    );
    cleanups.push(() => clearTimeout(hardFallback));

    const cue = document.getElementById("scrollCue");
    const navEl = document.getElementById("nav");
    const usesSharedNav = !!(
      navEl &&
      navEl.classList.contains("nav") &&
      !navEl.classList.contains("pf-nav")
    );
    let lastNavY = window.scrollY;
    const onWinScroll = () => {
      const y = window.scrollY;
      if (cue) cue.style.opacity = y > 80 ? "0" : "1";
      if (!navEl || !persistLogo) return;

      // Shared React Navbar owns hide/scrolled state — only sync the docked mark.
      if (usesSharedNav) {
        const docked = window.PF._glideG > 0.5;
        const navHidden =
          navEl.classList.contains("is-hidden") && !window.PF._forceNavVisible;
        persistLogo.classList.toggle("brand-hidden", docked && navHidden);
        // Keep the docked mark glued to the slot when nav padding/height changes
        // (is-scrolled) or when the bar reappears after being hidden.
        if (docked && window.PF._glideG != null) {
          computeNavTarget();
          setLogo(1, window.PF._glideG);
        }
        return;
      }

      navEl.classList.toggle("scrolled", y > 40);
      // conditional visibility: hide scrolling down, show scrolling up,
      // always visible near the top
      const delta = y - lastNavY;
      if (y < 120) navEl.classList.remove("nav-hidden");
      else if (delta > 6) navEl.classList.add("nav-hidden");
      else if (delta < -6) navEl.classList.remove("nav-hidden");
      if (Math.abs(delta) > 6) lastNavY = y;
      // the docked brand mark is a separate fixed element — fade it in
      // sync with the nav (only once it has substantially glided in)
      const docked = window.PF._glideG > 0.5;
      persistLogo.classList.toggle(
        "brand-hidden",
        docked && navEl.classList.contains("nav-hidden"),
      );
    };
    on(window, "scroll", onWinScroll, { passive: true });

    // Cursor: sitewide CustomCursor in App layout (brand #6145a9)

    // SOUND: ambient pad + UI ticks (toggle UI removed — muted by default)
    const toggle = document.getElementById("soundToggle");
    const label = document.getElementById("soundLabel");
    let actx = null,
      master = null,
      soundOn = false;
    const padNodes = [];

    function buildAudio() {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = 0;
      master.connect(actx.destination);
      const lp = actx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 520;
      lp.Q.value = 0.6;
      lp.connect(master);
      [110, 110.4, 164.81].forEach((f, i) => {
        const o = actx.createOscillator();
        o.type = i === 2 ? "sine" : "sawtooth";
        o.frequency.value = f;
        const g = actx.createGain();
        g.gain.value = i === 2 ? 0.05 : 0.04;
        o.connect(g);
        g.connect(lp);
        o.start();
        padNodes.push(o);
      });
      const lfo = actx.createOscillator();
      lfo.frequency.value = 0.05;
      const lfoG = actx.createGain();
      lfoG.gain.value = 180;
      lfo.connect(lfoG);
      lfoG.connect(lp.frequency);
      lfo.start();
    }
    function uiTick(freq) {
      if (!actx || !soundOn) return;
      const o = actx.createOscillator();
      o.type = "triangle";
      o.frequency.value = freq || 880;
      const g = actx.createGain();
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(master);
      const t = actx.currentTime;
      g.gain.linearRampToValueAtTime(0.06, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.start(t);
      o.stop(t + 0.18);
    }
    function setSound(state) {
      soundOn = state;
      if (soundOn) {
        if (!actx) buildAudio();
        if (actx.state === "suspended") actx.resume();
        master.gain.cancelScheduledValues(actx.currentTime);
        master.gain.linearRampToValueAtTime(0.5, actx.currentTime + 1.2);
        if (toggle) {
          toggle.classList.add("is-on");
          toggle.setAttribute("aria-pressed", "true");
        }
        if (label) label.textContent = "Sound on";
      } else {
        if (master && actx)
          master.gain.linearRampToValueAtTime(0, actx.currentTime + 0.4);
        if (toggle) {
          toggle.classList.remove("is-on");
          toggle.setAttribute("aria-pressed", "false");
        }
        if (label) label.textContent = "Sound";
      }
    }
    if (toggle) {
      on(toggle, "click", () => setSound(!soundOn));
      on(document, "mouseover", (e) => {
        if (e.target.closest(".orbit-node")) uiTick(1320);
      });
      document
        .querySelectorAll(".btn")
        .forEach((b) => on(b, "mouseenter", () => uiTick(660)));
    }
    cleanups.push(() => {
      if (actx) {
        try {
          actx.close();
        } catch {
          /* noop */
        }
      }
    });

    // refresh ScrollTrigger after fonts/images settle
    const onFramesComplete = () => ScrollTrigger.refresh();
    on(document, "pf:framesComplete", onFramesComplete);
    const onLoad = () => ScrollTrigger.refresh();
    on(window, "load", onLoad);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => {
        if (!killed) ScrollTrigger.refresh();
      });
  }

  /* ============================================================
     BOOT  (scrubber → finale → orchestration, mirrors script order)
     ============================================================ */
  initScrubber();
  initFinale();
  initMain();
  preload();

  /* ---- teardown ---- */
  return function cleanup() {
    killed = true;
    stopThree();
    if (tickerFn) gsap.ticker.remove(tickerFn);
    createdTriggers.forEach((t) => t && t.kill());
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* noop */
      }
    });
    if (orbitLayer && orbitLayer.parentElement)
      orbitLayer.parentElement.removeChild(orbitLayer);
    if (injectedStyle && injectedStyle.parentElement)
      injectedStyle.parentElement.removeChild(injectedStyle);
    if (renderer) {
      try {
        renderer.dispose();
      } catch {
        /* noop */
      }
    }
    if (window.PF) {
      window.PF.onHeroProgress = null;
      window.PF._gliding = false;
      window.PF._forceNavVisible = false;
      window.PF._logoDrop = 0;
      window.PF._glideRaw = 0;
    }
    const nav = document.getElementById("nav");
    if (nav) nav.classList.remove("nav-dock-lock");
  };
}
