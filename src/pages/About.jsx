import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BELIEF_HAND_TIMELINE,
  BELIEF_HAND_POSES,
  lerpPose,
} from "../about/beliefHands.config";
import "../styles/about-page.css";

/* ─────────────────────────────────────────────────────────────
   ABOUT — redesigned secondary page.
   Cursor + progress + magnetic + IO reveals (secondary-page recipe).
   Hero: single-image parallax.
   Belief→Inside: sticky scrub — hands behind cards → twist/meet → exit → Inside.
   Styles: src/styles/about-page.css (.ab-* namespace).
───────────────────────────────────────────────────────────── */

const BELIEFS = [
  {
    num: "01",
    title: "Conviction over credentials.",
    body: "We do not read a resume looking for reasons to say yes. We back the person who already decided, then get out of their way.",
  },
  {
    num: "02",
    title: "Ownership, not employment.",
    body: "You do not come to work for us. You build something that is yours, with our weight behind it from the first day.",
  },
  {
    num: "03",
    title: "The work should be seen.",
    body: "Reputation compounds in the open. We build where people can watch, because proof travels further than any promise.",
  },
  {
    num: "04",
    title: "Patience is the strategy.",
    body: "The best bets look wrong right up until the moment they look obvious. We are built to hold our nerve until that moment arrives.",
  },
];

function CornerTicks({ size = 22 }) {
  const px = typeof size === "number" ? size : parseFloat(size) || 22;
  const offset = -px / 2;
  const style = { width: px, height: px };
  const pos = {
    tl: { top: offset, left: offset },
    tr: { top: offset, right: offset },
    bl: { bottom: offset, left: offset },
    br: { bottom: offset, right: offset },
  };
  return (
    <span className="ab-corner-ticks" aria-hidden="true">
      <img
        className="ab-corner-ticks__tl"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.tl }}
      />
      <img
        className="ab-corner-ticks__tr"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.tr }}
      />
      <img
        className="ab-corner-ticks__bl"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.bl }}
      />
      <img
        className="ab-corner-ticks__br"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.br }}
      />
    </span>
  );
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smoothstep = (t) => t * t * (3 - 2 * t);

