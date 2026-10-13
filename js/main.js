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

  // Setup projects masthead meta line
  setupProjectMeta();

  // Setup skills readout
  setupSkillReadout();

  // Setup copy to clipboard
  setupCopyToClipboard();

  // Setup impact counters
  setupImpactCounters();

  // Setup project accordion
  setupProjectAccordion();

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

      // Collapse first: an expanded panel on a card about to be hidden would
      // animate its height away against the fade, and come back open later.
      closeAllProjectPanels();

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

// Projects masthead meta line ("7 projects · 개인 2 · 회사 3 · 학습 2").
// Counted from the DOM rather than written out, so the line cannot drift when
// a card is added or removed.
function setupProjectMeta() {
  const target = document.querySelector('[data-project-meta]');
  if (!target) return;

  const CATEGORY_ORDER = ['personal', 'company', 'learning'];

  const render = () => {
    const cards = document.querySelectorAll('.project-card[data-category]');
    if (cards.length === 0) return;

    const counts = new Map();
    cards.forEach(card => {
      const category = card.dataset.category;
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    const parts = [`${cards.length} ${i18n.t('projects.meta.unit')}`];
    CATEGORY_ORDER.forEach(category => {
      if (!counts.has(category)) return;
      parts.push(`${i18n.t(`projects.filter.${category}`)} ${counts.get(category)}`);
    });

    target.textContent = parts.join('  ·  ');
  };

  render();
  // Category labels are translated, so the line is rebuilt on language switch.
  document.addEventListener('languagechange:applied', render);
}

function setupSkillReadout() {
  const tagEl = document.querySelector('[data-skill-tag]');
  const detailEl = document.querySelector('[data-skill-detail]');
  const chips = document.querySelectorAll('.skill-chip[data-skill]');
  if (!tagEl || !detailEl || chips.length === 0) return;

  chips.forEach(chip => chip.setAttribute('aria-pressed', 'false'));

  // Writing the key into data-i18n rather than just the text means the language
  // toggle re-translates whatever is currently selected, for free.
  const select = (chip) => {
    if (chip.getAttribute('aria-pressed') === 'true') return;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));

    const key = `skills.detail.${chip.dataset.skill}`;
    // The chip label is a product name, not translated copy — drop the key so
    // updateContent() does not overwrite it with the hint tag.
    tagEl.removeAttribute('data-i18n');
    tagEl.textContent = chip.textContent.trim();
    detailEl.setAttribute('data-i18n', key);
    detailEl.textContent = i18n.t(key);
  };

  chips.forEach(chip => {
    // Pointer, keyboard and touch all reach the same path; hover alone would
    // leave the section unusable on a phone or by keyboard.
    chip.addEventListener('mouseenter', () => select(chip));
    chip.addEventListener('focus', () => select(chip));
    chip.addEventListener('click', () => select(chip));
  });
}

// Impact counters animation (delegates to shared CounterAnimation utility)
function setupImpactCounters() {
  CounterAnimation.observe('.impact-stat__number[data-count]', {
    easing: 'easeOutQuart',
    threshold: 0.5
  });
}

