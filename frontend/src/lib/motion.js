import { animate, stagger } from 'animejs';

export const motion = {
  reveal(targets, options = {}) {
    return animate(targets, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      delay: stagger(30),
      ease: 'outQuart',
      ...options,
    });
  },
  progress(targets, width) {
    return animate(targets, {
      width,
      duration: 760,
      ease: 'outQuart',
    });
  },
  number(target, value, onUpdate) {
    return animate(target, {
      value,
      duration: 760,
      ease: 'outCubic',
      onUpdate: () => onUpdate(target.value),
    });
  },
};