export default function About() {
  const heroRafRef = useRef(null);
  const ctaRafRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("is-loaded");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = () => window.innerWidth <= 968;
    const cleanups = [];
    const timers = [];

    /* ── MAGNETIC BUTTONS ──────────────────────────── */
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      const onMove = (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      };
      const onLeave = () => {
        btn.style.transform = "";
      };
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        btn.removeEventListener("mousemove", onMove);
        btn.removeEventListener("mouseleave", onLeave);
      });
    });

    /* ── PROGRESS BAR ──────────────────────────────── */
    const progressBar = document.getElementById("progress");
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBar && total > 0)
        progressBar.style.width = (window.scrollY / total) * 100 + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    cleanups.push(() => window.removeEventListener("scroll", updateProgress));

    /* ── IO REVEALS (pattern H) ─────────────────────── */
    const revealEls = document.querySelectorAll(".ab-reveal");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = parseInt(entry.target.dataset.delay || "0", 10);
          timers.push(
            setTimeout(() => {
              entry.target.classList.add("is-visible");
            }, delay),
          );
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );
    revealEls.forEach((el) => revealObs.observe(el));
    cleanups.push(() => {
      revealObs.disconnect();
      timers.forEach(clearTimeout);
    });

    /* ── HERO MODEL: pointer + idle + scroll parallax ─ */
    const heroSection = document.getElementById("abHero");
    const heroModel = document.getElementById("abHeroModel");
    if (heroSection && heroModel) {
      let ptrX = 0;
      let ptrY = 0;
      let tPtrX = 0;
      let tPtrY = 0;
      let scrollT = 0;
      let scrollC = 0;
      let idleT0 = performance.now();
      let alive = true;

      const onHeroMove = (e) => {
        if (reduceMotion || isMobile()) return;
        const r = heroSection.getBoundingClientRect();
        tPtrX = (e.clientX - r.left - r.width / 2) / r.width;
        tPtrY = (e.clientY - r.top - r.height / 2) / r.height;
      };
      const onHeroLeave = () => {
        tPtrX = 0;
        tPtrY = 0;
      };
      const onHeroScroll = () => {
        const r = heroSection.getBoundingClientRect();
        const h = heroSection.offsetHeight || 1;
        scrollT = clamp01(-r.top / h);
      };

      heroSection.addEventListener("mousemove", onHeroMove);
      heroSection.addEventListener("mouseleave", onHeroLeave);
      window.addEventListener("scroll", onHeroScroll, { passive: true });
      onHeroScroll();

      cleanups.push(() => {
        alive = false;
        heroSection.removeEventListener("mousemove", onHeroMove);
        heroSection.removeEventListener("mouseleave", onHeroLeave);
        window.removeEventListener("scroll", onHeroScroll);
        if (heroRafRef.current) cancelAnimationFrame(heroRafRef.current);
      });

      const tickHero = (now) => {
        if (!alive) return;
        ptrX += (tPtrX - ptrX) * 0.12;
        ptrY += (tPtrY - ptrY) * 0.12;
        scrollC += (scrollT - scrollC) * 0.1;

        const scrollAmp = isMobile() ? -22 : -40;
        let idleY = 0;
        if (!reduceMotion) {
          const cycle = ((now - idleT0) % 4200) / 4200;
          idleY =
            (smoothstep(cycle < 0.5 ? cycle * 2 : 2 - cycle * 2) * 2 - 1) * 8;
        }

        const mx = reduceMotion || isMobile() ? 0 : ptrX * 28;
        const my =
          (reduceMotion || isMobile() ? 0 : ptrY * 18) +
          idleY +
          scrollC * scrollAmp;
        heroModel.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
        heroRafRef.current = requestAnimationFrame(tickHero);
      };
      heroRafRef.current = requestAnimationFrame(tickHero);
    }

    /* ── ORIGIN / MISSION PHOTO PARALLAX ───────────── */
    const parallaxPhotos = [
      { el: document.getElementById("abOriginPhoto"), factor: 0.15 },
      { el: document.getElementById("abMissionPhoto"), factor: 0.12 },
    ].filter((p) => p.el);

    const updatePhotoParallax = () => {
      parallaxPhotos.forEach(({ el, factor }) => {
        const section = el.closest("section");
        if (!section) return;
        const r = section.getBoundingClientRect();
        const p =
          (window.innerHeight / 2 - (r.top + r.height / 2)) /
          window.innerHeight;
        const y = p * factor * 100;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(1.02)`;
      });
    };
    window.addEventListener("scroll", updatePhotoParallax, { passive: true });
    updatePhotoParallax();
    cleanups.push(() =>
      window.removeEventListener("scroll", updatePhotoParallax),
    );

    /* ── BELIEF→INSIDE: sticky scrub — TR/BL belief hands → meet pair → exit ─ */
    const runway = document.getElementById("belief");
    const handTR = document.getElementById("abHandBeliefTR");
    const handBL = document.getElementById("abHandBeliefBL");
    const handH1 = document.getElementById("abHandH1");
    const handH2 = document.getElementById("abHandH2");
    const beliefStage = document.getElementById("abBeliefStage");
    const insideStage = document.getElementById("inside");
    const insideGlow = document.getElementById("abInsideGlow");
    const insideCopy = insideStage?.querySelector(".ab-belief-runway__inside-copy");

    if (runway && handTR && handBL && handH1 && handH2) {
      let alive = true;
      let raf = 0;
      let scrollP = 0;
      let curP = 0;

      [handTR, handBL, handH1, handH2, beliefStage, insideStage, insideGlow, insideCopy]
        .filter(Boolean)
        .forEach((el) => {
          el.style.transition = "none";
        });

      const poseCss = (pose) =>
        `translate3d(${pose.x.toFixed(2)}vw, ${pose.y.toFixed(2)}vh, 0) rotate(${pose.r.toFixed(2)}deg) scale(${pose.s.toFixed(4)})`;

      const applyHand = (el, pose, { sharp = false } = {}) => {
        el.style.transform = poseCss(pose);
        el.style.opacity = String(Math.max(0, pose.op));
        el.style.visibility = pose.op < 0.02 ? "hidden" : "visible";
        const blur = Math.max(0, pose.blur ?? 0);
        if (sharp || blur < 0.2) {
          el.style.filter = "saturate(1.2) brightness(1.05)";
        } else {
          el.style.filter = `blur(${blur.toFixed(2)}px) saturate(1.15) brightness(0.98)`;
        }
      };

      const sample = (p) => {
        const T = BELIEF_HAND_TIMELINE;
        const P = BELIEF_HAND_POSES;
        let tr = P.belief.tr;
        let bl = P.belief.bl;
        let h1 = { ...P.meetMid.h1, op: 0 };
        let h2 = { ...P.meetMid.h2, op: 0 };

        if (p <= T.beliefHoldEnd) {
          tr = P.belief.tr;
          bl = P.belief.bl;
          h1 = { ...P.meetMid.h1, op: 0 };
          h2 = { ...P.meetMid.h2, op: 0 };
        } else if (p <= T.switchEnd) {
          // Same-side vertical switch (no flip):
          // TR slides down the right → H2 (BR)
          // BL slides up the left   → H1 (TL)
          const t = smoothstep(
            clamp01((p - T.beliefHoldEnd) / (T.switchEnd - T.beliefHoldEnd)),
          );

          if (t < 0.5) {
            // First half: belief hands travel toward mid-height
            const u = smoothstep(t * 2);
            tr = lerpPose(P.belief.tr, P.slideMid.tr, u);
            bl = lerpPose(P.belief.bl, P.slideMid.bl, u);
            h1 = { ...P.meetMid.h1, op: 0 };
            h2 = { ...P.meetMid.h2, op: 0 };
          } else if (t < 0.62) {
            // Short handoff at mid-height on each side
            const u = smoothstep((t - 0.5) / 0.12);
            tr = lerpPose(P.slideMid.tr, { ...P.slideMid.tr, op: 0 }, u);
            bl = lerpPose(P.slideMid.bl, { ...P.slideMid.bl, op: 0 }, u);
            h1 = lerpPose({ ...P.meetMid.h1, op: 0 }, P.meetMid.h1, u);
            h2 = lerpPose({ ...P.meetMid.h2, op: 0 }, P.meetMid.h2, u);
          } else {
            // Second half: meet hands finish traveling into clean corners
            const u = smoothstep((t - 0.62) / 0.38);
            tr = { ...P.slideOut.tr, op: 0 };
            bl = { ...P.slideOut.bl, op: 0 };
            h1 = lerpPose(P.meetMid.h1, P.meet.h1, u);
            h2 = lerpPose(P.meetMid.h2, P.meet.h2, u);
          }
        } else if (p <= T.meetHoldEnd) {
          tr = { ...P.slideOut.tr, op: 0 };
          bl = { ...P.slideOut.bl, op: 0 };
          h1 = P.meet.h1;
          h2 = P.meet.h2;
        } else if (p <= T.exitEnd) {
          const t = smoothstep(
            clamp01((p - T.meetHoldEnd) / (T.exitEnd - T.meetHoldEnd)),
          );
          tr = { ...P.slideOut.tr, op: 0 };
          bl = { ...P.slideOut.bl, op: 0 };
          h1 = lerpPose(P.meet.h1, P.exit.h1, t);
          h2 = lerpPose(P.meet.h2, P.exit.h2, t);
        } else {
          tr = { ...P.slideOut.tr, op: 0 };
          bl = { ...P.slideOut.bl, op: 0 };
          h1 = P.exit.h1;
          h2 = P.exit.h2;
        }

        const beliefOp =
          p <= T.beliefHoldEnd
            ? 1
            : 1 -
              smoothstep(
                clamp01(
                  (p - T.beliefHoldEnd) / (T.switchEnd - T.beliefHoldEnd),
                ),
              );

        const insideOp = smoothstep(
          clamp01(
            (p - T.insideStart) / Math.max(T.insideEnd - T.insideStart, 0.01),
          ),
        );

        return { tr, bl, h1, h2, beliefOp, insideOp };
      };

      const apply = (p) => {
        const { tr, bl, h1, h2, beliefOp, insideOp } = sample(p);
        applyHand(handTR, tr);
        applyHand(handBL, bl);
        applyHand(handH1, h1, { sharp: (h1.blur ?? 0) < 0.35 });
        applyHand(handH2, h2, { sharp: (h2.blur ?? 0) < 0.35 });

        if (beliefStage) {
          beliefStage.style.opacity = String(beliefOp);
          beliefStage.style.pointerEvents = beliefOp < 0.08 ? "none" : "auto";
          beliefStage.style.visibility = beliefOp < 0.02 ? "hidden" : "visible";
        }
        if (insideStage) {
          insideStage.style.opacity = String(insideOp);
          insideStage.style.pointerEvents = insideOp < 0.08 ? "none" : "auto";
        }
        if (insideGlow) {
          insideGlow.style.opacity = String(insideOp * 0.95);
          insideGlow.style.transform = `translate(-50%, -50%) scale(${(0.88 + insideOp * 0.18).toFixed(3)})`;
        }
        if (insideCopy) {
          const py = (1 - insideOp) * 36;
          insideCopy.style.opacity = String(insideOp);
          insideCopy.style.transform = `translate3d(0, ${py.toFixed(2)}px, 0)`;
        }

        const T = BELIEF_HAND_TIMELINE;
        runway.dataset.phase =
          p < T.switchEnd
            ? p < T.beliefHoldEnd
              ? "belief"
              : "switch"
            : p < T.meetHoldEnd
              ? "meet"
              : p < T.exitEnd
                ? "exit"
                : "inside";
      };

      const readScroll = () => {
        const rect = runway.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const travel = Math.max(rect.height - vh, 1);
        scrollP = clamp01(-rect.top / travel);
      };

      if (reduceMotion) {
        applyHand(handTR, BELIEF_HAND_POSES.belief.tr);
        applyHand(handBL, BELIEF_HAND_POSES.belief.bl);
        applyHand(handH1, { ...BELIEF_HAND_POSES.meet.h1, op: 0 });
        applyHand(handH2, { ...BELIEF_HAND_POSES.meet.h2, op: 0 });
        if (beliefStage) {
          beliefStage.style.opacity = "1";
          beliefStage.style.visibility = "visible";
        }
        if (insideStage) insideStage.style.opacity = "1";
        if (insideGlow) {
          insideGlow.style.opacity = "0.9";
          insideGlow.style.transform = "translate(-50%, -50%) scale(1)";
        }
        if (insideCopy) {
          insideCopy.style.opacity = "1";
          insideCopy.style.transform = "none";
        }
      } else {
        const tick = () => {
          if (!alive) return;
          curP += (scrollP - curP) * 0.12;
          if (Math.abs(scrollP - curP) < 0.0004) curP = scrollP;
          apply(curP);
          raf = requestAnimationFrame(tick);
        };

        readScroll();
        apply(0);
        window.addEventListener("scroll", readScroll, { passive: true });
        window.addEventListener("resize", readScroll, { passive: true });
        raf = requestAnimationFrame(tick);

        cleanups.push(() => {
          alive = false;
          if (raf) cancelAnimationFrame(raf);
          window.removeEventListener("scroll", readScroll);
          window.removeEventListener("resize", readScroll);
        });
      }
    }

    /* ── FINAL CTA headline parallax ────────────────── */
    const finalCta = document.getElementById("cta");
    const finalHeadline = document.getElementById("abCtaHeadline");
    if (finalCta && finalHeadline && !reduceMotion) {
      let fX = 0;
      let fY = 0;
      let tX = 0;
      let tY = 0;
      let alive = true;

      const onMove = (e) => {
        if (isMobile()) return;
        const r = finalCta.getBoundingClientRect();
        tX = (e.clientX - r.left - r.width / 2) / r.width;
        tY = (e.clientY - r.top - r.height / 2) / r.height;
      };
      const onLeave = () => {
        tX = 0;
        tY = 0;
      };
      finalCta.addEventListener("mousemove", onMove);
      finalCta.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        alive = false;
        finalCta.removeEventListener("mousemove", onMove);
        finalCta.removeEventListener("mouseleave", onLeave);
        if (ctaRafRef.current) cancelAnimationFrame(ctaRafRef.current);
      });

      const animateFinal = () => {
        if (!alive) return;
        fX += (tX - fX) * 0.08;
        fY += (tY - fY) * 0.08;
        finalHeadline.style.transform = `translate(${fX * 18}px, ${fY * 10}px)`;
        ctaRafRef.current = requestAnimationFrame(animateFinal);
      };
      ctaRafRef.current = requestAnimationFrame(animateFinal);
    }

    return () => {
      document.body.classList.remove("is-loaded");
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <div className="progress" id="progress" />

      {/* ═══════════════ HERO ═══════════════
          Layout matches Figma: model as visual plane, copy overlaid on center */}
      <section className="ab-hero" id="abHero">
        <div className="ab-hero__model-wrap" aria-hidden="true">
          <img
            id="abHeroModel"
            className="ab-hero__model"
            src="/assets/about/hero-model.png"
            alt=""
            width="674"
            height="562"
          />
        </div>
        <div className="ab-hero__inner">
          <h1 className="ab-hero__headline ab-reveal" data-delay="0">
            We back the founders the system was never built for.
          </h1>
          <p className="ab-hero__sub ab-reveal" data-delay="120">
            This is not the pitch. This is who we are, why we started, and what
            we believe about the people who choose to build.
          </p>
        </div>
      </section>

      {/* ═══════════════ ORIGIN ═══════════════ */}
      <section className="ab-origin" id="origin">
        <div className="ab-origin__photo-wrap" aria-hidden="true">
          <img
            id="abOriginPhoto"
            className="ab-origin__photo"
            src="/assets/about/origin-landscape.png"
            alt=""
          />
          <div className="ab-origin__photo-scrim" />
          <div className="ab-origin__grid" />
        </div>
        <div className="ab-origin__inner">
          <div className="ab-origin__copy">
            <p
              className="ab-eyebrow ab-origin__eyebrow ab-reveal"
              data-delay="0"
            >
              THE ORIGIN
            </p>
            <h2 className="ab-origin__headline ab-reveal" data-delay="120">
              It started with a simple frustration.
            </h2>
            <p className="ab-origin__body ab-reveal" data-delay="200">
              Talent is everywhere. Backing is not. For every founder handed the
              room, the capital, and the benefit of the doubt, there are a
              hundred with the same fire and none of the access. People with
              everything it takes to build, and a life that makes betting on it
              feel impossible.
            </p>
            <p className="ab-origin__body ab-reveal" data-delay="280">
              Persist Foundry was built to close that gap. Not another fund
              competing for the founders everyone already wants, but a studio
              that goes to the ones the system overlooked and hands them what
              they were missing. We do not wait for permission to back people.
              We decided to be the permission.
            </p>
          </div>

          <aside className="ab-quote-card ab-reveal" data-delay="360">
            <CornerTicks />
            <img
              className="ab-quote-card__avatar"
              src="/assets/about/origin-landscape.png"
              alt="Jack Jay"
              width="56"
              height="56"
            />
            <blockquote className="ab-quote-card__quote">
              We do not hand you a map. We hand you a team, a stake, and a
              reason to move faster than you thought you could.
            </blockquote>
            <div className="ab-quote-card__meta">
              <a
                className="ab-quote-card__name"
                href="https://www.linkedin.com/in/jack-jay-jackson-jesionowski/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Jack Jay on LinkedIn"
              >
                Jack Jay
                <svg
                  className="ab-quote-card__li"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <span className="ab-quote-card__role">
                Founder, Persist Ventures
              </span>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════════ BELIEF → INSIDE (sticky hand scrub) ═══════════════ */}
      <section className="ab-belief-runway" id="belief">
        <div className="ab-belief-runway__pin">
          <div className="ab-belief-runway__hands" aria-hidden="true">
            {/* Belief diagonal: top-right + bottom-left (section start) */}
            <img
              id="abHandBeliefTR"
              className="ab-belief-runway__hand ab-belief-runway__hand--tr"
              src="/assets/about/hand-belief-tr.png"
              alt=""
              draggable="false"
            />
            <img
              id="abHandBeliefBL"
              className="ab-belief-runway__hand ab-belief-runway__hand--bl"
              src="/assets/about/hand-belief-bl.png"
              alt=""
              draggable="false"
            />
            {/* Meet diagonal: top-left + bottom-right (twist → exit) */}
            <img
              id="abHandH1"
              className="ab-belief-runway__hand ab-belief-runway__hand--h1"
              src="/assets/about/hand-h1.png"
              alt=""
              draggable="false"
            />
            <img
              id="abHandH2"
              className="ab-belief-runway__hand ab-belief-runway__hand--h2"
              src="/assets/about/hand-h2.png"
              alt=""
              draggable="false"
            />
          </div>

          <div className="ab-belief-runway__belief" id="abBeliefStage">
            <div className="ab-inner ab-belief-runway__belief-inner">
              <p className="ab-eyebrow ab-reveal" data-delay="0">
                WHAT WE BELIEVE
              </p>
              <h2 className="ab-belief__headline ab-reveal" data-delay="100">
                Four things we hold to be true.
              </h2>
              <div className="ab-belief__grid">
                {BELIEFS.map((card, i) => (
                  <article
                    className="ab-belief-card ab-reveal"
                    key={card.num}
                    data-delay={String(i * 150)}
                  >
                    <CornerTicks size={16} />
                    <span className="ab-belief-card__num">{card.num}</span>
                    <h3 className="ab-belief-card__title">{card.title}</h3>
                    <p className="ab-belief-card__body">{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="ab-belief-runway__inside" id="inside">
            <img
              id="abInsideGlow"
              className="ab-belief-runway__inside-glow"
              src="/assets/about/inside-glow.png"
              alt=""
              draggable="false"
            />
            <div className="ab-belief-runway__inside-copy">
              <p className="ab-eyebrow ab-eyebrow--center ab-inside__eyebrow">
                INSIDE THE STUDIO
              </p>
              <h2 className="ab-inside__headline">
                What it is like to build here.
              </h2>
              <p className="ab-inside__body">
                From the first day you are surrounded by people doing the same
                hard thing. Operators who have shipped, advisors who have
                scaled, and founders one step ahead who remember exactly where
                you are standing. The standard is high and the feedback is
                direct, because we would rather tell you the truth early than
                watch you learn it late.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MISSION ═══════════════ */}
      <section className="ab-mission" id="mission">
        <div className="ab-mission__photo-wrap" aria-hidden="true">
          <picture>
            <source
              type="image/webp"
              srcSet="/assets/about/mission-team-4x.webp"
            />
            <img
              id="abMissionPhoto"
              className="ab-mission__photo"
              src="/assets/about/mission-team-4x.webp"
              alt=""
              width={3200}
              height={1480}
              decoding="async"
              fetchPriority="low"
            />
          </picture>
          <div className="ab-mission__overlay" />
        </div>
        <div className="ab-mission__content">
          <p className="ab-eyebrow ab-eyebrow--center ab-reveal" data-delay="0">
            THE MISSION
          </p>
          <h2 className="ab-mission__headline ab-reveal" data-delay="120">
            A generation of founders who would never have started.
          </h2>
          <p className="ab-mission__body ab-reveal" data-delay="220">
            Every seat we fill is a company that would not exist otherwise. That
            is the whole point. We are here to make founders out of the people
            the world was about to miss, one bet at a time, for as long as it
            takes.
          </p>
        </div>
      </section>
    </>
  );
}
