import { useEffect, useRef } from 'react'

const HOVER_SEL =
  'a, button, [role="button"], input[type="submit"], input[type="button"], .cr-card-apply, .cr-cta, .cr-modal-close, .ap-submit, .ap-again, .pf-card, .pf-cell, .pf-filter-btn, .pf-detail-cta, .filter-col, .backed-logo, .offer-card, .tm-card, .ct-submit'

/**
 * Sitewide custom brand cursor. Mount once in App layout.
 * Hidden on touch / coarse pointers and ≤968px viewports.
 */
export default function CustomCursor() {
  const rafRef = useRef(0)
  const elRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const fine = window.matchMedia('(pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isNarrow = () => window.innerWidth <= 968

    if (!fine || reduceMotion || isNarrow()) {
      el.style.opacity = '0'
      el.style.display = 'none'
      return
    }

    el.style.display = ''
    el.style.opacity = '1'

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y
    let active = true

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
    }

    const tick = () => {
      if (!active) return
      x += (tx - x) * 0.18
      y += (ty - y) * 0.18
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      rafRef.current = requestAnimationFrame(tick)
    }

    const onVis = () => {
      active = !document.hidden
      if (active && !rafRef.current) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    const onOver = (e) => {
      if (e.target.closest?.(HOVER_SEL)) el.classList.add('is-hover')
    }
    const onOut = (e) => {
      const from = e.target.closest?.(HOVER_SEL)
      const to =
        e.relatedTarget instanceof Element
          ? e.relatedTarget.closest(HOVER_SEL)
          : null
      if (from && !to) el.classList.remove('is-hover')
    }

    const onResize = () => {
      if (isNarrow()) {
        el.style.opacity = '0'
        el.style.display = 'none'
        active = false
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = 0
        }
      } else {
        el.style.display = ''
        el.style.opacity = '1'
        if (!active) {
          active = true
          rafRef.current = requestAnimationFrame(tick)
        }
      }
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', onResize, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      el.classList.remove('is-hover')
    }
  }, [])

  return <div className="cursor" id="cursor" ref={elRef} aria-hidden="true" />
}
