// Navigation module
const navigation = {
  header: null,
  navToggle: null,
  navMenu: null,
  lastScrollY: 0,
  ticking: false,

  init() {
    this.header = document.getElementById('header');
    this.navToggle = document.getElementById('nav-toggle');
    this.navMenu = document.getElementById('nav-menu');

    this.setupMobileMenu();
    this.setupScrollBehavior();
    this.setupSmoothScroll();
    this.setupActiveLink();
  },

  // Mobile menu toggle
  setupMobileMenu() {
    if (!this.navToggle || !this.navMenu) return;

    this.navToggle.addEventListener('click', () => {
      this.navToggle.classList.toggle('active');
      this.navMenu.classList.toggle('active');
      document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    const navLinks = this.navMenu.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
        this.closeMenu();
      }
    });
  },

  closeMenu() {
    this.navToggle.classList.remove('active');
    this.navMenu.classList.remove('active');
    document.body.style.overflow = '';
  },

  // Hide header on scroll down, show on scroll up
  setupScrollBehavior() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  },

  handleScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
      // Scrolling down
      this.header.classList.add('header--hidden');
    } else {
      // Scrolling up
      this.header.classList.remove('header--hidden');
    }

    this.lastScrollY = currentScrollY;
  },

  // Smooth scroll to sections
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = this.header ? this.header.offsetHeight : 0;
          const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  },

  // Highlight active nav link based on scroll position
  setupActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));
  }
};
