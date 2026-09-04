export const easeStandard = [0.16, 1, 0.3, 1] as const;
export const durations = { fast: 0.15, base: 0.25, slow: 0.45 };
export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: durations.base, ease: easeStandard } },
  exit: { opacity: 0, y: -6, transition: { duration: durations.fast } },
};
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
