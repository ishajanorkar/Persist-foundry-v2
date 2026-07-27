import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "../foundry/foundry.css";
/* ─────────────────────────────────────────────────────────────
   FINAL CTA — glass panel: "Once on paper everything changes."
   Global sitewide CTA (also used on Foundry home with footer).
───────────────────────────────────────────────────────────── */

export default function FinalCtaSection({ footer = false }) {
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
    <div className="pf-final-cta-container">
      <img
        className="pf-final-cta-background"
        src="/assets/cta.png"
        alt="Final CTA Background"
      />
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