// Panel content for the project accordion. Kept in JS rather than markup
// because it is Korean-only prose with no en counterpart — moving it into the
// document would demand ~150 translation keys that do not exist yet.
const projectData = {
  pllilab: {
    title: 'PLLI Lab',
    features: [
      'RenderResult sealed class 4분기 — 완료·힙 임계·취소·엔진 종료를 exhaustive matching으로 강제해 처리 누락을 컴파일 타임에 차단',
      '3-Pass 스티커 프리로드 — Semaphore 병렬 제한 → Storage 토큰 재발급 → 바이트 직접 다운로드 + SVG 래스터화 + PNG 시그니처 검증',
      'CanvasKit 텍스처 한계 사전 방어 — PNG IHDR 원본 크기로 pixelRatio 동적 조정 + HTML Canvas 다운샘플링 폴백',
      'Web Lock API 멀티탭 직렬화 + 복구 가능한 로컬 큐 — 탭 전환·리로드·인증 지연 후에도 자동 렌더링 재개'
    ],
    challenge: '고해상도 인쇄 이미지를 브라우저에서 대량·연속 렌더링할 때 CanvasKit 텍스처 한계, 분리된 JS·WASM 힙 고갈, 불안정한 이미지 소스, 멀티탭 중복 실행이 겹쳐 일부 주문이 영구 실패하거나 탭이 종료됐습니다.',
    role: '인계받은 렌더링 문제 해결을 AI와 함께 주도 · 주요 변경은 사전 승인 후 진행',
    solution: '렌더 종료 상태를 sealed result로 고정하고 다단계 이미지 폴백과 동적 해상도 방어로 런타임을 통제했습니다. 분산 락과 스케줄러로 무인 실행을 직렬화하고, 세션→주문→이미지 3단 관측 로그로 실패를 재현할 수 있게 만들었습니다.',
    achievements: [
      '메모리 초과로 멈춘 작업이 자동으로 이어지는 재개 구조 — 04-08~09 중단 주문 재처리 기록',
      '실제 주문의 누락 요소 복원 — 배경 스티커 참조·출력 영역(05-12), 짧은 텍스트 즉석 캡처 4/4(06-09)',
      '자동 생성 6세션 900분 동안 379건 저장 기록',
      '파일명으로 인쇄 자리를 식별해 PDF를 조합하는 Python CLI 도구 구축'
    ],
    tech: ['Flutter Web', 'Dart', 'CanvasKit / WebGL', 'GetX', 'Firebase', 'Web Lock API'],
    links: {},
    en: {
      features: [
        'RenderResult sealed class with four cases — completed, heap threshold, cancelled, engine death — so exhaustive matching turns an unhandled outcome into a compile error',
        'Three-pass sticker preload — semaphore-limited parallelism → Storage token refresh → raw byte download with SVG rasterisation and PNG signature checks',
        'CanvasKit texture ceiling handled up front — pixelRatio derived from the PNG IHDR dimensions, with an HTML Canvas downsampling fallback',
        'Web Lock API multi-tab serialisation plus a recoverable local queue — rendering resumes after a tab switch, a reload or an auth delay'
      ],
      role: 'Led the fix for the rendering problems I inherited, working with AI; significant changes approved in advance',
      achievements: [
        'Work halted by memory exhaustion now resumes on its own — stalled orders from Apr 8–9 reprocessed on record',
        'Restored missing elements in real orders — background sticker references and print areas (May 12), short-text instant capture 4/4 (Jun 9)',
        '379 files saved on record across 6 automated sessions totalling 900 minutes',
        'Built a Python CLI that identifies print slots by filename and assembles the PDF'
      ],
      challenge: 'Rendering high-resolution print images in bulk inside a browser stacked four failure modes at once: the CanvasKit texture ceiling, exhaustion of the separate JS and WASM heaps, unreliable image sources, and duplicate execution across tabs — some orders failed permanently and tabs died outright.',
      solution: 'Render outcomes were pinned to a sealed result type, and the runtime was brought under control with layered image fallbacks and dynamic resolution guards. A distributed lock and scheduler serialised unattended runs, and session → order → image logs made failures reproducible.'
    }
  },
  hiddencatch: {
    title: '틀린그림찾기 웹·NFC',
    role: '서버·관리자 웹 중심 담당',
    features: [
      'NFC 도우미의 서버·Windows·관리자 연동 — PC 등록·승인과 카드 발급 작업의 배정·재개',
      '여러 요청이 겹쳐도 작업이 중복 처리되지 않도록 저장·인증 경로 정리',
      '이미지 적재가 끝난 뒤에만 게임 시작·재화 차감이 일어나도록 서버 처리 순서 보완',
      'Node SEA로 PC 도우미를 단일 실행 파일로 묶고 설치·다운로드 경로 구성'
    ],
    challenge: '그림 발행·게임 플레이·재화 정산이 서버, 관리자 웹, 모바일 게임, NFC PC 도우미에 나뉘어 있어 한 곳이 어긋나면 기록과 재화가 맞지 않을 수 있었습니다.',
    solution: '이미지 적재 완료 후에만 게임을 시작하고 재화를 차감하도록 서버 처리를 정리했습니다. 실제 모바일 기기로 발행 → 플레이 → 정산 → 관리자 기록까지 한 판을 끝까지 대조했습니다.',
    achievements: [
      'dev 환경 갤럭시 A34·삼성 인터넷 1판에서 그림 발행의 모바일 반영 확인',
      '포인트 520→550 · 도전권 6→5 정산과 관리자 플레이 기록 일치 확인',
      'NFC 로컬 검증 5개 시나리오 통과 기록 (리더기 ACR1252)'
    ],
    tech: ['JavaScript', 'Node.js', 'Firestore', 'Node SEA', 'PowerShell', 'NFC'],
    links: {},
    en: {
      role: 'Owned the server and admin web',
      features: [
        'NFC helper wired across server, Windows and admin — PC registration/approval and assignment and resume of card-issuing jobs',
        'Storage and auth paths reworked so overlapping requests never process a job twice',
        'Server ordering fixed so a game starts, and currency is deducted, only after images finish loading',
        'PC helper bundled into a single executable with Node SEA, with install and download paths'
      ],
      challenge: 'Publishing, play and currency settlement were split across the server, the admin web, the mobile game and an NFC PC helper — one slip anywhere and records and balances could disagree.',
      solution: 'Reordered server handling so a game starts and deducts only after images load, then traced a full round on a real phone: publish → play → settlement → admin record.',
      achievements: [
        'On dev, a published image reached the mobile game on a Galaxy A34 with Samsung Internet',
        'Points 520→550 and tickets 6→5 matched the admin play record',
        'Local NFC verification passed 5 scenarios on record (ACR1252 reader)'
      ]
    }
  },
  calendarqa: {
    title: '캘린더·다이어리 PDF 검수',
    role: '초기 기획·설계 담당',
    features: [
      '미관측과 정상을 구분하는 판정 — 검사 영역 0칸 추출을 실패로 처리',
      '제품별 인쇄 계약(휴일·평일·이웃달 색상 규칙) 기반 오류 판정',
      '수정 필요·확인 필요를 나눈 디자이너용 오류 보고'
    ],
    challenge: '날짜 오식과 잘못 놓인 기념일을 인쇄 전에 찾아야 했지만, 검사 완료 표시만으로는 실제 PDF가 정상인지 알기 어려웠습니다.',
    solution: '빈 검사 결과를 성공으로 보지 않도록 판정을 바꿨습니다. 제품별 인쇄 규칙과 PDF의 글자·좌표를 대조해, 디자이너가 쪽수·칸 이름·인쇄 문구로 오류 위치를 찾을 수 있게 보고했습니다.',
    achievements: [
      '검사 영역이 비어 있을 때의 거짓 PASS 차단 (08-24)',
      '제품 계약 반영으로 정상 토요일 오탐 제거 (09-17)',
      '실제 검수 PDF에서 날짜 오식·기념일 위치 오류 검출, 수정본 PDF와 대조',
      '인쇄값과 예상값을 나란히 비교하는 검수 콘솔과 보고 흐름'
    ],
    tech: ['TypeScript', 'PDF 텍스트·좌표 추출', '제품별 검수 규칙'],
    links: {},
    en: {
      role: 'Owned the initial planning and design',
      features: [
        'Judgement that separates "not observed" from "fine" — an empty extraction counts as a failure',
        'Errors judged against each product\'s print contract (holiday, weekday and adjacent-month colour rules)',
        'Designer-facing reports split into "must fix" and "needs a look"'
      ],
      challenge: 'Typos in dates and misplaced holidays had to be caught before print, but a "check complete" flag alone did not say whether the actual PDF was right.',
      solution: 'Stopped treating an empty check as a pass, then compared each product\'s print rules with the PDF\'s text and coordinates, reporting errors by page, cell name and printed text so designers could find them.',
      achievements: [
        'Blocked false PASS results on empty check areas (Aug 24)',
        'Removed false alarms on valid Saturdays by applying the product contract (Sep 17)',
        'Caught real date typos and misplaced holidays in production PDFs, cross-checked against the corrected files',
        'A review console and report flow that puts printed and expected values side by side'
      ]
    }
  },
  linknote: {
    title: 'LinkNote',
    role: '원인 판단·설계·구현·테스트·실기기 확인 · Claude와 코드 공동 작성',
    features: [
      'YouTube 공유 URL이 로그인 확인 중 사라지던 문제 — 저장 화면 도착 후 URL을 정리하도록 순서 수정',
      '컬렉션 피커가 조회 중·실패·실제 빈 목록을 구분해 표시',
      '링크 추가·편집 폼에서도 기존 선택 창과 저장 경로를 재사용해 분류 선택'
    ],
    challenge: '다른 앱에서 링크를 공유해도 저장 화면이 열리지 않았고, 분류 선택 창은 목록이 있어도 비어 보였습니다.',
    solution: '공유 URL은 저장 화면에 도착한 뒤에 정리하도록 순서를 바꾸고, 조회 중·실패·빈 목록을 구분해 목록 변화가 화면에 반영되게 했습니다.',
    achievements: [
      '전체 714개 테스트 통과 · CI 4/4 (2026-07-30 기록)',
      'Play 내부테스트 등록 후 직접 사용 중',
      '\'없음\'은 해제, 닫기는 취소로 구분한 선택 동작'
    ],
    tech: ['Flutter', 'Riverpod', 'Hive CE', 'Feature-first Architecture'],
    links: {
      github: 'https://github.com/kaywalker91/LinkNote'
    },
    en: {
      role: 'Diagnosis, design, implementation, tests and on-device checks; code co-written with Claude',
      features: [
        'YouTube share URLs vanished during the sign-in check — now cleared only after the save screen is reached',
        'The collection picker tells loading, failure and a genuinely empty list apart',
        'Add and edit forms reuse the existing picker and save path to choose a collection'
      ],
      challenge: 'Sharing a link from another app did not open the save screen, and the collection picker looked empty even when collections existed.',
      solution: 'Moved URL cleanup to after the save screen is reached, and separated loading, failure and empty states so list changes reach the screen.',
      achievements: [
        '714 passing tests and CI 4/4 on record (Jul 30, 2026)',
        'On Play internal testing and in my own daily use',
        '"None" clears the choice, closing cancels — two distinct actions'
      ]
    }
  },
  mindlog: {
    title: 'MindLog',
    role: '기획·설계·구현 담당 · Claude와 코드 공동 작성',
    features: [
      'Llama 3.3 AI 감정 5단계 분석 + 위기 감지 Safety Filter',
      'Clean Architecture + Riverpod — 레이어 분리',
      '제출 전 일기 임시저장·복원 — 화면 이탈 시 저장, 저장·삭제 순서 관리',
      'FCM 2채널 분리 (CheerMe/MindCare) + 48개 CBT 심리 메시지 (8개 카테고리)',
      'Data-only FCM payload + 3-Layer Defense로 중복/빈 알림 근절'
    ],
    challenge: 'Background Isolate에서 FCM 알림 중복 표시 + 빈 알림 발생. Android OS가 notification payload를 직접 표시하여 클라이언트 핸들러 우회.',
    solution: 'Data-only payload 전환으로 OS 직접 표시 차단 + 고정 Notification ID 덮어쓰기 + 3-Layer Defense (buildPersonalizedMessage → handler fallback → showNotification guard)',
    achievements: [
      'Google Play 출시 · 개발·유지보수 중',
      '1,814개 테스트 통과 기록 (2026-08)',
      '48개 CBT 심리 메시지 풀 (8개 카테고리)',
      'Before→After: HTTP timeout 미설정 → 30s graceful fallback',
      'Before→After: 이미지 원본 로드 → cacheWidth 적용 (메모리 최적화)'
    ],
    tech: ['Flutter', 'Clean Architecture', 'Riverpod', 'Llama 3.3', 'SQLite', 'fl_chart', 'FCM'],
    links: {
      github: 'https://github.com/kaywalker91/MindLog',
      play: 'https://play.google.com/store/apps/details?id=com.mindlog.mindlog',
      demo: 'https://kaywalker91.github.io/MindLog/'
    },
    en: {
      role: 'Planned, designed and built it; code co-written with Claude',
      features: [
        'Llama 3.3 five-level emotion analysis with a crisis-detection safety filter',
        'Clean Architecture + Riverpod with strict layer separation',
        'Unsubmitted diary drafts saved and restored — saved on leaving the screen, with save/delete ordering managed',
        'Two separate FCM channels (CheerMe / MindCare) feeding 48 CBT messages across 8 categories',
        'Data-only FCM payloads plus a 3-layer defence, ending duplicate and empty notifications'
      ],
      achievements: [
        'Live on Google Play, under active development',
        '1,814 passing tests on record (Aug 2026)',
        'A pool of 48 CBT messages across 8 categories',
        'Before → after: no HTTP timeout → 30s graceful fallback',
        'Before → after: full-size image loads → cacheWidth applied'
      ],
      challenge: 'A background isolate produced duplicate and empty FCM notifications: Android was rendering the notification payload itself, bypassing the client handler entirely.',
      solution: 'Switching to data-only payloads stopped the OS from displaying anything directly; a fixed notification ID overwrote duplicates, and a 3-layer defence (buildPersonalizedMessage → handler fallback → showNotification guard) closed the remaining gaps.'
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
    },
    en: {
      features: [
        'Full WalletConnect v2 protocol integration',
        'Support for 8 wallets including MetaMask and Trust Wallet',
        'Chain identifiers built on the CAIP-2 standard',
        'Ed25519 signing and X25519 key exchange'
      ],
      achievements: ['10+ chains supported', 'TweetNaCl encryption implemented from scratch'],
      challenge: 'WebSocket connections dropped whenever Android backgrounded the app',
      solution: 'Exponential backoff paired with an optimistic session check'
    }
  },
  cryptonative: {
    title: '멀티체인 크립토 지갑 & 소셜 트레이딩 플랫폼',
    role: '지갑 연결 계획을 인계받아 단독 구현',
    features: [
      'State Machine 기반 4단계 지갑 연결 (WalletConnect v2)',
      '4계층 어댑터 아키텍처로 WalletConnect v2 통합',
      'Race Condition 방어 체계 — 4계층 Sign Guard',
      'Deep Link Cold Start 큐잉으로 앱 초기화 전 연결 요청 보존'
    ],
    challenge: 'WalletConnect v2 연결 상태 관리 복잡성 + Deep Link Cold Start 시 지갑 연결 요청 유실',
    solution: 'State Machine 패턴으로 4가지 지갑 인터페이스 분리 (ISP) + Cold Start 큐잉 메커니즘으로 앱 초기화 전 요청 보존',
    achievements: [
      '앱 시작·복귀 링크 처리로 지갑 승인 후 돌아와도 연결이 이어지도록 보완',
      '지갑별 응답 순서 충돌·서명 유실·QR 창 잔류 수정과 어댑터 시험 정의',
      '복귀 중 도착한 새 서명·주소가 이전 값으로 덮이지 않도록 보존',
      'Beta MVP 인계 (2026-02-28)'
    ],
    tech: ['Flutter', 'Clean Architecture', 'Riverpod 3.x', 'WalletConnect v2', 'DeFi', 'fl_chart'],
    links: {},
    en: {
      role: 'Took over the wallet-connection plan and implemented it alone',
      features: [
        'Four-stage wallet connection driven by a state machine (WalletConnect v2)',
        'WalletConnect v2 integrated through a four-layer adapter architecture',
        'Race-condition defence built as a four-layer sign guard',
        'Cold-start queueing keeps deep-link connection requests raised before the app is ready'
      ],
      achievements: [
        'Launch and return links handled so the connection continues after approving in the wallet app',
        'Fixed per-wallet out-of-order responses, lost signatures and lingering QR sheets, with adapter tests defined',
        'A new signature or address that lands mid-return is no longer overwritten by stale state',
        'Beta MVP handed over (Feb 28, 2026)'
      ],
      challenge: 'WalletConnect v2 connection state was complex to manage, and a deep-link cold start dropped the wallet connection request outright.',
      solution: 'A state machine separated the four wallet interfaces along ISP lines, and a cold-start queueing mechanism preserved requests raised before the app finished initialising.'
    }
  },
  safekorea: {
    title: '안전디딤돌',
    role: 'Android/iOS 레거시 → Flutter 전환 단독 수행',
    features: [
      'Android/iOS 레거시 → Flutter 전환',
      'LocationBasedFCMManager — 위치·설정 기반 지역 재난 알림',
      '이머전시레디 다국어 화면·음성 읽기·언어별 알림 연결',
      'RegionStabilityChecker GPS 오차 보정 알고리즘',
      '공통 색상 대비·버튼 설명·페이지 안내로 TalkBack/VoiceOver 대응'
    ],
    challenge: 'Legacy Native 코드(Android/iOS) 완전 마이그레이션 + GPS 정확도 불안정',
    solution: 'Platform Channel로 네이티브 기능 직접 제어 + RegionStabilityChecker 알고리즘으로 GPS 오차 보정',
    achievements: [
      '접근성 심사 통과 (준수율 95%)',
      '위치 기반 지역 재난 알림과 저장된 대피시설 검색',
      '오프라인에서도 보는 앱 내 행동요령',
      '색상 대비·페이지 안내 접근성 시험 코드 작성'
    ],
    tech: ['Flutter', 'FCM', 'Google Translate API V3', 'Hive', 'Platform Channel'],
    links: {},
    en: {
      role: 'Carried out the Android/iOS legacy → Flutter migration alone',
      features: [
        'Android/iOS legacy → Flutter migration',
        'LocationBasedFCMManager — regional disaster alerts driven by location and settings',
        'Emergency Ready: multilingual screens, read-aloud and per-language alert routing',
        'RegionStabilityChecker, a GPS drift-correction algorithm',
        'TalkBack/VoiceOver support through shared contrast colours, button descriptions and page indicators'
      ],
      achievements: [
        'Passed accessibility certification (95% compliance)',
        'Regional disaster alerts by location, plus search over saved shelters',
        'In-app action guides that work offline',
        'Accessibility tests written for colour contrast and page indicators'
      ],
      challenge: 'A complete migration off legacy native Android and iOS code, against unreliable GPS accuracy',
      solution: 'Platform channels drove the native capabilities directly, and the RegionStabilityChecker algorithm corrected GPS drift'
    }
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
    },
    en: {
      features: [
        'Dual image pipeline: Glide 4.13.0 for ordinary caching, Picasso 2.8 for the heavier work',
        'Social sign-in via Google Sign-In and Firebase Auth',
        'Real-time one-to-one DM messaging on Firebase Realtime DB',
        'Android N+ secure file sharing through FileProvider',
        'FCM push for likes, comments, follows and DMs'
      ],
      achievements: [
        'Designed a modular architecture of 7 activities and 4 fragments',
        'Improved memory efficiency with a Glide + Picasso dual-caching strategy',
        'Integrated social auth across Google Sign-In and Firebase Auth',
        'Met the Android N+ file-sharing security policy via FileProvider',
        'Built a consistent UI/UX on Material Design components'
      ],
      challenge: 'Structuring a non-trivial social app (7 activities + 4 fragments) and optimising image loading, while complying with the Android N+ file-sharing security policy.',
      solution: 'A serverless Firebase Realtime DB architecture with Glide/Picasso dual caching kept memory in check, FileProvider satisfied the security policy, and Material Design held the UX consistent.'
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
    },
    en: {
      features: [
        'Interactive world map built on the Flame engine',
        'Branching dialogue with historical figures',
        'Learning loop driven by an encyclopedia and quizzes',
        'Supabase cloud sync'
      ],
      achievements: [
        'Learned and applied the Flame engine',
        'Worked through a game development pipeline',
        'Designed gamification for an educational context'
      ],
      challenge: 'Integrating the Flame game engine with Flutter UI without the seam showing',
      solution: 'A game-UI bridge pattern kept game state and Flutter state in sync'
    }
  },
  pointtour: {
    title: '포인트투어',
    features: [
      '위치 기반 포인트 적립 시스템',
      'Firebase Dynamic Links 바이럴 마케팅 플로우',
      'FCM + moveCode 딥링크 라우팅',
      'SiliCompressor 영상 압축 파이프라인',
      'Google Maps 위치 탐색 최적화 + 네이버지도 자전거 길찾기 연동'
    ],
    challenge: 'Legacy AsyncTask 패턴으로 인한 메인 스레드 블로킹 및 메모리 누수. 대규모 이벤트 시 서버 과부하 및 앱 크래시 발생.',
    solution: 'RxJava 2 기반 비동기 로직 전면 리팩토링. Schedulers.io()로 네트워크 작업 분리. Firebase Dynamic Links로 바이럴 마케팅 플로우 구축.',
    achievements: [
      'AsyncTask → RxJava 2 전환 (FAQ·축제 매장 상세) — 조회와 화면 갱신 분리',
      '대전 0시 축제 방문 인증·포인트 기능 — 7일간 앱 방문 12,384회 (회사 운영 기록)',
      'QR 고객 확인·할인 안내, 매장 주문 대기·접수·완료, 줄서기 신청·호출',
      '대전관광공사 꿈돌이찾아라이딩 연계 이벤트 시스템 개발·운영',
      'iOS 분석·배포·정기 점검 절차 정리, 영수증 OCR 시험 모듈'
    ],
    tech: ['Android', 'Java', 'RxJava 2', 'Firebase', 'Google Maps', '네이버지도', 'FCM', 'Glide'],
    en: {
      features: [
        'Location-based point accrual system',
        'Viral marketing flow on Firebase Dynamic Links',
        'Deep-link routing via FCM and moveCode',
        'Video compression pipeline using SiliCompressor',
        'Google Maps location search, plus Naver Map for cycling directions'
      ],
      achievements: [
        'AsyncTask → RxJava 2 for the FAQ and festival store screens, separating fetches from UI updates',
        'Daejeon Zero-Hour Festival check-in and points — 12,384 app visits over 7 days (company record)',
        'QR customer verification and discounts, store order states (waiting · accepted · done), queue sign-up and calls',
        'Built and ran the event system for the Daejeon Tourism Organisation\'s Kkumdori cycling campaign',
        'Documented iOS analysis, release and routine-check procedures; receipt OCR test module'
      ],
      challenge: 'The legacy AsyncTask pattern blocked the main thread and leaked memory; large events overloaded the server and crashed the app.',
      solution: 'A full refactor onto RxJava 2 moved network work off the main thread with Schedulers.io(), and Firebase Dynamic Links carried the viral marketing flow.'
    }
  }
};

