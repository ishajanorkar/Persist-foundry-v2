import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────
   UNFAIR START — desktop: one continuous horizontal strip of
   staggered cards (sticky + 1:1 scrub). Tablet/phone: 2×3 grid.
───────────────────────────────────────────────────────────── */

const HEADER = {
  titleLead: 'We Hand Founders',
  titleTrail: 'An',
  titleSub: 'Unfair Start.',
}

const CARDS = [
  {
    title: 'Financial Freedom',
    body: [
      'Funding and a monthly salary so you can',
      'build full time from the very first day.',
    ],
    icon: '/foundry/value-props/icon-financial.png',
    alt: 'Metallic coin with dollar mark',
    shift: 'up',
  },
  {
    title: 'Founder Network',
    body: [
      'A close-knit group of ambitious founders',
      'building alongside you through every stage.',
    ],
    icon: '/foundry/value-props/icon-network.png',
    alt: 'Network pedestal diagram',
    shift: 'down',
  },
  {
    title: 'Embedded Expertise',
    body: [
      'Builders, designers, and recruiters embedded',
      'in your venture until it stands on its own.',
    ],
    icon: '/foundry/value-props/icon-expertise.png',
    alt: 'Glowing expertise cube',
    shift: 'up',
  },
  {
    title: 'Proven Mentorship',
    body: [
      'Experienced founders and operators in your corner',
      'whenever you need guidance.',
    ],
    icon: '/foundry/value-props/icon-mentorship.png',
    alt: 'Glass pyramid icon',
    shift: 'down',
  },
  {
    title: 'Meaningful Connections',
    body: [
      'Warm introductions to customers, top talent,',
      'and investors who boost growth.',
    ],
    icon: '/foundry/value-props/icon-connections.png',
    alt: 'Interlocking chain links icon',
    shift: 'up',
  },
  {
    title: 'Long-Term Partnership',
    body: [
      'Support that continues beyond the first check',
      'through every raise, pivot, and milestone.',
    ],
    icon: '/foundry/value-props/icon-partnership.png',
    alt: 'Glass staircase icon',
    shift: 'down',
  },
]

function PropCard({ card }) {
  return (
    <article className={`vprop-card vprop-card--${card.shift}`}>
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
  const viewRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const pin = pinRef.current
    const view = viewRef.current
    const track = trackRef.current
    if (!root || !pin || !view || !track) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 1025px)', () => {
      const getShift = () => Math.max(0, track.scrollWidth - view.clientWidth)

      const syncRunway = () => {
        // Extra runway so the horizontal scrub feels smoother / less abrupt
        root.style.setProperty('--vprop-run', `${Math.round(getShift() * 1.35)}px`)
      }

      syncRunway()

      const tween = gsap.to(track, {
        x: () => -getShift(),
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          // Laggy scrub = smoother horizontal follow
          scrub: 1.35,
          invalidateOnRefresh: true,
          onRefresh: syncRunway,
        },
      })

      const onResize = () => {
        syncRunway()
        ScrollTrigger.refresh()
      }
      window.addEventListener('resize', onResize)

      requestAnimationFrame(() => {
        syncRunway()
        ScrollTrigger.refresh()
      })

      return () => {
        window.removeEventListener('resize', onResize)
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(track, { clearProps: 'transform' })
        root.style.removeProperty('--vprop-run')
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
        <header className="vprop__head">
          <h2 className="vprop__title">
            <span className="vprop__line">
              <span className="vprop__lead">{HEADER.titleLead}</span>{' '}
              <span className="vprop__trail">{HEADER.titleTrail}</span>
            </span>
            <span className="vprop__sub">{HEADER.titleSub}</span>
          </h2>
        </header>

        {/* Desktop — continuous staggered strip */}
        <div className="vprop__viewport" ref={viewRef}>
          <div className="vprop__track" ref={trackRef}>
            {CARDS.map((card) => (
              <PropCard key={card.title} card={card} />
            ))}
          </div>
        </div>

        {/* Tablet / phone — static 2×3 grid */}
        <div className="vprop__compact">
          <div className="vprop-grid--flat">
            {CARDS.map((card) => (
              <PropCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
