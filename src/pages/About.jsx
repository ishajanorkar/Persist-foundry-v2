import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  INSIDE_HAND_TIMELINE,
  getInsideHandPreset,
} from "../about/insideHands.config";

/* ─────────────────────────────────────────────────────────────
   ABOUT — redesigned secondary page.
   Cursor + progress + magnetic + IO reveals (secondary-page recipe).
   Hero: single-image parallax. Inside: scroll-driven hand meet.
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

const DIVISIONS = [
  {
    label: "ECOSYSTEM CAPITAL",
    title: "Persist Ventures",
    body: "Our core investment arm focusing on seed and early-stage capital. Ventures acts as the strategic backbone, funding companies emerging from the foundry.",
    linkLabel: "Go to Capital",
    href: "https://persistventures.co/",
  },
  {
    label: "CO-CREATION HIVE",
    title: "Persist Foundry",
    body: "The execution studio. Where developers, marketing leads, and experienced operators sit alongside you in active development, building your product.",
    linkLabel: "Inside look",
    to: "/",
  },
  {
    label: "CORE R&D",
    title: "Persist Studio",
    body: "Our advanced laboratory researching next-generation machine intelligence and decentralized protocol systems, ensuring your venture uses bleeding-edge tech.",
    linkLabel: "Explore Labs",
    href: "#",
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
  const cursorRafRef = useRef(null);
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

    /* ── CUSTOM CURSOR ─────────────────────────────── */
    const cursor = document.getElementById("cursor");
    let cursorX = 0;
    let cursorY = 0;
    let targetX = 0;
    let targetY = 0;

    const trackMouse = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    document.addEventListener("mousemove", trackMouse);
    cleanups.push(() => document.removeEventListener("mousemove", trackMouse));

    const tickCursor = () => {
      cursorX += (targetX - cursorX) * 0.18;
      cursorY += (targetY - cursorY) * 0.18;
      if (cursor) {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      }
      cursorRafRef.current = requestAnimationFrame(tickCursor);
    };
    cursorRafRef.current = requestAnimationFrame(tickCursor);
    cleanups.push(() => {
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current);
    });

    document.querySelectorAll("a, button").forEach((el) => {
      const enter = () => cursor?.classList.add("is-hover");
      const leave = () => cursor?.classList.remove("is-hover");
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    });

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
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(1.08)`;
      });
    };
    window.addEventListener("scroll", updatePhotoParallax, { passive: true });
    updatePhotoParallax();
    cleanups.push(() =>
      window.removeEventListener("scroll", updatePhotoParallax),
    );

    /* ── INSIDE: scroll-driven hand meet (HeroWebGL motion) ─ */
    const inside = document.getElementById("inside");
    const handLeft = document.getElementById("abHandLeft");
    const handRight = document.getElementById("abHandRight");
    const contactGlow = document.getElementById("abHandGlow");

    if (inside && handLeft && handRight) {
      let handsAlive = true;
      let handsRaf = 0;
      let scrollP = 0;
      let handsCur = 0;

      handLeft.style.transition = "none";
      handRight.style.transition = "none";

      const readScroll = () => {
        const rect = inside.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const travel = Math.max(rect.height - vh, vh * 0.5);
        scrollP = clamp01((vh - rect.top) / (travel + vh));
      };

      const applyHands = (hands) => {
        const preset = getInsideHandPreset(window.innerWidth);
        const halfW = Math.min(window.innerWidth, inside.offsetWidth) * 0.5;
        const startPx = preset.handStartX * halfW;
        const travelPx = preset.handTravel * halfW;
        const ox = startPx - travelPx * hands;

        // #abHandLeft = bottom-right; #abHandRight = top-left
        handLeft.style.transform = `translate3d(${ox.toFixed(2)}px, ${ox.toFixed(2)}px, 0)`;
        handRight.style.transform = `translate3d(${(-ox).toFixed(2)}px, ${(-ox).toFixed(2)}px, 0)`;
        const op = 0.6 + 0.4 * hands;
        handLeft.style.opacity = String(op);
        handRight.style.opacity = String(op);
        if (contactGlow) {
          contactGlow.style.opacity =
            hands > 0.85 ? String(((hands - 0.85) / 0.15) * 0.7) : "0";
        }
      };

      if (reduceMotion) {
        applyHands(1);
      } else {
        const tickHands = () => {
          if (!handsAlive) return;
          const target = smoothstep(
            clamp01(scrollP / INSIDE_HAND_TIMELINE.handsEnd),
          );
          handsCur += (target - handsCur) * 0.12;
          if (Math.abs(target - handsCur) < 0.0004) handsCur = target;
          applyHands(handsCur);
          handsRaf = requestAnimationFrame(tickHands);
        };

        readScroll();
        applyHands(0);
        window.addEventListener("scroll", readScroll, { passive: true });
        window.addEventListener("resize", readScroll, { passive: true });
        handsRaf = requestAnimationFrame(tickHands);

        cleanups.push(() => {
          handsAlive = false;
          if (handsRaf) cancelAnimationFrame(handsRaf);
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
      <div className="cursor" id="cursor" />
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
              <span className="ab-quote-card__name">Jack Jay</span>
              <span className="ab-quote-card__role">
                Founder, Persist Ventures
              </span>
            </div>
          </aside>
        </div>
      </section>

      {/* ═══════════════ BELIEF ═══════════════ */}
      <section className="ab-belief" id="belief">
        <div className="ab-inner">
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
      </section>

      {/* ═══════════════ INSIDE ═══════════════ */}
      <section className="ab-inside" id="inside">
        <div className="ab-inside__hands" aria-hidden="true">
          <img
            id="abHandRight"
            className="ab-inside__hand ab-inside__hand--right"
            src="/assets/h1.png"
            alt=""
          />
          <img
            id="abHandLeft"
            className="ab-inside__hand ab-inside__hand--left"
            src="/assets/h2.png"
            alt=""
          />
        </div>
        <div className="ab-inside__content">
          <div className="ab-inside__panel">
            <p
              className="ab-eyebrow ab-eyebrow--center ab-inside__eyebrow ab-reveal"
              data-delay="280"
            >
              INSIDE THE STUDIO
            </p>
            <h2 className="ab-inside__headline ab-reveal" data-delay="380">
              What it is like to build here.
            </h2>
            <p className="ab-inside__body ab-reveal" data-delay="480">
              From the first day you are surrounded by people doing the same
              hard thing. Operators who have shipped, advisors who have scaled,
              and founders one step ahead who remember exactly where you are
              standing. The standard is high and the feedback is direct, because
              we would rather tell you the truth early than watch you learn it
              late.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ PEOPLE & DIVISIONS ═══════════════ */}
      <section className="ab-people" id="people">
        <div className="ab-inner">
          <p className="ab-eyebrow ab-reveal" data-delay="0">
            THE PEOPLE &amp; DIVISIONS
          </p>
          <h2 className="ab-people__headline ab-reveal" data-delay="100">
            Part of something larger.
          </h2>
          <div className="ab-people__grid">
            {DIVISIONS.map((col, i) => (
              <div
                className="ab-people-col ab-reveal"
                key={col.title}
                data-delay={String(i * 150)}
              >
                <CornerTicks size={16} />
                <p className="ab-people-col__label">{col.label}</p>
                <h3 className="ab-people-col__title">{col.title}</h3>
                <p className="ab-people-col__body">{col.body}</p>
                {col.to ? (
                  <Link
                    className="ab-people-col__link"
                    to={col.to}
                    data-magnetic
                  >
                    {col.linkLabel} <span aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <a
                    className="ab-people-col__link"
                    href={col.href}
                    data-magnetic
                    {...(col.href?.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {col.linkLabel} <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MISSION ═══════════════ */}
      <section className="ab-mission" id="mission">
        <div className="ab-mission__photo-wrap" aria-hidden="true">
          <img
            id="abMissionPhoto"
            className="ab-mission__photo"
            src="/assets/team.png"
            alt=""
          />
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

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="ab-cta" id="cta">
        <div className="ab-cta__inner">
          <p className="ab-eyebrow ab-reveal" data-delay="0">
            NOW YOU KNOW US
          </p>
          <h2 className="ab-cta__headline ab-reveal" data-delay="100">
            So, are you one of us?
          </h2>
          <p className="ab-cta__body ab-reveal" data-delay="180">
            If any of this sounded like you, you already have your answer.
          </p>
          <Link
            className="ab-cta__link ab-reveal"
            to="/#apply"
            data-magnetic
            data-delay="260"
          >
            Become A Founder <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
