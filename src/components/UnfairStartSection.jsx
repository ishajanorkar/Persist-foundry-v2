import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CornerTicks from "../about/CornerTicks";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   UNFAIR START — vertical parallax columns.
   Desktop (≥1025px): 3 columns, each scrubbed to a different
   translateY distance as the section passes through the
   viewport, so columns visibly drift at different speeds.
   Tablet/phone: static 2×3 grid (unchanged).
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

// Flat order — used for the tablet/phone static grid, left-to-right/top-to-bottom
const FLAT_ORDER = [
  "financial",
  "network",
  "expertise",
  "mentorship",
  "connections",
  "partnership",
];

// Column grouping + per-column scroll speed (px of extra translateY across
// the section's full pass through the viewport). Opposite signs = columns
// visibly cross each other while scrolling, matching a classic parallax feel.
const COLUMN_LAYOUT = [
  { speed: -700, keys: ["financial", "mentorship"] },
  { speed: -260, keys: ["expertise", "connections"] },
  { speed: -370, keys: ["network", "partnership"] },
];

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
  const colRefs = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    const cols = colRefs.current.filter(Boolean);
    if (!root || !cols.length) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mm = gsap.matchMedia();

    if (!prefersReduced) {
      mm.add("(min-width: 1025px)", () => {
        const tweens = cols.map((col) => {
          const speed = parseFloat(col.dataset.speed) || 0;
          return gsap.to(col, {
            y: speed,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
              invalidateOnRefresh: true,
            },
          });
        });

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          tweens.forEach((tw) => {
            tw.scrollTrigger?.kill();
            tw.kill();
          });
          gsap.set(cols, { clearProps: "transform" });
        };
      });
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

      {/* Desktop — 3-column vertical parallax */}
      <div className="vprop__parallax">
        {COLUMN_LAYOUT.map((col, i) => (
          <div
            key={i}
            className={`vprop__col vprop__col--${i + 1}`}
            data-speed={col.speed}
            ref={(el) => (colRefs.current[i] = el)}
          >
            {col.keys.map((key) => (
              <PropCard key={key} card={CARDS[key]} />
            ))}
          </div>
        ))}
      </div>

      {/* Tablet / phone — static 2×3 grid */}
      <div className="vprop__compact">
        <div className="vprop-grid--flat">
          {FLAT_ORDER.map((key) => (
            <PropCard key={key} card={CARDS[key]} />
          ))}
        </div>
      </div>
    </section>
  );
}
