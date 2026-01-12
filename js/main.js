// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize modules
  i18n.init();
  navigation.init();

  // Setup language toggle
  setupLanguageToggle();

  // Setup scroll reveal animations
  setupScrollReveal();

  // Setup intersection observer for lazy loading
  setupLazyLoad();
});

// Language toggle setup
function setupLanguageToggle() {
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      i18n.toggle();
    });
  }
}

// Scroll reveal animations
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
  revealElements.forEach(el => revealObserver.observe(el));
}

// Lazy load images (if any)
function setupLazyLoad() {
  const lazyImages = document.querySelectorAll('img[data-src]');

  if (lazyImages.length === 0) return;

  const imageOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0
  };

  const imageCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  };

  const imageObserver = new IntersectionObserver(imageCallback, imageOptions);
  lazyImages.forEach(img => imageObserver.observe(img));
}

// Utility: Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Utility: Debounce function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
