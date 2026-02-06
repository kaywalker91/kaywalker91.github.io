/**
 * CounterAnimation — Shared counter animation utility
 * Animates numeric elements from 0 to their data-count value on scroll.
 */
const CounterAnimation = (() => {
  'use strict';

  const easings = {
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeOutQuart: (t) => 1 - Math.pow(1 - t, 4)
  };

  /**
   * Animate a single counter element.
   * @param {HTMLElement} element - Element with data-count attribute
   * @param {Object} opts - { duration, easing, isFloat, formatFn }
   */
  function animateElement(element, opts) {
    const target = parseFloat(element.dataset.count);
    if (isNaN(target) || element.dataset.animated) return;

    element.dataset.animated = 'true';
    const startTime = performance.now();
    const easingFn = easings[opts.easing] || easings.easeOutQuart;
    const duration = opts.duration || 2000;
    const isFloat = opts.isFloat || false;
    const formatFn = opts.formatFn || null;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      const current = easedProgress * target;

      if (formatFn) {
        element.textContent = formatFn(current, progress < 1);
      } else if (isFloat) {
        element.textContent = current.toFixed(1);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (formatFn) {
          element.textContent = formatFn(target, false);
        } else if (isFloat) {
          element.textContent = target.toFixed(1);
        } else {
          element.textContent = target.toLocaleString();
        }
        element.classList.add('counter-animated');
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Observe elements and trigger counter animation on intersection.
   * @param {string} selector - CSS selector for counter elements
   * @param {Object} [options] - Configuration
   * @param {number} [options.duration=2000] - Animation duration in ms
   * @param {string} [options.easing='easeOutQuart'] - Easing function name
   * @param {boolean} [options.isFloat=false] - Use float formatting
   * @param {Function} [options.formatFn] - Custom format function(value, inProgress)
   * @param {number} [options.threshold=0.5] - Intersection threshold
   * @param {string} [options.rootMargin='0px'] - Intersection root margin
   * @param {boolean} [options.reducedMotionStatic=true] - Show final value immediately for reduced motion
   */
  function observe(selector, options) {
    const opts = Object.assign({
      duration: 2000,
      easing: 'easeOutQuart',
      isFloat: false,
      formatFn: null,
      threshold: 0.5,
      rootMargin: '0px',
      reducedMotionStatic: true
    }, options);

    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && opts.reducedMotionStatic) {
      elements.forEach(el => {
        const target = parseFloat(el.dataset.count);
        if (isNaN(target)) return;
        if (opts.formatFn) {
          el.textContent = opts.formatFn(target, false);
        } else if (opts.isFloat) {
          el.textContent = target.toFixed(1);
        } else {
          el.textContent = target.toLocaleString();
        }
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateElement(entry.target, opts);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: opts.threshold,
      rootMargin: opts.rootMargin
    });

    elements.forEach(el => observer.observe(el));
  }

  return { observe };
})();
