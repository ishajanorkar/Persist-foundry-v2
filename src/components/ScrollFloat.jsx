import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './ScrollFloat.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * React Bits ScrollFloat — character float reveal scrubbed to scroll.
 * https://www.reactbits.dev/text-animations/scroll-float
 */
export default function ScrollFloat({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  scrub = true,
  /** When true, plays the float once as soon as the trigger enters view (better for above-the-fold heroes). */
  playOnce = false,
  /** Morph intensity — lower = less stretch/bounce on reveal. */
  yPercentFrom = 120,
  scaleYFrom = 2.3,
  scaleXFrom = 0.7,
  as: Tag = 'h2',
}) {
  const containerRef = useRef(null)

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : ''
    // Split on spaces/newlines — keep \u00A0 glued; render \n as <br>.
    const tokens = text.split(/([ \t\f\v\r\n]+)/)
    let charIndex = 0
    return tokens.map((token, tokenIndex) => {
      if (/^[ \t\f\v\r\n]+$/.test(token)) {
        if (/\n/.test(token)) {
          return <br key={`br-${tokenIndex}`} />
        }
        return (
          <span className="char" key={`s-${tokenIndex}`}>
            {'\u00A0'}
          </span>
        )
      }
      return (
        <span className="word" key={`w-${tokenIndex}`}>
          {token.split('').map((char) => {
            const key = `c-${charIndex++}`
            return (
              <span className="char" key={key}>
                {char === '\u00A0' ? '\u00A0' : char}
              </span>
            )
          })}
        </span>
      )
    })
  }, [children])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window

    const charElements = el.querySelectorAll('.char')
    if (!charElements.length) return

    const fromVars = {
      willChange: 'opacity, transform',
      opacity: 0,
      yPercent: yPercentFrom,
      scaleY: scaleYFrom,
      scaleX: scaleXFrom,
      transformOrigin: '50% 0%',
    }

    const toVars = {
      duration: animationDuration,
      ease,
      opacity: 1,
      yPercent: 0,
      scaleY: 1,
      scaleX: 1,
      stagger,
    }

    const ctx = gsap.context(() => {
      if (playOnce) {
        gsap.fromTo(charElements, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            toggleActions: 'play none none none',
            once: true,
          },
        })
      } else {
        gsap.fromTo(charElements, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: scrub === true ? true : scrub,
          },
        })
      }
    }, el)

    // Foundry engine registers ScrollTriggers after mount — keep ranges correct
    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => ctx.revert()
  }, [
    scrollContainerRef,
    animationDuration,
    ease,
    scrollStart,
    scrollEnd,
    stagger,
    scrub,
    playOnce,
    yPercentFrom,
    scaleYFrom,
    scaleXFrom,
  ])

  return (
    <Tag ref={containerRef} className={`scroll-float ${containerClassName}`.trim()}>
      <span className={`scroll-float-text ${textClassName}`.trim()}>{splitText}</span>
    </Tag>
  )
}
