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

  // Setup skill progress bar animations
  setupSkillProgress();

  // Setup scroll progress indicator
  setupScrollProgress();

  // Setup project filter
  setupProjectFilter();

  // Setup copy to clipboard
  setupCopyToClipboard();

  // Setup ETC progress rings
  setupProgressRings();
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

// Skill progress bar animation
function setupSkillProgress() {
  const progressBars = document.querySelectorAll('.skill-progress__fill');

  if (progressBars.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    progressBars.forEach(bar => bar.classList.add('animate'));
    return;
  }

  const progressOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const progressCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  };

  const progressObserver = new IntersectionObserver(progressCallback, progressOptions);
  progressBars.forEach(bar => progressObserver.observe(bar));
}

// ETC Progress Ring animation
function setupProgressRings() {
  const progressRings = document.querySelectorAll('.etc-card__progress-ring');

  if (progressRings.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    progressRings.forEach(ring => ring.classList.add('animate'));
    return;
  }

  const ringOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const ringCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  };

  const ringObserver = new IntersectionObserver(ringCallback, ringOptions);
  progressRings.forEach(ring => ringObserver.observe(ring));
}

// Scroll progress indicator
function setupScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress__bar');
  if (!progressBar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', throttle(updateProgress, 16));
  updateProgress();
}

// Project filter functionality
function setupProjectFilter() {
  const filterContainer = document.querySelector('.projects__filter');
  const filterButtons = document.querySelectorAll('.projects__filter-btn');
  const projectCards = document.querySelectorAll('.project-card[data-category]');

  if (!filterContainer || filterButtons.length === 0 || projectCards.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      // Update active state
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // Filter cards
      filterProjectCards(filter, projectCards, prefersReducedMotion);
    });
  });
}

function filterProjectCards(filter, cards, reduceMotion) {
  cards.forEach((card, index) => {
    const category = card.dataset.category;
    const shouldShow = filter === 'all' || category === filter;

    if (reduceMotion) {
      // No animation for reduced motion
      card.style.display = shouldShow ? '' : 'none';
    } else {
      if (shouldShow) {
        card.removeAttribute('data-filter-hidden');
        card.classList.remove('filter-fade-out');
        card.classList.add('filter-fade-in');
        card.style.animationDelay = `${index * 50}ms`;

        // Clean up animation class after completion
        card.addEventListener('animationend', () => {
          card.classList.remove('filter-fade-in');
        }, { once: true });
      } else {
        card.classList.add('filter-fade-out');
        card.classList.remove('filter-fade-in');

        // Hide after fade out
        setTimeout(() => {
          if (card.classList.contains('filter-fade-out')) {
            card.setAttribute('data-filter-hidden', 'true');
          }
        }, 200);
      }
    }
  });
}

// Copy to Clipboard functionality
function setupCopyToClipboard() {
  const copyButtons = document.querySelectorAll('.contact-card__copy');

  if (copyButtons.length === 0) return;

  copyButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = button.closest('.contact-card');
      const textToCopy = card?.dataset.copy;
      const tooltip = card?.querySelector('.contact-card__tooltip');

      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);

        // Show tooltip
        if (tooltip) {
          tooltip.classList.add('show');
          setTimeout(() => {
            tooltip.classList.remove('show');
          }, 2000);
        }

        // Visual feedback on button
        button.style.backgroundColor = 'var(--color-success)';
        button.style.color = 'white';
        setTimeout(() => {
          button.style.backgroundColor = '';
          button.style.color = '';
        }, 2000);

      } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        if (tooltip) {
          tooltip.classList.add('show');
          setTimeout(() => tooltip.classList.remove('show'), 2000);
        }
      }
    });
  });
}
