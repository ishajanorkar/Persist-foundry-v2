/* Beliefs → Inside — choreography from hand-animation.mp4 (~16–23s)
 *
 * Arc (scroll progress 0→1):
 *  1. BELIEF hold — TR + BL hands, recessed, blurred behind glass cards
 *  2. SWITCH — the arms swap corners while the FINGERTIPS stay put:
 *       right arm swings from the top-right corner down to the bottom-right
 *       left  arm swings from the bottom-left corner up to the top-left
 *     Each side is drawn by two different PNGs, so the swap is a dissolve.
 *     The fingertip is the thing the eye tracks, so both PNGs are pinned to
 *     one shared fingertip path and only the arm behind it changes. Nothing
 *     translates across the frame and the two hands never approach each
 *     other, which is what stops the switch reading as a collision.
 *  3. MEET hold — sharp TL + BR “Creation of Adam” pose, cards gone
 *  4. EXIT + INSIDE — Inside copy fades in OVER the meet pose, then
 *     hands drift diagonally apart and leave the viewport
 */

/* Phase boundaries read off the capture and mapped with p = (t - 16s) * 0.2:
 *   belief hold 16.0–17.0s · switch 17.0–18.25s · meet hold 18.25–19.0s
 *   exit 19.0–20.0s, with the Inside panel scaling in from ~19.1s
 */
export const BELIEF_HAND_TIMELINE = {
  beliefHoldEnd: 0.16,
  /** Cards clear before the arms dissolve so nothing sweeps across live copy */
  beliefFadeEnd: 0.33,
  /** Corner-to-corner arm swap, fingertips pinned */
  switchEnd: 0.47,
  meetHoldEnd: 0.6,
  /** Inside starts as the hands begin to separate */
  insideStart: 0.6,
  /** Inside copy fully readable just as the hands clear the frame */
  insideOpaque: 0.82,
  exitEnd: 0.8,
  insideEnd: 1,
};

/**
 * The tip of each hand's INDEX finger, as a fraction of the image box. This
 * is the point the whole sequence is built around: the two index tips are
 * what meet, and each pair of arms is held on its index while they dissolve.
 *
 * Read off the alpha silhouette of each PNG. tr and h2 hold the pointing
 * pose, so their index is the one extended finger. bl and h1 are spread with
 * the thumb off to the far side, which makes the index the outermost of the
 * four fingers — the digit reaching furthest along the arm in both cases.
 *
 * These are constants of the artwork, so they hold at every viewport size:
 * the runtime just multiplies them by the element's laid-out box.
 */
export const HAND_TIP_ANCHORS = {
  tr: { fx: 0.0586, fy: 0.3682 },
  bl: { fx: 0.8271, fy: 0.4966 },
  h1: { fx: 0.929, fy: 0.4306 },
  h2: { fx: 0.1003, fy: 0.4917 },
};

/**
 * How much clear space is left between the two fingertips at the meet, as a
 * share of viewport width, so the closing scales with the frame. The artwork
 * on its own leaves them some 12vw apart; this draws both hands along the
 * line joining their tips until only this much is left. Kept just above zero
 * because the hands are two separate images — let them touch outright and any
 * further and they read as passing through one another.
 */
export const MEET_TIP_GAP_VW = 0.8;

/**
 * The switch, per side. `out` dissolves into `in` while both are pinned to
 * the same travelling fingertip.
 *
 * Both arms rotate clockwise throughout — for the right side that swings the
 * arm from up-right toward down-right, and for the left side from down-left
 * toward up-left, i.e. each one leans in the direction of the corner it is
 * handing over to. Sharing a direction keeps the dissolve reading as one
 * continuous sweep rather than two unrelated hands trading places.
 */
export const HAND_SWITCH = {
  sides: [
    /** top-right arm swings down the right edge into the bottom-right arm */
    { out: "tr", in: "h2" },
    /** bottom-left arm swings up the left edge into the top-left arm */
    { out: "bl", in: "h1" },
  ],
  /** Dissolve window, as a fraction of the switch. Generous, because the two
   *  arms sit at the same fingertip and only the limb behind it differs —
   *  the longer the overlap, the less there is a moment of change to catch. */
  fadeStart: 0.26,
  fadeEnd: 0.74,
  /** Degrees of clockwise lean added across the switch */
  sweep: 5,
  /** Both arms hit these exact values at the dissolve, so the swap does not
   *  step in brightness or focus. The extra softness also masks the change
   *  of silhouette. */
  handoff: { op: 0.85, blur: 2.6, scale: 1.01 },
};

/**
 * CSS anchors:
 *  TR = top-right, BL = bottom-left, H1 = top-left, H2 = bottom-right
 *
 * Units: x in vw, y in vh, r in deg, blur in px
 */
export const BELIEF_HAND_POSES = {
  /**
   * The two belief hands are deliberately unequal, as in the reference: the
   * top-right arm clears the cards so it reads bright and nearly sharp, while
   * the bottom-left arm crosses card 03 and stays heavily diffused so the
   * copy underneath it remains legible.
   */
  belief: {
    tr: { x: 0, y: 0, r: 0, s: 1, op: 0.82, blur: 2.5 },
    bl: { x: 0, y: 0, r: 0, s: 1, op: 0.5, blur: 9 },
  },
  meet: {
    h1: { x: 0, y: 0, r: 0, s: 1, op: 1, blur: 0 },
    h2: { x: 0, y: 0, r: 0, s: 1, op: 1, blur: 0 },
  },
  /** Drift diagonally apart toward opposite corners while Inside settles */
  /* Half-way through the exit the reference hands have moved about -17vw /
     -19vh from the meet pose, so the full drift is sized to land there. */
  exit: {
    h1: { x: -30, y: -38, r: -4, s: 1.05, op: 0, blur: 0 },
    h2: { x: 30, y: 38, r: 4, s: 1.05, op: 0, blur: 0 },
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
