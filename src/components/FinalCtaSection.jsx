import { useEffect } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   FINAL CTA — glass panel: "Once on paper everything changes."
   Drop final aurora art at /assets/final-cta-bg.png
───────────────────────────────────────────────────────────── */

export default function FinalCtaSection() {
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

  return (
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
  );
}
