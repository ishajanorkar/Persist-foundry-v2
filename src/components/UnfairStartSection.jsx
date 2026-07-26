import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CornerTicks from "../about/CornerTicks";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   UNFAIR START — vertical parallax, all breakpoints.
   Every card is animated individually (not grouped by column),
   so the effect still reads as "different speeds" even when the
   grid collapses to a single column on phones. A small idle CSS
   bob is layered on top of the scroll-tween for a floating feel.

   Grid reflow (CSS only):
     Desktop  ≥1025px → 3 columns, middle-column cards offset down
     Tablet   641–1024px → 2 columns
     Mobile   ≤640px → 1 column
───────────────────────────────────────────────────────────── */

const HEADER = {
  titleLead: "We Hand Founders",
  titleTrail: "An",
  titleSub: "Unfair Start.",
};

const CARDS = {
  financial: {
    title: "Financial Freedom",
    body: [
      "Funding and a monthly salary so you can",
      "build full time from the very first day.",
    ],
    icon: "/foundry/value-props/icon-financial.png",
    alt: "Metallic coin with dollar mark",
  },
  network: {
    title: "Founder Network",
    body: [
      "A close-knit group of ambitious founders",
      "building alongside you through every stage.",
    ],
    icon: "/foundry/value-props/icon-network.png",
    alt: "Network pedestal diagram",
  },
  expertise: {
    title: "Embedded Expertise",
    body: [
      "Builders, designers, and recruiters embedded",
      "in your venture until it stands on its own.",
    ],
    icon: "/foundry/value-props/icon-expertise.png",
    alt: "Glowing expertise cube",
  },
  mentorship: {
    title: "Proven Mentorship",
    body: [
      "Experienced founders and operators in your corner",
      "whenever you need guidance.",
    ],
    icon: "/foundry/value-props/icon-mentorship.png",
    alt: "Glass pyramid icon",
  },
  connections: {
    title: "Meaningful Connections",
    body: [
      "Warm introductions to customers, top talent,",
      "and investors who boost growth.",
    ],
    icon: "/foundry/value-props/icon-connections.png",
    alt: "Interlocking chain links icon",
  },
  partnership: {
    title: "Long-Term Partnership",
    body: [
      "Support that continues beyond the first check",
      "through every raise, pivot, and milestone.",
    ],
    icon: "/foundry/value-props/icon-partnership.png",
    alt: "Glass staircase icon",
  },
};

// Row-major order — this is also the order CSS Grid lays cards out in,
// desktop (3-col): row1 financial/expertise/network, row2 mentorship/connections/partnership.
// Index i below lines up 1:1 with this array for the speed tables.
const CARD_ORDER = [
  "financial",
  "expertise",
  "network",
  "mentorship",
  "connections",
  "partnership",
];

// Per-card scroll-parallax distance (px of translateY across the section's
// full pass through the viewport), indexed to CARD_ORDER, one set per
// breakpoint. Desktop pairs (0&3, 1&4, 2&5) share a speed so same-column
// cards still drift together; tablet/mobile vary per-card since columns
// collapse — that variance is what keeps the "different speed" feel alive
// even in a single mobile column.
const SPEEDS = {
  desktop: [-700, -260, -370, -700, -260, -370],
  tablet: [-190, -130, -190, -130, -190, -130],
  mobile: [-70, -95, -60, -100, -75, -90],
};

function PropCard({ card }) {
  return (
    <article className="vprop-card">
      <CornerTicks />
      <h3 className="vprop-card__title">{card.title}</h3>
      <div className="vprop-card__icon">
        <img src={card.icon} alt={card.alt} loading="lazy" draggable="false" />
      </div>
      <div className="vprop-card__foot">
        <p>
          {card.body.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      </div>
    </article>
  );
}

export default function UnfairStartSection() {
  const rootRef = useRef(null);
  const cellRefs = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    const cells = cellRefs.current.filter(Boolean);
    if (!root || !cells.length) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mm = gsap.matchMedia();

    if (!prefersReduced) {
      mm.add(
        {
          isDesktop: "(min-width: 1025px)",
          isTablet: "(min-width: 641px) and (max-width: 1024px)",
          isMobile: "(max-width: 640px)",
        },
        (context) => {
          const { isDesktop, isTablet } = context.conditions;
          const speeds = isDesktop
            ? SPEEDS.desktop
            : isTablet
              ? SPEEDS.tablet
              : SPEEDS.mobile;

          const tweens = cells.map((cell, i) =>
            gsap.to(cell, {
              y: speeds[i % speeds.length],
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
                invalidateOnRefresh: true,
              },
            }),
          );

          const onResize = () => ScrollTrigger.refresh();
          window.addEventListener("resize", onResize);

          return () => {
            window.removeEventListener("resize", onResize);
            tweens.forEach((tw) => {
              tw.scrollTrigger?.kill();
              tw.kill();
            });
            gsap.set(cells, { clearProps: "transform" });
          };
        },
      );
    }

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    if (document.fonts?.ready) document.fonts.ready.then(onLoad);

    return () => {
      mm.revert();
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <section className="vprop" id="valueProps" ref={rootRef}>
      <header className="vprop__head">
        <h2 className="vprop__title">
          <span className="vprop__line">
            <span className="vprop__lead">{HEADER.titleLead}</span>{" "}
            <span className="vprop__trail">{HEADER.titleTrail}</span>
          </span>
          <span className="vprop__sub">{HEADER.titleSub}</span>
        </h2>
      </header>

      <div className="vprop__parallax">
        {CARD_ORDER.map((key, i) => (
          <div
            key={key}
            className="vprop__cell"
            ref={(el) => (cellRefs.current[i] = el)}
          >
            <PropCard card={CARDS[key]} />
          </div>
        ))}
      </div>
    </section>
  );
}
