import { useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import "../foundry/foundry.css";
import initFoundry from "../foundry/engine";
import FilterSection from "../components/FilterSection";
import ScrollFloat from "../components/ScrollFloat";
import UnfairStartSection from "../components/UnfairStartSection";

const FinalCtaSection = lazy(() => import("../components/FinalCtaSection"));

/* ============================================================
   PERSIST FOUNDRY — alternative cinematic landing.
   1:1 port of the static design (persist-foundry-site). The full
   experience (scroll-scrubbed frame sequence + Three.js finale +
   loader/cursor) lives in ../foundry/engine.js.
   Shared Navbar comes from App layout; Footer lives in the
   scroll-track so it paints above the fixed cinematic stage.
   ============================================================ */
export default function Foundry() {
  const rootRef = useRef(null);
  const ctaRevealRef = useRef(null);
  const asideRevealRef = useRef(null);

  useEffect(() => {
    // useEffect already runs after the DOM is committed/laid out, so the
    // engine can measure the canvas immediately — no rAF defer (a deferred
    // init can get canceled by StrictMode/Fast-Refresh churn before it fires).
    document.body.classList.add("pf-landing");
    const cleanup = initFoundry({ base: "/foundry" });

    // Full-viewport sticky cards: pure CSS stack (increasing z-index).
    // No transform recess — next card rises from below and covers the prior one.
    const stackCards = Array.from(
      document.querySelectorAll("#pfolioStack .pfolio-card"),
    );
    stackCards.forEach((card) => {
      card.style.transform = "";
      card.style.filter = "";
    });

    // Sync section background thumb + hide passed sticky cards (no text stack)
    const section = document.getElementById("portfolio");
    const slides = section
      ? Array.from(section.querySelectorAll(".pfolio__bg-slide"))
      : [];
    let activeIdx = -1;
    let raf = 0;

    const setActive = (idx) => {
      if (idx === activeIdx || idx < 0 || idx >= stackCards.length) return;
      activeIdx = idx;
      stackCards.forEach((card, i) => {
        const isActive = i === idx;
        const isPassed = i < idx;
        card.classList.toggle("is-active", isActive);
        card.classList.toggle("is-passed", isPassed);
        card.setAttribute("aria-hidden", isPassed ? "true" : "false");
        card.inert = isPassed;
      });
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === idx);
      });
    };

    const syncActiveFromScroll = () => {
      raf = 0;
      if (!stackCards.length) return;

      // Mobile / tablet: static cards — no sticky handoff or bg-swap animation
      const stickyDesktop = window.matchMedia("(min-width: 1025px)").matches;
      if (!stickyDesktop) {
        if (activeIdx !== -1) {
          activeIdx = -1;
          stackCards.forEach((card) => {
            card.classList.remove("is-passed");
            card.classList.remove("is-active");
            card.inert = false;
            card.removeAttribute("aria-hidden");
          });
          // Keep first slide lit so desktop resize back in is predictable
          slides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === 0);
          });
        }
        return;
      }

      // Slightly earlier than mid-stick so the fade starts before bodies collide
      const switchLine = Math.round(window.innerHeight * 0.58);
      let next = 0;
      stackCards.forEach((card, i) => {
        if (card.getBoundingClientRect().top <= switchLine) next = i;
      });
      setActive(next);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(syncActiveFromScroll);
    };

    syncActiveFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // Foundry also drives scroll via ScrollTrigger — keep in sync on those ticks
    const onStUpdate = () => onScroll();
    gsap.ticker.add(onStUpdate);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      gsap.ticker.remove(onStUpdate);
      stackCards.forEach((card) => {
        card.inert = false;
        card.removeAttribute("aria-hidden");
      });
      cleanup();
      document.body.classList.remove("pf-landing");
    };
  }, []);

  // Soft line-rise for hero CTA + aside — plays once after loader, after headline starts
  useEffect(() => {
    const ctaInner = ctaRevealRef.current;
    const asideInner = asideRevealRef.current;
    if (!ctaInner || !asideInner) return;

    gsap.set([ctaInner, asideInner], { yPercent: 115, opacity: 0 });

    let tl = null;
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(ctaInner, { yPercent: 0, opacity: 1, duration: 0.85 }, 0.5).to(
        asideInner,
        { yPercent: 0, opacity: 1, duration: 0.95 },
        0.72,
      );
    };

    const loaderDone = document.querySelector(".pf-loader.done");
    let fallback = 0;
    if (loaderDone) {
      play();
    } else {
      document.addEventListener("pf:ready", play, { once: true });
      fallback = window.setTimeout(play, 2800);
    }

    return () => {
      document.removeEventListener("pf:ready", play);
      if (fallback) window.clearTimeout(fallback);
      if (tl) tl.kill();
      else gsap.killTweensOf([ctaInner, asideInner]);
    };
  }, []);

  return (
    <div className="pf" ref={rootRef}>
      {/* ===================== LOADER ===================== */}
      <div className="pf-loader" id="loader">
        <div className="loader__mark">Persist</div>
        <div className="loader__bar">
          <i id="loaderBar" />
        </div>
        <div className="loader__pct" id="loaderPct">
          000
        </div>
      </div>

      {/* ===================== FIXED STAGE ===================== */}
      <div className="stage">
        <canvas id="hero-canvas" />
        <canvas id="three-canvas" />
        <div className="stage-fade" id="stageFade" />
        {/* Covers the baked center flare on Backstory; lifts when Five Ways enters */}
        <div
          className="stage-flare-mask"
          id="stageFlareMask"
          aria-hidden="true"
        />
      </div>

      {/* persistent Persist mark: center anchor -> glides to nav */}
      <div className="persist-logo" id="persistLogo">
        <img src="/foundry/logo/persist-logo.svg" alt="Persist" />
      </div>

      {/* ===================== SCROLL TRACK / BEATS ===================== */}
      <main className="scroll-track" id="scrollTrack">
        {/* BEAT 1 — HERO */}
        <section className="beat beat--hero" data-beat="0" id="hero">
          <div className="beat__scrim" />
          <div className="beat__inner beat__inner--hero">
            <div className="hero-primary">
              <ScrollFloat
                as="h1"
                containerClassName="hero-scroll-float"
                textClassName="hero-scroll-float-text"
                animationDuration={1}
                ease="back.out(0.7)"
                scrollStart="top bottom"
                stagger={0.012}
                yPercentFrom={55}
                scaleYFrom={1.35}
                scaleXFrom={0.9}
                playOnce
              >
                {"Back yourself to\nwin\u00A0big."}
              </ScrollFloat>
              <div className="hero-cta-reveal">
                <Link
                  ref={ctaRevealRef}
                  className="btn-primary hero-cta-reveal__inner"
                  to="/fellowship-program-application"
                  data-magnetic
                >
                  Apply for Fellowship
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    width="15"
                    height="15"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
            <p className="hero-aside" data-copy="hero-lead">
              <span ref={asideRevealRef} className="hero-aside-reveal__inner">
                Capital, structure, and a team that helps you become the company
                you set out to build.
              </span>
            </p>
          </div>
        </section>

        {/* BEAT 2 — BACKED BY TETHER */}
        <section className="beat beat--center" data-beat="1" id="tether">
          <div className="beat__scrim" />
          <div className="beat__inner beat__inner--wide">
            <div className="lockup">
              <div className="lockup__top">
                <h2 className="lockup__heading">
                  Funded by the
                  <br />
                  founders of
                </h2>
                <div className="lockup__primary">
                  <a
                    className="lockup__link"
                    href="https://tether.to/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Tether"
                  >
                    <img
                      className="logo-swap"
                      src="/foundry/logo/tether.png"
                      alt="Tether"
                      data-fallback="tether"
                    />
                  </a>
                </div>
              </div>
              <div className="lockup__row">
                <a
                  className="lockup__link"
                  href="https://dna.fund/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="DNA Fund"
                >
                  <img
                    className="logo-swap"
                    src="/foundry/logo/dna.png"
                    alt="DNA Fund"
                    data-fallback="DNA"
                  />
                </a>
                <a
                  className="lockup__link"
                  href="https://www.blockchainff.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Blockchain Founders Fund"
                >
                  <img
                    className="logo-swap"
                    src="/foundry/logo/bff.png"
                    alt="Blockchain Founders Fund"
                    data-fallback="Blockchain Founders Fund"
                  />
                </a>
                <a
                  className="lockup__link"
                  href="https://percival.vc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Percival"
                >
                  <img
                    className="logo-swap"
                    src="/foundry/logo/percival.png"
                    alt="Percival"
                    data-fallback="PERCIVAL"
                  />
                </a>
                <a
                  className="lockup__link"
                  href="https://welara.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Welara"
                >
                  <img
                    className="logo-swap"
                    src="/foundry/logo/welara.png"
                    alt="Welara"
                    data-fallback="Welara"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* BEAT 3 — THRESHOLD / BACKSTORY */}
        <section className="beat beat--center" data-beat="2" id="threshold">
          <div className="beat__scrim" />
          <div className="beat__inner beat__inner--threshold">
            <div className="threshold-copy">
              <p className="threshold-eyebrow">Backstory</p>
              <h2 className="display display--backstory">
                Building alongside
                <br />
                founders
              </h2>
              <p className="threshold-body" data-copy="threshold-lead">
                Persist began in 2016 to rethink founder support — inspired by
                Thiel, and open to everyone. What started as a PayPal-to-Ethereum
                exchange became the model. Nine years on, we stay founder-first
                and hands-on, having built 30 companies alongside the people
                who lead them.
              </p>
            </div>

            <div
              className="threshold-stats"
              aria-label="Persist by the numbers"
            >
              <article className="bcard">
                <img
                  className="bcard__cross bcard__cross--tl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--tr"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--bl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--br"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <div className="bcard__label">
                  <img
                    className="bcard__cross bcard__cross--ml"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="bcard__cross bcard__cross--mr"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  Companies
                  <br />
                  launched
                </div>
                <div className="bcard__value">
                  <span className="stat__num">30+</span>
                </div>
              </article>
              <article className="bcard">
                <img
                  className="bcard__cross bcard__cross--tl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--tr"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--bl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--br"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <div className="bcard__label">
                  <img
                    className="bcard__cross bcard__cross--ml"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="bcard__cross bcard__cross--mr"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  Net Asset
                  <br />
                  Value
                </div>
                <div className="bcard__value">
                  <span className="stat__num">$117M</span>
                </div>
              </article>
              <article className="bcard">
                <img
                  className="bcard__cross bcard__cross--tl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--tr"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--bl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--br"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <div className="bcard__label">
                  <img
                    className="bcard__cross bcard__cross--ml"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="bcard__cross bcard__cross--mr"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  Advisor
                  <br />
                  network
                </div>
                <div className="bcard__value">
                  <span className="stat__num">400+</span>
                </div>
              </article>
              <article className="bcard">
                <img
                  className="bcard__cross bcard__cross--tl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--tr"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--bl"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <img
                  className="bcard__cross bcard__cross--br"
                  src="/assets/plus-icon.svg"
                  alt=""
                  aria-hidden="true"
                />
                <div className="bcard__label">
                  <img
                    className="bcard__cross bcard__cross--ml"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="bcard__cross bcard__cross--mr"
                    src="/assets/plus-icon.svg"
                    alt=""
                    aria-hidden="true"
                  />
                  Portfolio
                  <br />
                  impressions
                </div>
                <div className="bcard__value">
                  <span className="stat__num">67B</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* FINALE SPACER — orbit lives here; extra height so the P-dock can breathe */}
        <section
          className="beat beat--center"
          data-beat="4"
          id="orbit"
          style={{ minHeight: "320vh" }}
        >
          <div
            className="beat__inner"
            style={{ opacity: 1, transform: "none" }}
          >
            <p
              className="eyebrow"
              id="orbitEyebrow"
              style={{ marginTop: "8vh" }}
            >
              Five ways we forge
            </p>
          </div>
        </section>

        {/* Dock settle runway — keeps the mark parked in the nav a beat longer */}
        <div className="dock-settle" aria-hidden="true" />

        {/* PORTFOLIO — sticky left copy + stacking cards over live project bg */}
        <section className="pfolio" id="portfolio">
          <div className="pfolio__atmosphere" aria-hidden="true">
            <div className="pfolio__bg">
              <div
                className="pfolio__bg-slide is-active"
                data-bg="0"
                style={{
                  "--pfolio-thumb": "url(/assets/opendroid-thumbnail.webp)",
                }}
              />
              <div
                className="pfolio__bg-slide"
                data-bg="1"
                style={{
                  "--pfolio-thumb": "url(/assets/facesearch-ai-thumbnail.webp)",
                }}
              />
              <div
                className="pfolio__bg-slide"
                data-bg="2"
                style={{
                  "--pfolio-thumb": "url(/assets/swissmote-thimbnaail.webp)",
                }}
              />
            </div>
            <div className="pfolio__glass" />
          </div>

          <div className="pfolio__inner">
            <div className="pfolio__layout">
              <aside className="pfolio__aside">
                <div className="pfolio__aside-inner">
                  <h2 className="pfolio__title">Turning Ideas Into Impact.</h2>
                  <Link className="pfolio__cta" to="/portfolio">
                    View Portfolio <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </aside>

              <div className="pfolio-stack" id="pfolioStack">
                <article
                  className="pfolio-card is-active"
                  data-row="0"
                  style={{
                    "--pfolio-thumb": "url(/assets/opendroid-thumbnail.webp)",
                  }}
                >
                  <a
                    className="pfolio-card__media"
                    href="https://opendroids.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Explore Open Droids"
                  >
                    <img
                      className="pfolio-card__thumb"
                      src="/assets/opendroid-thumbnail.webp"
                      alt="Open Droids"
                      loading="lazy"
                    />
                  </a>
                  <div className="pfolio-card__body">
                    <h3 className="pfolio-card__name">Open Droids</h3>
                    <div className="pfolio-card__meta">
                      <p className="pfolio-card__desc">
                        Home robots that earn their keep. Built by someone who
                        got tired of waiting for the future to arrive.
                      </p>
                      <a
                        className="pfolio-card__explore"
                        href="https://opendroids.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Explore Project <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </article>

                <article
                  className="pfolio-card"
                  data-row="1"
                  style={{
                    "--pfolio-thumb":
                      "url(/assets/facesearch-ai-thumbnail.webp)",
                  }}
                >
                  <a
                    className="pfolio-card__media"
                    href="https://facesearchai.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Explore Face Search"
                  >
                    <img
                      className="pfolio-card__thumb"
                      src="/assets/facesearch-ai-thumbnail.webp"
                      alt="Face Search AI"
                      loading="lazy"
                    />
                  </a>
                  <div className="pfolio-card__body">
                    <h3 className="pfolio-card__name">Face Search</h3>
                    <div className="pfolio-card__meta">
                      <p className="pfolio-card__desc">
                        Find every place your face lives online. Built by
                        someone who couldn&apos;t sleep until the problem was
                        solved.
                      </p>
                      <a
                        className="pfolio-card__explore"
                        href="https://facesearchai.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Explore Project <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </article>

                <article
                  className="pfolio-card"
                  data-row="2"
                  style={{
                    "--pfolio-thumb": "url(/assets/swissmote-thimbnaail.webp)",
                  }}
                >
                  <a
                    className="pfolio-card__media"
                    href="https://swissmote.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Explore Swissmote"
                  >
                    <img
                      className="pfolio-card__thumb"
                      src="/assets/swissmote-thimbnaail.webp"
                      alt="Swissmote"
                      loading="lazy"
                    />
                  </a>
                  <div className="pfolio-card__body">
                    <h3 className="pfolio-card__name">Swissmote</h3>
                    <div className="pfolio-card__meta">
                      <p className="pfolio-card__desc">
                        Hiring the world&apos;s most overlooked builders. Built
                        by someone who heard &quot;no&quot; so many times he
                        rewrote the rules.
                      </p>
                      <a
                        className="pfolio-card__explore"
                        href="https://swissmote.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Explore Project <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPS — horizontal 2-slide unfair-start cards */}
        <UnfairStartSection />

        {/* FILTER — Apply if / Don't apply if */}
        <FilterSection />

        {/* orbit / arm detail panel (scroll-driven + hover) */}
        <div className="portfolio-detail" id="armDetail">
          <div className="portfolio-detail__content" id="armContent">
            <div className="portfolio-detail__head" id="armHead">
              <span
                className="portfolio-detail__icon"
                id="armIcon"
                aria-hidden="true"
              />
              <h4 id="armTitle">Accelerator</h4>
            </div>
            <ul className="portfolio-detail__list" id="armList" />
          </div>
          <p id="armBody" hidden />
          <span className="kicker" id="armKicker" hidden>
            Persist
          </span>
        </div>

        <Suspense fallback={null}>
          <FinalCtaSection footer={true} />
        </Suspense>
      </main>

      {/* scroll cue */}
      <div className="scroll-cue" id="scrollCue">
        <span>Scroll</span>
        <span className="scroll-cue__line" />
      </div>
    </div>
  );
}