const GITHUB_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
</svg>`;

const DEMO_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
</svg>`;

function setupProjectAccordion() {
  const cards = document.querySelectorAll('.project-card[data-project]');
  if (cards.length === 0) return;

  renderAllProjectPanels();

  document.querySelectorAll('.project-card__toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      setProjectPanel(toggle, toggle.getAttribute('aria-expanded') !== 'true');
    });
  });

  // A pinned max-height goes stale whenever the content reflows underneath it —
  // switching language swaps the whole panel body, and EN runs longer than KO,
  // so an open panel clips. Re-render, then re-measure whatever is open.
  let resizeTimer;
  document.addEventListener('languagechange:applied', () => {
    renderAllProjectPanels();
    resyncOpenProjectPanels();
  });
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resyncOpenProjectPanels, 150);
  });
}

function renderAllProjectPanels() {
  document.querySelectorAll('.project-card[data-project]').forEach(card => {
    const mount = card.querySelector('[data-project-panel]');
    const project = projectData[card.dataset.project];
    if (mount && project) {
      mount.innerHTML = renderProjectPanel(project);
    }
  });
}

function setProjectPanel(toggle, open) {
  const card = toggle.closest('.project-card');
  const panel = card && card.querySelector('.project-card__panel');
  if (!panel) return;

  toggle.setAttribute('aria-expanded', String(open));
  card.dataset.expanded = String(open);
  panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px';
}

