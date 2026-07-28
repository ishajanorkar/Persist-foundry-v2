import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   FILTER — "If You're Still Deciding, This Isn't for You."
   Blueprint twin-column apply / don't-apply panel. Top-right
   deco drifts on scroll; bottom-left stays pinned to the section
   floor so no gap opens above the next block.
───────────────────────────────────────────────────────────── */

const YES = [
  "You're thinking about it the second you stop talking.",
  "You'll outwork the version of yourself that plays it safe.",
  "Comfort makes you restless, not reassured.",
  'You stopped saying "someday" just about a while ago.',
];

const NO = [
  "You're here for the cheque, not the work.",
  "You haven't decided what to care about.",
  "Honest feedback derails your week.",
  "The title matters more to you than the job does.",
];

// Upward drift (px) for the top-right deco only
const SCROLL_RANGE_TR = 560;

export default function FilterSection() {
  const sectionRef = useRef(null);
  const decoTrRef = useRef(null);
  const decoBlRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Section in-view → stagger-reveal points (and head / panel)
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            section.classList.add("is-in-view");
            sectionObs.disconnect();
          }
        });
      },
      { threshold: 0.18 },
    );
    sectionObs.observe(section);

    if (reduceMotion) {
      return () => sectionObs.disconnect();
    }

    // ---- Scroll parallax: top-right only; bottom-left stays pinned ----
    const tweens = [];

    if (decoTrRef.current) {
      tweens.push(
        gsap.to(decoTrRef.current, {
          y: -SCROLL_RANGE_TR,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        }),
      );
    }

    return () => {
      sectionObs.disconnect();
      tweens.forEach((tw) => {
        tw.scrollTrigger?.kill();
        tw.kill();
      });
    };
  }, []);

  return (
    <section className="filter-section" id="filter" ref={sectionRef}>
      <img
        ref={decoTrRef}
        className="filter-deco filter-deco--tr"
        src="/foundry/filter/deco-top-right.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <img
        ref={decoBlRef}
        className="filter-deco filter-deco--bl"
        src="/foundry/filter/deco-bottom-left.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <div className="filter-inner">
        <header className="filter-head">
          <h2 className="filter-headline">
            If You&apos;re Still Deciding,
            <br />
            This Isn&apos;t for You.
          </h2>
          <p className="filter-headline-sub">
            This isn&apos;t the place to figure out whether you want to build
            something. It&apos;s for the people who decided a long time ago.
          </p>
        </header>

        <div className="filter-panel">
          <span className="filter-cross filter-cross--tl" aria-hidden="true" />
          <span className="filter-cross filter-cross--tr" aria-hidden="true" />
          <span className="filter-cross filter-cross--bl" aria-hidden="true" />
          <span className="filter-cross filter-cross--br" aria-hidden="true" />
          <span className="filter-cross filter-cross--tm" aria-hidden="true" />
          <span className="filter-cross filter-cross--bm" aria-hidden="true" />

          <div className="filter-panel__grid">
            <div className="filter-col filter-col--yes">
              <div className="filter-col-label">
                <span className="filter-col-icon" aria-hidden="true">
                  ✓
                </span>
                Apply if
              </div>
              <ul className="filter-list">
                {YES.map((text, i) => (
                  <li key={text} className="filter-row" style={{ "--i": i }}>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-col filter-col--no">
              <div className="filter-col-label">
                <span className="filter-col-icon" aria-hidden="true">
                  ✕
                </span>
                Don&apos;t apply if
              </div>
              <ul className="filter-list">
                {NO.map((text, i) => (
                  <li key={text} className="filter-row" style={{ "--i": i }}>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
