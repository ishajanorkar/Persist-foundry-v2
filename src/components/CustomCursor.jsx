import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const HOVER_SEL =
  'a, button, [role="button"], input[type="submit"], input[type="button"], .cr-card-apply, .cr-cta, .cr-modal-close, .ap-submit, .ap-again, .pf-card, .pf-cell, .pf-filter-btn, .pf-detail-cta, .filter-col, .backed-logo, .offer-card, .tm-card, .ct-submit'

/**
 * Sitewide custom brand cursor. Mount once in App layout.
 * Portaled to <body> so GSAP pin/transforms on #root cannot trap
 * position:fixed and leave the dot stuck while the page scrolls.
 * Hidden on touch / coarse pointers and ≤968px viewports.
 */
export default function CustomCursor() {
  const rafRef = useRef(0)
  const elRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const fineMq = window.matchMedia('(pointer: fine)')
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isNarrow = () => window.innerWidth <= 968
    const canShow = () => fineMq.matches && !reduceMq.matches && !isNarrow()

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let tx = x
    let ty = y
    let visible = false
    let running = false
    let insideWindow = true

    const stopLoop = () => {
      running = false
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }

    const startLoop = () => {
      if (running) return
      running = true
      rafRef.current = requestAnimationFrame(tick)
    }

    const setVisible = (on) => {
      visible = on
      if (!on) {
        el.style.opacity = '0'
        el.classList.remove('is-hover')
        return
      }
      el.style.display = ''
      el.style.opacity = '1'
    }

    const syncHover = () => {
      if (!visible || !insideWindow) {
        el.classList.remove('is-hover')
        return
      }
      // Scroll/move can leave :hover stale — sample under the real pointer
      const under = document.elementFromPoint(tx, ty)
      const hit = under?.closest?.(HOVER_SEL)
      el.classList.toggle('is-hover', Boolean(hit))
    }

    const tick = () => {
      if (!running) return
      x += (tx - x) * 0.28
      y += (ty - y) * 0.28
      // Snap when nearly there so it never drifts forever
      if (Math.abs(tx - x) < 0.15) x = tx
      if (Math.abs(ty - y) < 0.15) y = ty
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      rafRef.current = requestAnimationFrame(tick)
    }

    const applyMode = () => {
      if (!canShow()) {
        el.style.display = 'none'
        setVisible(false)
        stopLoop()
        return
      }
      el.style.display = ''
      if (insideWindow) setVisible(true)
      startLoop()
    }

    const onPointerMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      if (!canShow()) return
      insideWindow = true
      tx = e.clientX
      ty = e.clientY
      if (!visible) setVisible(true)
      syncHover()
      startLoop()
    }

    // Wheel/trackpad scroll does not fire pointermove — keep the dot locked
    // to the last client position and refresh hover under that point.
    const onScroll = () => {
      if (!canShow() || !insideWindow) return
      x = tx
      y = ty
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      syncHover()
      startLoop()
    }

    const onPointerLeave = (e) => {
      // Leaving the viewport (relatedTarget null) — hide so it can't stick
      if (!e.relatedTarget) {
        insideWindow = false
        setVisible(false)
      }
    }

    const onPointerEnter = () => {
      insideWindow = true
      if (canShow()) setVisible(true)
      startLoop()
    }

    const onVis = () => {
      if (document.hidden) {
        stopLoop()
        return
      }
      if (canShow() && insideWindow) {
        setVisible(true)
        startLoop()
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

    applyMode()

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.addEventListener('mouseleave', onPointerLeave)
    document.addEventListener('mouseenter', onPointerEnter)
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', applyMode, { passive: true })
    fineMq.addEventListener?.('change', applyMode)
    reduceMq.addEventListener?.('change', applyMode)

    return () => {
      stopLoop()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.removeEventListener('mouseleave', onPointerLeave)
      document.removeEventListener('mouseenter', onPointerEnter)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', applyMode)
      fineMq.removeEventListener?.('change', applyMode)
      reduceMq.removeEventListener?.('change', applyMode)
      el.classList.remove('is-hover')
    }
  }, [])

  // Portal to body so position:fixed is always viewport-relative
  return createPortal(
    <div className="cursor" id="cursor" ref={elRef} aria-hidden="true" />,
    document.body,
  )
}
