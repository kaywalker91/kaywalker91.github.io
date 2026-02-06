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

  // Setup scroll progress indicator
  setupScrollProgress();

  // Setup copy to clipboard
  setupCopyToClipboard();

  // Setup about stat counters
  setupStatCounters();

  // Setup project modal
  setupProjectModal();

  // Setup back to top button
  setupBackToTop();
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

// About section stat counters animation
function setupStatCounters() {
  const counters = document.querySelectorAll('.stat-card__number[data-count]');

  if (counters.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    counters.forEach(counter => {
      counter.textContent = formatNumber(parseInt(counter.dataset.count, 10));
    });
    return;
  }

  const counterOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const animateCounter = (counter) => {
    const target = parseInt(counter.dataset.count, 10);
    const duration = 2000;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.floor(target * easedProgress);

      counter.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = formatNumber(target);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const counterCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  };

  const counterObserver = new IntersectionObserver(counterCallback, counterOptions);
  counters.forEach(counter => counterObserver.observe(counter));
}

function formatNumber(num) {
  if (num >= 1000) {
    return num.toLocaleString();
  }
  return num.toString();
}

// Project modal
const projectData = {
  mindlog: {
    title: 'MindLog',
    features: [
      'Llama 3.3 기반 AI 감정 분석',
      '4가지 상태별 오버레이 UI',
      '2단계 안전 필터 (49개 키워드 + AI)',
      'fl_chart 기반 감정 추이 시각화'
    ],
    challenge: 'AI 분석 대기 시간 5~10초',
    solution: 'Optimistic UI + Local-First 패턴 적용',
    achievements: ['19개 테스트 파일', 'GitHub Actions CI/CD', 'Google Play Store v1.4.35'],
    tech: ['Flutter', 'Riverpod', 'Llama 3.3', 'SQLite', 'fl_chart', 'Clean Architecture'],
    capabilities: ['AI 통합 설계', '프라이버시 아키텍처', '프로덕션 배포 경험'],
    links: {
      github: 'https://github.com/kaywalker91/MindLog',
      demo: 'https://kaywalker91.github.io/MindLog/',
      store: 'https://play.google.com/store/apps/details?id=com.kaywalker.mindlog'
    }
  },
  cryptowallet: {
    title: 'Crypto Wallet Pro',
    features: [
      'WalletConnect v2 프로토콜 완전 통합',
      'MetaMask, Trust Wallet 등 8종 지갑 지원',
      'CAIP-2 표준 기반 체인 식별자 체계',
      'Ed25519 서명, X25519 키 교환'
    ],
    challenge: 'Android 백그라운드 WebSocket 연결 끊김',
    solution: 'Exponential Backoff & Optimistic Session Check 알고리즘',
    achievements: ['10+ 체인 지원', 'TweetNaCl 암호화 직접 구현', '8종 지갑 연동'],
    tech: ['Flutter', 'Riverpod', 'WalletConnect v2', 'GoRouter', 'flutter_secure_storage', 'Glassmorphism UI'],
    capabilities: ['Web3/블록체인 프로토콜 레벨 구현', '암호화(X25519 + TweetNaCl)', '보안 설계'],
    links: {
      github: 'https://github.com/kaywalker91/Crypto-Wallet-Pro',
      demo: 'https://kaywalker91.github.io/Crypto-Wallet-Pro/'
    }
  },
  dwinsta: {
    title: 'Android DW Insta',
    features: [
      'Instagram 클론 앱 전체 기능 구현',
      'Firebase Realtime DB 기반 실시간 동기화',
      'Glide 라이브러리 이미지 캐싱 최적화',
      'FCM 기반 실시간 푸시 알림'
    ],
    challenge: '복잡한 SNS 기능(피드, 팔로우, 좋아요, 댓글)을 처음부터 구현',
    solution: 'Firebase 실시간 데이터베이스와 Cloud Functions로 서버리스 아키텍처 구축',
    achievements: [
      '4개월 교육 과정 프로젝트 완료',
      'Android 네이티브 개발 기초 습득',
      'Firebase 생태계 전반 학습'
    ],
    tech: ['Java', 'Android', 'Firebase', 'Realtime DB', 'Cloud Storage', 'Glide'],
    capabilities: ['Android 네이티브 기초 역량', '서버리스 설계', '빠른 학습 능력'],
    links: {
      github: 'https://github.com/kaywalker91/Android_DW_Insta',
      demo: 'https://kaywalker91.github.io/Android_DW_Insta/'
    }
  },
  timewalker: {
    title: 'TimeWalker',
    features: [
      'Flame 엔진 기반 인터랙티브 월드맵',
      '역사 인물과의 분기형 대화 시스템',
      '백과사전 & 퀴즈 기반 학습 시스템',
      'Supabase 클라우드 동기화'
    ],
    challenge: 'Flame 게임 엔진과 Flutter UI의 자연스러운 통합',
    solution: 'Game-UI Bridge 패턴으로 게임 상태와 Flutter 상태 동기화',
    achievements: [
      'Flame 엔진 학습 및 적용',
      '게임 개발 파이프라인 경험',
      '교육용 게이미피케이션 설계'
    ],
    tech: ['Flutter', 'Flame Engine', 'Riverpod', 'Supabase', 'Hive'],
    capabilities: ['게임 엔진 통합', '교육 UX 설계', '멀티 데이터소스 관리'],
    links: {
      github: 'https://github.com/kaywalker91/TimeWalker',
      demo: 'https://kaywalker91.github.io/TimeWalker/'
    }
  }
};

