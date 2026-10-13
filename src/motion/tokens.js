// Shared timing values for the site's restrained, editorial motion.
export const motionTokens = Object.freeze({
  easing: Object.freeze({
    luxury: [0.16, 1, 0.3, 1],
    silk: [0.65, 0, 0.35, 1],
  }),
  duration: Object.freeze({
    micro: 0.35,
    reveal: 1.05,
    hero: 1.6,
    page: 0.9,
  }),
  stagger: Object.freeze({
    minimum: 0.06,
    default: 0.08,
    maximum: 0.12,
  }),
})
