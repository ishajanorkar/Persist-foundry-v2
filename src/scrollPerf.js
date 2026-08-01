import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Global ScrollTrigger defaults — smoother scrub across all routes. */
ScrollTrigger.config({
  ignoreMobileResize: true,
  limitCallbacks: true,
})
gsap.ticker.lagSmoothing(750, 33)
