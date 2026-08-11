/**
 * Sitewide "+" crop-mark spin-in.
 *
 * Every corner-tick plus icon (.bcard__cross, .vprop-card__cross,
 * .ab-corner-ticks img, .filter-cross) gets a two-full-turn spin the moment
 * its card scrolls into view, replaying every time it re-enters. Runs once
 * for the whole app (imported for side effects in main.jsx) and stays alive
 * across client-side route changes via a MutationObserver, since most pages
 * are lazy-loaded and mount their crop-marks well after this module first runs.
 */

const SELECTOR =
  ".bcard__cross, .vprop-card__cross, .ab-corner-ticks img, .filter-cross";
const PLAY_CLASS = "pf-plus-spin";

/** Small per-corner stagger so a card's four/six marks don't spin as one rigid unit. */
const CORNER_DELAY_MS = {
  tl: 0,
  ml: 50,
  tm: 50,
  tr: 100,
  bl: 150,
  mr: 200,
  bm: 200,
  br: 250,
};
const CORNER_PATTERN = /(?:--|__)(tl|tr|bl|br|ml|mr|tm|bm)\b/;

function delayFor(el) {
  const match = CORNER_PATTERN.exec(el.className);
  return match ? CORNER_DELAY_MS[match[1]] || 0 : 0;
}

function playSpin(el) {
  el.style.animationDelay = `${delayFor(el)}ms`;
  el.classList.remove(PLAY_CLASS);
  // Force a reflow so re-adding the class restarts the animation even if
  // it already played on a previous entry into the viewport.
  void el.offsetWidth;
  el.classList.add(PLAY_CLASS);
}

export function initPlusSpin() {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return;
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const seen = new WeakSet();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          playSpin(entry.target);
        } else {
          entry.target.classList.remove(PLAY_CLASS);
        }
      }
    },
    { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
  );

  function observe(el) {
    if (seen.has(el)) return;
    seen.add(el);
    observer.observe(el);
  }

  function scan(root) {
    root.querySelectorAll?.(SELECTOR).forEach(observe);
  }

  scan(document);

  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches?.(SELECTOR)) observe(node);
        scan(node);
      });
    }
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPlusSpin, { once: true });
  } else {
    initPlusSpin();
  }
}
