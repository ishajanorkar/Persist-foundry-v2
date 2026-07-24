/* Hand-meet motion presets ported from HeroWebGL meshMotion.
   Normalized start/travel map to CSS px via half section width. */

export const INSIDE_HAND_PRESETS = {
  mobile: { hands: 0.0055, handStartX: 0.98, handTravel: 0.94 },
  tablet: { hands: 0.009, handStartX: 1.14, handTravel: 1.1 },
  desktop: { hands: 0.01, handStartX: 0.5, handTravel: 0.5 },
};

export const INSIDE_HAND_TIMELINE = {
  /** Meet completes over first 30% of section scroll progress */
  handsEnd: 0.7,
};

/** ≤640 → mobile, ≤968 → tablet, else desktop */
export function getInsideHandPreset(
  width = typeof window !== "undefined" ? window.innerWidth : 1200,
) {
  if (width <= 640) return INSIDE_HAND_PRESETS.mobile;
  if (width <= 968) return INSIDE_HAND_PRESETS.tablet;
  return INSIDE_HAND_PRESETS.desktop;
}
