import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "../foundry/foundry.css";

/* ─────────────────────────────────────────────────────────────
   FINAL CTA — glass panel over looping landscape video bg.
   Global sitewide CTA (also used on Foundry home with footer).
───────────────────────────────────────────────────────────── */

const CTA_VIDEO_SRC = "/foundry/final-cta-bg.mp4";

export default function FinalCtaSection({ footer = false }) {
  const videoRef = useRef(null);

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

  // Play only while near viewport / tab visible — saves CPU & battery
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      video.pause();
      return;
    }

    let inView = false;
    const playSafe = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    const sync = () => {
      if (inView && !document.hidden) playSafe();
      else video.pause();
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting);
        sync();
      },
      { rootMargin: "25% 0px", threshold: 0.01 },
    );
    io.observe(video);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, []);

  return (
    <div className="pf-final-cta-container">
      <div className="pf-final-cta-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="pf-final-cta-background"
          src={CTA_VIDEO_SRC}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
        />
        <div className="pf-final-cta-media__scrim" />
      </div>

      <section className="final-cta" id="apply">
        <div className="final-cta-bg" aria-hidden="true" />
        <div className="final-cta-panel">
          <div className="final-cta-panel__bg" aria-hidden="true" />
          <div className="final-cta-panel__glow" aria-hidden="true" />
          <div className="final-cta-content">
            <p className="final-cta-kicker">Now you know us</p>
            <h2 className="final-cta-hero" id="finalHeadline">
              <span className="final-cta-hero-line1">Once on paper</span>
              <span className="final-cta-hero-line2">everything changes.</span>
            </h2>
            <p className="final-cta-sub">
              You&apos;ve made this bet a thousand times in your head.
            </p>
            <Link
              className="final-cta-link"
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
