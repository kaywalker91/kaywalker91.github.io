// Internationalization (i18n) module
const i18n = {
  currentLang: 'ko',

  // Initialize language
  init() {
    // Check localStorage first
    const savedLang = localStorage.getItem('lang');
    if (savedLang && translations[savedLang]) {
      this.currentLang = savedLang;
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.split('-')[0];
      this.currentLang = translations[browserLang] ? browserLang : 'ko';
    }

    this.updateContent();
    this.updateToggleButton();
    this.updateHtmlLang();
  },

  // Toggle language
  toggle() {
    this.currentLang = this.currentLang === 'ko' ? 'en' : 'ko';
    localStorage.setItem('lang', this.currentLang);
    this.updateContent();
    this.updateToggleButton();
    this.updateHtmlLang();
  },

  // Update all translatable content
  updateContent() {
    const dictionary = translations[this.currentLang] || {};

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = dictionary[key];
      if (typeof translation === 'string') {
        // Use innerHTML for content with HTML tags (like <br>)
        if (translation.includes('<')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    const ariaElements = document.querySelectorAll('[data-i18n-aria]');
    ariaElements.forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const translation = dictionary[key];
      if (typeof translation === 'string') {
        el.setAttribute('aria-label', translation);
      }
    });
  },

  // Update toggle button text
  updateToggleButton() {
    const langToggle = document.getElementById('lang-toggle');
    if (!langToggle) return;

    const toggleText = langToggle.querySelector('span');
    if (toggleText) {
      toggleText.textContent = this.currentLang === 'ko' ? 'EN' : 'KO';
    }

    const ariaLabel = this.currentLang === 'ko' ? '영어로 전환' : 'Switch language to Korean';
    langToggle.setAttribute('aria-label', ariaLabel);
  },

  // Update html lang attribute
  updateHtmlLang() {
    document.documentElement.lang = this.currentLang;

    if (typeof themeManager !== 'undefined' && typeof themeManager.updateToggleButton === 'function') {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      themeManager.updateToggleButton(currentTheme);
    }
  },

  // Get translation by key
  t(key) {
    const dictionary = translations[this.currentLang] || {};
    return dictionary[key] || key;
  }
};
