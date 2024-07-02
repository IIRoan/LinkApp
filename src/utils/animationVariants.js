// Animation durations
const DURATION = {
  FAST: 0.1,
  MEDIUM: 0.2,
  SLOW: 0.3
};

// Spring configurations
const SPRING = {
  STIFF: { type: 'spring', stiffness: 700, damping: 30 },
  GENTLE: { type: 'spring', stiffness: 500, damping: 25 }
};

export const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.MEDIUM,
      when: "beforeChildren",
      staggerChildren: DURATION.FAST
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING.STIFF
  }
};

export const buttonVariants = {
  hover: { scale: 1.03, transition: SPRING.GENTLE },
  tap: { scale: 0.97, transition: SPRING.STIFF }
};

export const inputVariants = {
  focus: { scale: 1.01, transition: SPRING.GENTLE },
  blur: { scale: 1, transition: SPRING.GENTLE }
};

export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const modalContentVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.2 } },
};

