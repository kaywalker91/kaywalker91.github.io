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
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = translations[this.currentLang][key];
      if (translation) {
        // Use innerHTML for content with HTML tags (like <br>)
        if (translation.includes('<')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
  },

  // Update toggle button text
  updateToggleButton() {
    const toggleText = document.querySelector('.lang-toggle__text');
    if (toggleText) {
      toggleText.textContent = this.currentLang === 'ko' ? 'EN' : 'KO';
    }
  },

  // Update html lang attribute
  updateHtmlLang() {
    document.documentElement.lang = this.currentLang;
  },

  // Get translation by key
  t(key) {
    return translations[this.currentLang][key] || key;
  }
};