function setupProjectModal() {
  const modal = document.getElementById('project-modal');
  const projectCards = document.querySelectorAll('.project-showcase-card[data-project]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');

  if (!modal || projectCards.length === 0) return;

  // Open modal on card click
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore if clicked on a link
      if (e.target.closest('a')) return;

      const projectId = card.dataset.project;
      const project = projectData[projectId];

      if (project) {
        openProjectModal(modal, project);
      }
    });

    // Keyboard accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Close modal handlers
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => closeProjectModal(modal));
  });

  // Close on overlay click (click on modal-overlay but not on .modal itself)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProjectModal(modal);
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeProjectModal(modal);
    }
  });
}

function openProjectModal(modal, project) {
  const titleEl = modal.querySelector('.modal__title');
  const bodyEl = modal.querySelector('.modal__body');
  const footerEl = modal.querySelector('.modal__footer');

  // Set title
  titleEl.textContent = project.title;

  // Build body content
  let bodyHTML = `
    <div class="modal__section">
      <h4 class="modal__section-title" data-i18n="modal.features">주요 기능</h4>
      <ul class="modal__feature-list">
        ${project.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
    <div class="modal__section modal__section--challenge">
      <h4 class="modal__section-title" data-i18n="modal.challenge">도전 과제</h4>
      <p class="modal__challenge">${project.challenge}</p>
      <h4 class="modal__section-title" data-i18n="modal.solution">해결 방법</h4>
      <p class="modal__solution">${project.solution}</p>
    </div>
    <div class="modal__section">
      <h4 class="modal__section-title" data-i18n="modal.achievements">성과</h4>
      <ul class="modal__achievement-list">
        ${project.achievements.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
    <div class="modal__section">
      <h4 class="modal__section-title" data-i18n="modal.tech">기술 스택</h4>
      <div class="modal__tech-grid">
        ${project.tech.map(t => `<span class="modal__tech-tag">${t}</span>`).join('')}
      </div>
    </div>
  `;

  // Add capabilities section if present
  if (project.capabilities && project.capabilities.length > 0) {
    bodyHTML += `
      <div class="modal__section">
        <h4 class="modal__section-title" data-i18n="modal.capabilities">증명 역량</h4>
        <ul class="modal__achievement-list">
          ${project.capabilities.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  bodyEl.innerHTML = bodyHTML;

  // Build footer links
  const links = [];
  if (project.links.github) {
    links.push(`<a href="${project.links.github}" class="modal__link" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      GitHub
    </a>`);
  }
  if (project.links.demo) {
    links.push(`<a href="${project.links.demo}" class="modal__link modal__link--demo" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      Live Demo
    </a>`);
  }
  if (project.links.store) {
    links.push(`<a href="${project.links.store}" class="modal__link modal__link--store" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3 20.5v-17c0-.83.52-1.28 1.15-.95l14.85 8.5c.63.36.63 1.54 0 1.9l-14.85 8.5c-.63.33-1.15-.12-1.15-.95z"/>
      </svg>
      Play Store
    </a>`);
  }
  footerEl.innerHTML = links.join('');

  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Re-apply i18n for dynamically inserted content
  if (typeof i18n !== 'undefined' && i18n.applyTranslations) {
    i18n.applyTranslations();
  }

  // Focus trap
  const focusableElements = modal.querySelectorAll('button, a[href]');
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

function closeProjectModal(modal) {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
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

// Back to Top button functionality
function setupBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  // Throttle scroll events for performance
  let ticking = false;

  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(toggleVisibility);
      ticking = true;
    }
  }, { passive: true });

  // Smooth scroll to top on click
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Keyboard accessibility
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
}