function resyncOpenProjectPanels() {
  document.querySelectorAll('.project-card[data-expanded="true"] .project-card__panel').forEach(panel => {
    panel.style.maxHeight = 'none';
    const full = panel.scrollHeight;
    panel.style.maxHeight = `${full}px`;
  });
}

// Filtering removes cards from the flow, so an open panel would otherwise leave
// a gap — and reappear expanded when the filter is cleared.
function closeAllProjectPanels() {
  document.querySelectorAll('.project-card__toggle[aria-expanded="true"]').forEach(toggle => {
    setProjectPanel(toggle, false);
  });
}

// The panel body lives in projectData, not in translations.js, so
// i18n.updateContent() cannot reach it — it only rewrites nodes carrying
// data-i18n. Each entry keeps an `en` overlay of the prose fields instead;
// title, tech and links are language-neutral and stay shared.
function localizedProject(project) {
  const isEnglish = typeof i18n !== 'undefined' && i18n.currentLang === 'en';
  return isEnglish && project.en ? { ...project, ...project.en } : project;
}

// Labels are resolved here rather than left to updateContent(), so re-rendering
// on a language switch does not have to call it back and re-fire the event.
function panelLabel(key, fallback) {
  return typeof i18n !== 'undefined' && typeof i18n.t === 'function' ? i18n.t(key) : fallback;
}

