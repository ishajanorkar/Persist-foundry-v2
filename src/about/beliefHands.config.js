/* Beliefs → Inside — same-side vertical position switch (Loom ~16–18s)
   Exact motion:
   - Top-right hand slides DOWN the right edge → bottom-right (meet H2)
   - Bottom-left hand slides UP the left edge → top-left (meet H1)
   No flip / no scaleY. Subtle translate + soft crossfade only.
*/

export const BELIEF_HAND_TIMELINE = {
  beliefHoldEnd: 0.15,
  /** Vertical position switch TR→BR / BL→TL */
  switchEnd: 0.46,
  meetHoldEnd: 0.56,
  exitEnd: 0.76,
  insideStart: 0.78,
  insideEnd: 1,
};

/**
 * CSS anchors:
 *  TR = top-right, BL = bottom-left, H1 = top-left, H2 = bottom-right
 *
 * Right track: TR +Y (down) → handoff → H2 settles at BR
 * Left track:  BL -Y (up)   → handoff → H1 settles at TL
 */
export const BELIEF_HAND_POSES = {
  belief: {
    tr: { x: 2, y: -2, r: 0, s: 1, op: 0.72, blur: 6 },
    bl: { x: -2, y: 2, r: 0, s: 1, op: 0.72, blur: 6 },
  },
  /** Mid-slide on each side (halfway down / up) */
  slideMid: {
    tr: { x: 0, y: 38, r: 4, s: 1.02, op: 0.4, blur: 2 },
    bl: { x: 0, y: -36, r: -4, s: 1.02, op: 0.4, blur: 2 },
  },
  /** Belief hands finish leaving past mid */
  slideOut: {
    tr: { x: -2, y: 56, r: 6, s: 1.03, op: 0, blur: 0 },
    bl: { x: 2, y: -54, r: -6, s: 1.03, op: 0, blur: 0 },
  },
  /**
   * Meet pair enters from the mid-slide positions relative to their anchors:
   * H1 (TL): coming from below (+Y), H2 (BR): coming from above (-Y)
   */
  meetMid: {
    h1: { x: 0, y: 36, r: -4, s: 1.02, op: 0.4, blur: 2 },
    h2: { x: 0, y: -38, r: 4, s: 1.02, op: 0.4, blur: 2 },
  },
  meet: {
    h1: { x: 0, y: 0, r: 0, s: 1, op: 1, blur: 0 },
    h2: { x: 0, y: 0, r: 0, s: 1, op: 1, blur: 0 },
  },
  exit: {
    h1: { x: -62, y: -56, r: -4, s: 1.04, op: 0, blur: 0 },
    h2: { x: 62, y: 56, r: 4, s: 1.04, op: 0, blur: 0 },
  },
};

export function lerpPose(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    r: a.r + (b.r - a.r) * t,
    s: a.s + (b.s - a.s) * t,
    op: a.op + (b.op - a.op) * t,
    blur: (a.blur ?? 0) + ((b.blur ?? 0) - (a.blur ?? 0)) * t,
  };
}
