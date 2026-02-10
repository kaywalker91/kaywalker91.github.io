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

  // Setup impact counters
  setupImpactCounters();

  // Setup timeline expansion (Experience Accordion)
  setupTimelineExpansion();

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

// Impact counters animation (delegates to shared CounterAnimation utility)
function setupImpactCounters() {
  CounterAnimation.observe('.impact-stat__number[data-count]', {
    easing: 'easeOutQuart',
    threshold: 0.5
  });
}

// Timeline expansion (Experience Accordion)
function setupTimelineExpansion() {
  const expandButtons = document.querySelectorAll('.timeline__expand-btn');

  if (expandButtons.length === 0) return;

  expandButtons.forEach(button => {
    button.addEventListener('click', () => {
      const details = button.closest('.timeline__details');
      const content = details.querySelector('.timeline__detail-content');
      const isExpanded = details.dataset.expanded === 'true';

      // Toggle state
      details.dataset.expanded = !isExpanded;
      button.setAttribute('aria-expanded', !isExpanded);

      // Toggle content visibility
      if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0';
      }
    });
  });
}

// Project modal
const projectData = {
  mindlog: {
    title: 'MindLog',
    features: [
      'Llama 3.3 AI 감정 5단계 분석 + 위기 감지 Safety Filter',
      'Clean Architecture + Riverpod — 레이어 분리로 1,400+ 테스트 달성',
      'FCM 2채널 분리 (CheerMe/MindCare) + 48개 CBT 심리 메시지 (8개 카테고리)',
      'Data-only FCM payload + 3-Layer Defense로 중복/빈 알림 근절',
      'Image cacheWidth 최적화 (표시크기 ×3 DPR) + HTTP 30s timeout'
    ],
    challenge: 'Background Isolate에서 FCM 알림 중복 표시 + 빈 알림 발생. Android OS가 notification payload를 직접 표시하여 클라이언트 핸들러 우회.',
    solution: 'Data-only payload 전환으로 OS 직접 표시 차단 + 고정 Notification ID 덮어쓰기 + 3-Layer Defense (buildPersonalizedMessage → handler fallback → showNotification guard)',
    achievements: [
      '1,400+ 테스트 케이스 (TDD 기반 개발)',
      'Google Play Store v1.4.40 운영 중',
      '48개 CBT 심리 메시지 풀 (8개 카테고리)',
      'Before→After: HTTP timeout 미설정 → 30s graceful fallback',
      'Before→After: 이미지 원본 로드 → cacheWidth 적용 (메모리 최적화)',
      'ProviderObserver 프로덕션 zero-overhead 모니터링'
    ],
    tech: ['Flutter', 'Clean Architecture', 'Riverpod', 'Llama 3.3', 'SQLite', 'fl_chart', 'FCM'],
    links: {
      github: 'https://github.com/kaywalker91/MindLog',
      demo: 'https://kaywalker91.github.io/MindLog/'
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
    achievements: ['10+ 체인 지원', 'TweetNaCl 암호화 직접 구현'],
    tech: ['Flutter', 'WalletConnect v2', 'EVM', 'Solana', 'WebSocket'],
    links: {
      github: 'https://github.com/kaywalker91/Crypto-Wallet-Pro',
      demo: 'https://kaywalker91.github.io/Crypto-Wallet-Pro/'
    }
  },
  cryptonative: {
    title: '멀티체인 크립토 지갑 & 소셜 트레이딩 플랫폼',
    features: [
      '팀 5인 중 모바일 아키텍처 설계 및 구현 전담',
      '12개 모듈 마이크로 피처 아키텍처 — Clean Architecture로 팀 병렬 개발',
      '86개 Riverpod Provider — .select()로 최소 리빌드 최적화',
      'State Machine 기반 4단계 지갑 연결 (WalletConnect v2)',
      '27개 화면 Material 3 Dark Theme 설계'
    ],
    challenge: 'WalletConnect v2 연결 상태 관리 복잡성 + Deep Link Cold Start 시 지갑 연결 요청 유실',
    solution: 'State Machine 패턴으로 4가지 지갑 인터페이스 분리 (ISP) + Cold Start 큐잉 메커니즘으로 앱 초기화 전 요청 보존',
    achievements: ['50,000+ LOC, 12개 모듈, 86 Providers', '299 테스트 케이스 (33.47% 커버리지)', '10개 체인 지원 (EVM + Solana)', 'JWT Lock + 7가지 예외 타입 설계'],
    tech: ['Flutter', 'Clean Architecture', 'Riverpod 3.x', 'WalletConnect v2', 'DeFi', 'fl_chart'],
    links: {}
  },
  safekorea: {
    title: '안전디딤돌',
    features: [
      'Flutter 마이그레이션 전체 리드 (Legacy Android/iOS → Flutter 100%)',
      'LocationBasedFCMManager — 실시간 위치 기반 재난 알림',
      '19개 언어 실시간 번역 (Google Translate API V3)',
      'RegionStabilityChecker GPS 오차 보정 알고리즘',
      'TalkBack/VoiceOver 완벽 호환 (공공기관 접근성 수준)'
    ],
    challenge: 'Legacy Native 코드(Android/iOS) 완전 마이그레이션 + GPS 정확도 불안정',
    solution: 'Platform Channel로 네이티브 기능 직접 제어 + RegionStabilityChecker 알고리즘으로 GPS 오차 보정',
    achievements: ['Legacy → Flutter 100% 마이그레이션 완료', '유지보수 비용 50% 절감', '19개 언어 실시간 번역', '공공기관 접근성 인증 수준 달성'],
    tech: ['Flutter', 'FCM', 'Google Translate API V3', 'Hive', 'Platform Channel'],
    links: {}
  },
  dwinsta: {
    title: 'Android DW Insta',
    features: [
      '이중 이미지 최적화: Glide 4.13.0 (일반 캐싱) + Picasso 2.8 (복잡 처리)',
      'Google Sign-In + Firebase Auth 소셜 인증 통합',
      '실시간 1:1 DM 메시징 시스템 (Firebase Realtime DB)',
      'FileProvider 기반 Android N+ 보안 파일 공유',
      'FCM 푸시 알림: 좋아요/댓글/팔로우/DM 실시간 알림'
    ],
    challenge: '복잡한 SNS 앱 구조 설계 (7 Activities + 4 Fragments) 및 이미지 로딩 최적화. Android N+ 파일 공유 보안 정책 준수 필요.',
    solution: 'Firebase Realtime DB 서버리스 아키텍처 + Glide/Picasso 이중 캐싱 전략으로 메모리 최적화. FileProvider로 보안 준수. Material Design으로 일관된 UX 구현.',
    achievements: [
      '7 Activities + 4 Fragments 모듈화 아키텍처 설계',
      'Glide + Picasso 이중 캐싱 전략으로 메모리 효율 개선',
      'Google Sign-In + Firebase Auth 소셜 인증 통합 경험',
      'FileProvider 기반 Android N+ 보안 정책 준수',
      'Material Design 컴포넌트 기반 일관된 UI/UX 구현'
    ],
    tech: ['Java', 'Android', 'Firebase', 'Glide', 'FCM'],
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
    tech: ['Flutter', 'Flame', 'Riverpod', 'Supabase', 'Hive'],
    links: {
      github: 'https://github.com/kaywalker91/TimeWalker',
      demo: 'https://kaywalker91.github.io/TimeWalker/'
    }
  },
  pointtour: {
    title: '포인트투어',
    features: [
      '위치 기반 포인트 적립 시스템',
      'Firebase Dynamic Links 바이럴 마케팅 플로우',
      'FCM + moveCode 딥링크 라우팅',
      'SiliCompressor 영상 압축 파이프라인',
      'Google Maps 위치 탐색 최적화'
    ],
    challenge: 'Legacy AsyncTask 패턴으로 인한 메인 스레드 블로킹 및 메모리 누수. 대규모 이벤트 시 서버 과부하 및 앱 크래시 발생.',
    solution: 'RxJava 2 기반 비동기 로직 전면 리팩토링. Schedulers.io()로 네트워크 작업 분리. Firebase Dynamic Links로 바이럴 마케팅 플로우 구축.',
    achievements: [
      '다운로드 400% 증가 (1,000→5,000회)',
      'AsyncTask → RxJava 2 전면 리팩토링',
      '대전시 "0시축제" 이벤트 성공',
      'Firebase Dynamic Links 바이럴 마케팅',
      'SiliCompressor 영상 압축 최적화'
    ],
    tech: ['Android', 'Java', 'RxJava 2', 'Firebase', 'Google Maps', 'FCM', 'Glide']
  }
};

function setupProjectModal() {
  const modal = document.getElementById('project-modal');
  const detailButtons = document.querySelectorAll('.project-card__detail-btn[data-project]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');

  if (!modal || detailButtons.length === 0) return;

  // Open modal on explicit detail button click
  detailButtons.forEach(button => {
    button.addEventListener('click', () => {
      const projectId = button.dataset.project;
      const project = projectData[projectId];

      if (project) {
        openProjectModal(modal, project);
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
  bodyEl.innerHTML = `
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

  // Build footer links
  const links = [];
  if (project.links.github) {
    links.push(`<a href="${project.links.github}" class="project-action-link" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      GitHub
    </a>`);
  }
  if (project.links.demo) {
    links.push(`<a href="${project.links.demo}" class="project-action-link project-action-link--demo" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
      Live Demo
    </a>`);
  }
  footerEl.innerHTML = links.join('');

  // Re-apply translations for newly injected modal headings.
  if (typeof i18n !== 'undefined' && typeof i18n.updateContent === 'function') {
    i18n.updateContent();
  }

  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

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