// Reads top-down as a case: who I was on it, what broke, what I did — then the
// two scanning columns (results beside implementation), then links.
function renderProjectPanel(project) {
  const copy = localizedProject(project);
  const bullets = (items) => (items || []).map(item => `<li>${item}</li>`).join('');

  const narrativeParts = [];
  if (copy.role) {
    narrativeParts.push(`<h4 class="project-panel__label" data-i18n="projects.panel.role">${panelLabel('projects.panel.role', '내 역할')}</h4>
      <p class="project-panel__text project-panel__role">${copy.role}</p>`);
  }
  if (copy.challenge) {
    narrativeParts.push(`<h4 class="project-panel__label" data-i18n="projects.panel.challenge">${panelLabel('projects.panel.challenge', '도전 과제')}</h4>
      <p class="project-panel__text">${copy.challenge}</p>`);
  }
  if (copy.solution) {
    narrativeParts.push(`<h4 class="project-panel__label" data-i18n="projects.panel.solution">${panelLabel('projects.panel.solution', '해결 방법')}</h4>
      <p class="project-panel__text">${copy.solution}</p>`);
  }

  const links = [];
  const href = project.links || {};
  if (href.github) {
    links.push(`<a href="${href.github}" class="project-action-link" target="_blank" rel="noopener noreferrer">${GITHUB_ICON}GitHub</a>`);
  }
  if (href.play) {
    links.push(`<a href="${href.play}" class="project-action-link project-action-link--demo" target="_blank" rel="noopener noreferrer">${DEMO_ICON}Google Play</a>`);
  }
  if (href.demo) {
    links.push(`<a href="${href.demo}" class="project-action-link project-action-link--demo" target="_blank" rel="noopener noreferrer">${DEMO_ICON}Live Demo</a>`);
  }

  return `
    ${narrativeParts.length ? `<div class="project-panel__narrative project-panel__narrative--lead">${narrativeParts.join('')}</div>` : ''}
    <div class="project-panel">
      <div class="project-panel__col">
        <h4 class="project-panel__label" data-i18n="projects.panel.results">${panelLabel('projects.panel.results', '핵심 성과')}</h4>
        <ul class="project-panel__list">${bullets(copy.achievements)}</ul>
      </div>
      <div class="project-panel__col">
        <h4 class="project-panel__label" data-i18n="projects.panel.implementation">${panelLabel('projects.panel.implementation', '구현 상세')}</h4>
        <ul class="project-panel__list">${bullets(copy.features)}</ul>
        <ul class="project-panel__tech">${(project.tech || []).map(t => `<li class="tech-chip">${t}</li>`).join('')}</ul>
      </div>
    </div>
    ${links.length ? `<div class="project-panel__links">${links.join('')}</div>` : ''}
  `;
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
