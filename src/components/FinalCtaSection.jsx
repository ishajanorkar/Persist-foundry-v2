import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "../foundry/foundry.css";

/* ─────────────────────────────────────────────────────────────
   FINAL CTA — glass panel over looping landscape video bg.
   Dual-buffer crossfade so the loop join is seamless (no hard cut).
───────────────────────────────────────────────────────────── */

const CTA_VIDEO_SRC = "/foundry/final-cta-bg.mp4";
/** Seconds before end to start the next copy + crossfade */
const CROSSFADE_SEC = 1.45;

export default function FinalCtaSection({ footer = false }) {
  const mediaRef = useRef(null);
  const videoARef = useRef(null);
  const videoBRef = useRef(null);

  useEffect(() => {
    const finalCta = document.getElementById("apply");
    if (!finalCta) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      finalCta.classList.add("is-in-view");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in-view");
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.18 },
    );
    obs.observe(finalCta);
    return () => obs.disconnect();
  }, []);

  // Seamless dual-video loop + play only while in view / tab visible
  useEffect(() => {
    const a = videoARef.current;
    const b = videoBRef.current;
    const media = mediaRef.current;
    if (!a || !b || !media) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      a.pause();
      b.pause();
      return;
    }

    let active = a;
    let idle = b;
    let inView = false;
    let swapping = false;
    let fadeRaf = 0;
    let watchRaf = 0;
    let fadeStart = 0;

    const playSafe = (el) => {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const setLayer = (front, back) => {
      front.classList.add("is-front");
      front.classList.remove("is-back");
      back.classList.add("is-back");
      back.classList.remove("is-front");
      front.style.opacity = "1";
      back.style.opacity = "0";
      front.style.zIndex = "1";
      back.style.zIndex = "0";
    };

    setLayer(active, idle);

    const stopWatch = () => {
      if (watchRaf) cancelAnimationFrame(watchRaf);
      watchRaf = 0;
    };

    const stopFade = () => {
      if (fadeRaf) cancelAnimationFrame(fadeRaf);
      fadeRaf = 0;
    };

    const finishSwap = (from, to) => {
      from.pause();
      try {
        from.currentTime = 0;
      } catch {
        /* ignore seek errors mid-load */
      }
      from.style.opacity = "0";
      to.style.opacity = "1";
      setLayer(to, from);
      active = to;
      idle = from;
      swapping = false;
    };

    const beginCrossfade = () => {
      if (swapping || !inView || document.hidden) return;
      const duration = active.duration;
      if (!Number.isFinite(duration) || duration < CROSSFADE_SEC * 2) {
        // Fallback: hard-reset if duration isn't usable yet
        try {
          active.currentTime = 0;
        } catch {
          /* ignore */
        }
        playSafe(active);
        return;
      }

      swapping = true;
      try {
        idle.currentTime = 0;
      } catch {
        /* ignore */
      }
      // Incoming layer must stack above — DOM order alone can't do A←B fades
      idle.style.zIndex = "2";
      active.style.zIndex = "1";
      idle.style.opacity = "0";
      playSafe(idle);

      const from = active;
      const to = idle;
      fadeStart = performance.now();
      const durMs = CROSSFADE_SEC * 1000;

      const tick = (now) => {
        const t = Math.min(1, (now - fadeStart) / durMs);
        const e = t * t * (3 - 2 * t); // smoothstep
        to.style.opacity = String(e);
        from.style.opacity = String(1 - e);

        if (t < 1) {
          fadeRaf = requestAnimationFrame(tick);
          return;
        }
        fadeRaf = 0;
        finishSwap(from, to);
      };

      fadeRaf = requestAnimationFrame(tick);
    };

    const maybeStartCrossfade = () => {
      if (swapping || !inView || document.hidden) return;
      const duration = active.duration;
      if (
        Number.isFinite(duration) &&
        duration > 0 &&
        active.currentTime >= duration - CROSSFADE_SEC
      ) {
        beginCrossfade();
      }
    };

    const watch = () => {
      watchRaf = 0;
      if (!inView || document.hidden) return;
      maybeStartCrossfade();
      if (inView && !document.hidden) {
        watchRaf = requestAnimationFrame(watch);
      }
    };

    const startWatch = () => {
      if (watchRaf) return;
      watchRaf = requestAnimationFrame(watch);
    };

    const syncPlayback = () => {
      if (inView && !document.hidden) {
        playSafe(active);
        if (!swapping) idle.pause();
        startWatch();
      } else {
        stopWatch();
        stopFade();
        swapping = false;
        active.pause();
        idle.pause();
        setLayer(active, idle);
      }
    };

    const onEnded = (e) => {
      if (e.target !== active) return;
      // Tab throttle or late seek can skip the pre-end window — still blend
      beginCrossfade();
    };

    const onTimeUpdate = (e) => {
      if (e.target !== active) return;
      maybeStartCrossfade();
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        syncPlayback();
      },
      { rootMargin: "25% 0px", threshold: 0.01 },
    );
    io.observe(media);
    document.addEventListener("visibilitychange", syncPlayback);
    a.addEventListener("ended", onEnded);
    b.addEventListener("ended", onEnded);
    a.addEventListener("timeupdate", onTimeUpdate);
    b.addEventListener("timeupdate", onTimeUpdate);

    a.preload = "auto";
    b.preload = "auto";
    a.load();
    b.load();

    return () => {
      stopWatch();
      stopFade();
      io.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      a.removeEventListener("ended", onEnded);
      b.removeEventListener("ended", onEnded);
      a.removeEventListener("timeupdate", onTimeUpdate);
      b.removeEventListener("timeupdate", onTimeUpdate);
      a.pause();
      b.pause();
    };
  }, []);

  return (
    <div className="pf-final-cta-container">
      <div className="pf-final-cta-media" aria-hidden="true" ref={mediaRef}>
        <video
          ref={videoARef}
          className="pf-final-cta-background is-front"
          src={CTA_VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        />
        <video
          ref={videoBRef}
          className="pf-final-cta-background is-back"
          src={CTA_VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        />
        <div className="pf-final-cta-media__scrim" />
      </div>

      <section className="pf-final-cta" id="apply">
        <div className="pf-final-cta-bg" aria-hidden="true" />
        <div className="pf-final-cta-panel">
          <div className="pf-final-cta-panel__bg" aria-hidden="true" />
          <div className="pf-final-cta-panel__glow" aria-hidden="true" />
          <div className="pf-final-cta-copy">
            <p className="pf-final-cta-kicker">Now you know us</p>
            <h2 className="pf-final-cta-hero" id="finalHeadline">
              <span className="pf-final-cta-hero-line">Once on paper</span>
              <span className="pf-final-cta-hero-line">everything changes.</span>
            </h2>
            <p className="pf-final-cta-sub">
              You&apos;ve made this bet a thousand times in your head.
            </p>
            <Link
              className="pf-final-cta-link"
              data-magnetic
              to="/fellowship-program-application"
            >
              Become A Founder <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
      {footer && <Footer />}
    </div>
  );
}
