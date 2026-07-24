import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────
   UNFAIR START — desktop: sticky panel + 1:1 horizontal scrub
   (2 slides). No GSAP pin — avoids overflow-x / reverse-scroll stick.
   Tablet/phone (≤1024): single header + 2×3 grid of all cards.
───────────────────────────────────────────────────────────── */

const SLIDES = [
  {
    id: 'unfair',
    layout: 'down',
    titleLead: 'We Hand Founders',
    titleTrail: 'An',
    titleSub: 'Unfair Start.',
    cards: [
      {
        title: 'Financial Freedom',
        body: [
          'Funding and a monthly salary so you can',
          'build full time from the very first day.',
        ],
        icon: '/foundry/value-props/icon-financial.png',
        alt: 'Metallic coin with dollar mark',
      },
      {
        title: 'Founder Network',
        body: [
          'A close-knit group of ambitious founders',
          'building alongside you through every stage.',
        ],
        icon: '/foundry/value-props/icon-network.png',
        alt: 'Network pedestal diagram',
      },
      {
        title: 'Embedded Expertise',
        body: [
          'Builders, designers, and recruiters embedded',
          'in your venture until it stands on its own.',
        ],
        icon: '/foundry/value-props/icon-expertise.png',
        alt: 'Glowing expertise cube',
      },
    ],
  },
  {
    id: 'stay',
    layout: 'up',
    showHeader: false,
    titleLead: 'We Hand Founders',
    titleTrail: 'An',
    titleSub: 'Unfair Start.',
    cards: [
      {
        title: 'Proven Mentorship',
        body: [
          'Experienced founders and operators in your corner',
          'whenever you need guidance.',
        ],
        icon: '/foundry/value-props/icon-mentorship.png',
        alt: 'Glass pyramid icon',
      },
      {
        title: 'Meaningful Connections',
        body: [
          'Warm introductions to customers, top talent,',
          'and investors who boost growth.',
        ],
        icon: '/foundry/value-props/icon-connections.png',
        alt: 'Interlocking chain links icon',
      },
      {
        title: 'Long-Term Partnership',
        body: [
          'Support that continues beyond the first check',
          'through every raise, pivot, and milestone.',
        ],
        icon: '/foundry/value-props/icon-partnership.png',
        alt: 'Glass staircase icon',
      },
    ],
  },
]

const ALL_CARDS = SLIDES.flatMap((slide) => slide.cards)
const HEADER = SLIDES[0]
const SLIDE_COUNT = SLIDES.length

function PropCard({ card }) {
  return (
    <article className="vprop-card">
      <h3 className="vprop-card__title">{card.title}</h3>
      <div className="vprop-card__icon">
        <img src={card.icon} alt={card.alt} loading="lazy" draggable="false" />
      </div>
      <div className="vprop-card__foot">
        <span className="vprop-card__cross vprop-card__cross--ml" aria-hidden="true" />
        <span className="vprop-card__cross vprop-card__cross--mr" aria-hidden="true" />
        <p>
          {card.body.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      </div>
      <span className="vprop-card__cross vprop-card__cross--tl" aria-hidden="true" />
      <span className="vprop-card__cross vprop-card__cross--tr" aria-hidden="true" />
      <span className="vprop-card__cross vprop-card__cross--bl" aria-hidden="true" />
      <span className="vprop-card__cross vprop-card__cross--br" aria-hidden="true" />
    </article>
  )
}

export default function UnfairStartSection() {
  const rootRef = useRef(null)
  const pinRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const pin = pinRef.current
    const track = trackRef.current
    if (!root || !pin || !track) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1025px)', () => {
      // Sticky panel (CSS) + 1:1 scrub — no GSAP pin, no dwell padding.
      // xPercent: move one full slide-width per remaining slide.
      const tween = gsap.to(track, {
        xPercent: -100 * (SLIDE_COUNT - 1) / SLIDE_COUNT,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      const refresh = () => ScrollTrigger.refresh()
      requestAnimationFrame(refresh)
      const t = window.setTimeout(refresh, 120)

      return () => {
        window.clearTimeout(t)
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(track, { clearProps: 'transform' })
      }
    })

    const onRefresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', onRefresh)
    if (document.fonts?.ready) document.fonts.ready.then(onRefresh)

    return () => {
      mm.revert()
      window.removeEventListener('load', onRefresh)
    }
  }, [])

  return (
    <section className="vprop" id="valueProps" ref={rootRef}>
      <div className="vprop__pin" ref={pinRef}>
        {/* Desktop — two horizontal slides */}
        <div className="vprop__track" ref={trackRef}>
          {SLIDES.map((slide) => (
            <div
              className={
                'vprop-slide' + (slide.showHeader === false ? ' vprop-slide--no-head' : '')
              }
              key={slide.id}
              data-slide={slide.id}
              data-layout={slide.layout}
            >
              {slide.showHeader !== false && (
                <header className="vprop-slide__head">
                  <h2 className="vprop-slide__title">
                    <span className="vprop-slide__line">
                      <span className="vprop-slide__lead">{slide.titleLead}</span>{' '}
                      <span className="vprop-slide__trail">{slide.titleTrail}</span>
                    </span>
                    <span className="vprop-slide__sub">{slide.titleSub}</span>
                  </h2>
                </header>
              )}

              <div className="vprop-slide__stage">
                <div
                  className={
                    'vprop-grid' + (slide.layout === 'up' ? ' vprop-grid--up' : '')
                  }
                >
                  {slide.cards.map((card) => (
                    <PropCard key={card.title} card={card} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet / phone — one scroll, 2-column grid of all six */}
        <div className="vprop__compact">
          <header className="vprop-slide__head">
            <h2 className="vprop-slide__title">
              <span className="vprop-slide__line">
                <span className="vprop-slide__lead">{HEADER.titleLead}</span>{' '}
                <span className="vprop-slide__trail">{HEADER.titleTrail}</span>
              </span>
              <span className="vprop-slide__sub">{HEADER.titleSub}</span>
            </h2>
          </header>
          <div className="vprop-grid--flat">
            {ALL_CARDS.map((card) => (
              <PropCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
