/**
 * Theme Manager - Dark/Light mode toggle with system preference detection
 */
const themeManager = {
  init() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Keep both data-theme and Tailwind's .dark class in sync.
    const initialTheme = (savedTheme === 'dark' || savedTheme === 'light')
      ? savedTheme
      : (prefersDark ? 'dark' : 'light');
    this.setTheme(initialTheme, false);

    this.setupToggle();
    this.setupSystemPreferenceListener();

    // Enable smooth transitions after first paint
    requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-transitions');
    });
  },

  setTheme(theme, save = true) {
    const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
    const root = document.documentElement;

    root.setAttribute('data-theme', normalizedTheme);
    root.classList.toggle('dark', normalizedTheme === 'dark');
    root.style.colorScheme = normalizedTheme;

    if (save) {
      localStorage.setItem('theme', normalizedTheme);
    }
    this.updateToggleButton(normalizedTheme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  },

  setupToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  },

  updateToggleButton(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      const isKorean = document.documentElement.lang === 'ko';
      const label = theme === 'dark'
        ? (isKorean ? '라이트 모드로 전환' : 'Switch to light mode')
        : (isKorean ? '다크 모드로 전환' : 'Switch to dark mode');
      toggle.setAttribute('aria-label', label);
    }
  },

  setupSystemPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light', false);
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  themeManager.init();
});
