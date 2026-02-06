// Translations data
const translations = {
  ko: {
    // Accessibility
    'accessibility.skipToContent': '본문으로 건너뛰기',

    // Header
    'header.available': '채용 가능',

    // Navigation
    'nav.about': '소개',
    'nav.projects': '프로젝트',
    'nav.tech': '기술',
    'nav.contact': '연락처',

    // Hero
    'hero.greeting': '안녕하세요',
    'hero.name': '김대각',
    'hero.role': 'Flutter 모바일 앱 개발자',
    'hero.tagline': '"안정성으로 사용자를 지키고, 아키텍처로 서비스를 키웁니다"',
    'hero.cta.projects': '프로젝트 보기',
    'hero.cta.contact': '연락하기',

    // About
    'about.title': '소개',
    'about.subtitle': '문제 없이 굴러가는 서비스를 만드는 개발자',
    'about.bio': '많은 기능보다 안정적인 핵심 기능을 우선합니다. Android 네이티브에서 시작해 Flutter로 전환하며 크로스 플랫폼 개발 역량을 키웠고, 현재는 블록체인과 AI 영역까지 도전하고 있습니다.',
    'about.career.title': '경력',
    'about.career.placelink.name': 'PLACELINK',
    'about.career.placelink.period': '2022.10 - 2024.11',
    'about.career.placelink.role': 'Android → Flutter 전환',
    'about.career.siseon.name': 'SISEON IT',
    'about.career.siseon.period': '2024.11 - 2025.11',
    'about.career.siseon.role': 'Flutter 마이그레이션',
    'about.career.forlong.name': 'FORLONG',
    'about.career.forlong.period': '2025.12 - 현재',
    'about.career.forlong.role': 'Blockchain / DeFi',
    'about.career.forlong.current': '현재',
    'about.stats.loc': 'Lines of Code',
    'about.stats.tests': 'Tests',
    'about.stats.growth': '다운로드 증가',
    'about.stats.languages': '지원 언어',
    'about.strength1.title': 'AI 기반 개발 생산성 최적화',
    'about.strength1.desc': 'Claude Code, Antigravity 등 AI 도구 활용으로 개발 속도 30% 향상',
    'about.strength2.title': '멀티플랫폼 네이티브 대응력',
    'about.strength2.desc': 'Flutter + Android(Java) + iOS(Swift) 크로스 플랫폼 실무 경험',
    'about.strength3.title': '백엔드 이해 기반 Full-Cycle',
    'about.strength3.desc': '전자정부프레임워크, MyBatis, RESTful API 설계 경험',
    'about.strength4.title': '빠른 프로토타이핑 & 협업',
    'about.strength4.desc': 'Canva/ImageMap 목업으로 요구사항 조기 검증, 빠른 커뮤니케이션',

    // Projects
    'projects.title': '프로젝트',
    'projects.subtitle': '문제 해결 과정을 보여주는 프로젝트',
    'projects.mindlog.badge': '개인 프로젝트',
    'projects.mindlog.summary': 'AI 기반 감정 분석 다이어리 앱',
    'projects.mindlog.problem': '기존 다이어리 앱은 기록만 가능, 감정 분석이나 피드백이 없어 지속 사용 동기 부족',
    'projects.mindlog.solution': 'Groq API(Llama 3.3) 기반 실시간 감정 분석 + Local-First 패턴으로 프라이버시 보장, 2단계 안전 필터로 위기 상황 조기 감지',
    'projects.mindlog.proven': 'Google Play Store 출시 운영 중 (v1.4.35)',
    'projects.cryptowallet.badge': '개인 프로젝트',
    'projects.cryptowallet.summary': '멀티체인 크립토 지갑 프로토타입',
    'projects.cryptowallet.problem': 'Android 백그라운드에서 WebSocket 세션이 끊기며 지갑 연결 불안정',
    'projects.cryptowallet.solution': 'Exponential Backoff + Optimistic Session Check 알고리즘, State Machine Pattern으로 4단계 연결 플로우 안정화',
    'projects.cryptowallet.proven': '8종 지갑 연동 (MetaMask, Trust, Phantom 등), EVM + Solana 멀티체인',
    'projects.dwinsta.badge': '학습 프로젝트',
    'projects.dwinsta.summary': 'Firebase 기반 Instagram 클론',
    'projects.dwinsta.problem': '복잡한 SNS 기능(피드, 팔로우, 좋아요, 댓글, 메시징)을 서버 없이 처음부터 구현',
    'projects.dwinsta.solution': 'Firebase Realtime DB + Cloud Storage + Auth로 서버리스 아키텍처 설계, Glide로 미디어 최적화',
    'projects.dwinsta.proven': 'DW아카데미 4개월 과정 내 풀스택 SNS 완성',
    'projects.timewalker.badge': '학습 프로젝트',
    'projects.timewalker.summary': '인터랙티브 역사 교육 어드벤처 게임',
    'projects.timewalker.problem': 'Flame 게임 엔진과 Flutter UI 상태를 자연스럽게 통합하는 브릿지 부재',
    'projects.timewalker.solution': 'Game-UI Bridge 패턴으로 Flame 게임 상태 ↔ Flutter Riverpod 상태 동기화, Supabase 클라우드 싱크 + Hive 오프라인 캐싱',
    'projects.timewalker.proven': 'Flame 엔진 실무 적용, 게이미피케이션 설계 능력 입증',

    // Project labels
    'projects.label.problem': '문제',
    'projects.label.solution': '해결',
    'projects.label.proven': '증명',

    // Modal
    'modal.features': '주요 기능',
    'modal.challenge': '도전 과제',
    'modal.solution': '해결 방법',
    'modal.achievements': '성과',
    'modal.tech': '기술 스택',
    'modal.capabilities': '증명 역량',

    // Tech
    'tech.title': '기술 스택',
    'tech.subtitle': '숙련도별 기술 구성',
    'tech.expert': 'Expert',
    'tech.advanced': 'Advanced',
    'tech.intermediate': 'Intermediate',
    'tech.tools': 'Tools',

    // Contact
    'contact.title': '연락처',
    'contact.subtitle': '함께 일하고 싶으시다면',
    'contact.availability': '현재 <strong>채용 가능</strong> 상태입니다',
    'contact.copied': '복사됨!',
    'contact.response': '보통 24시간 내 응답',

    // Footer
    'footer.copyright': '© 2025 김대각. All rights reserved.'
  },

  en: {
    // Accessibility
    'accessibility.skipToContent': 'Skip to main content',

    // Header
    'header.available': 'Open to Work',

    // Navigation
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.tech': 'Tech',
    'nav.contact': 'Contact',

    // Hero
    'hero.greeting': 'Hello',
    'hero.name': 'Daegak Kim',
    'hero.role': 'Flutter Mobile App Developer',
    'hero.tagline': '"Protecting users with stability, growing services with architecture"',
    'hero.cta.projects': 'View Projects',
    'hero.cta.contact': 'Contact Me',

    // About
    'about.title': 'About',
    'about.subtitle': 'A developer who builds services that just work',
    'about.bio': 'I prioritize stable core features over feature bloat. Starting from Android native, I transitioned to Flutter for cross-platform development, and now I\'m expanding into blockchain and AI domains.',
    'about.career.title': 'Career',
    'about.career.placelink.name': 'PLACELINK',
    'about.career.placelink.period': 'Oct 2022 - Nov 2024',
    'about.career.placelink.role': 'Android → Flutter',
    'about.career.siseon.name': 'SISEON IT',
    'about.career.siseon.period': 'Nov 2024 - Nov 2025',
    'about.career.siseon.role': 'Flutter Migration',
    'about.career.forlong.name': 'FORLONG',
    'about.career.forlong.period': 'Dec 2025 - Present',
    'about.career.forlong.role': 'Blockchain / DeFi',
    'about.career.forlong.current': 'Now',
    'about.stats.loc': 'Lines of Code',
    'about.stats.tests': 'Tests',
    'about.stats.growth': 'Download Growth',
    'about.stats.languages': 'Languages',
    'about.strength1.title': 'AI-Powered Dev Productivity',
    'about.strength1.desc': '30% faster development using Claude Code, Antigravity and other AI tools',
    'about.strength2.title': 'Multi-Platform Native Skills',
    'about.strength2.desc': 'Flutter + Android(Java) + iOS(Swift) cross-platform experience',
    'about.strength3.title': 'Full-Cycle with Backend Knowledge',
    'about.strength3.desc': 'eGovFrame, MyBatis, RESTful API design experience',
    'about.strength4.title': 'Rapid Prototyping & Collaboration',
    'about.strength4.desc': 'Early validation with Canva/ImageMap mockups, fast communication',

    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Projects showcasing problem-solving process',
    'projects.mindlog.badge': 'Side Project',
    'projects.mindlog.summary': 'AI-Powered Emotion Analysis Diary App',
    'projects.mindlog.problem': 'Existing diary apps only allow recording, lacking emotion analysis or feedback, resulting in low retention',
    'projects.mindlog.solution': 'Real-time emotion analysis via Groq API (Llama 3.3) + Local-First pattern for privacy, 2-step safety filter for early crisis detection',
    'projects.mindlog.proven': 'Live on Google Play Store (v1.4.35)',
    'projects.cryptowallet.badge': 'Side Project',
    'projects.cryptowallet.summary': 'Multi-Chain Crypto Wallet Prototype',
    'projects.cryptowallet.problem': 'WebSocket sessions disconnect in Android background, causing unstable wallet connections',
    'projects.cryptowallet.solution': 'Exponential Backoff + Optimistic Session Check algorithm, State Machine Pattern for 4-step connection flow stabilization',
    'projects.cryptowallet.proven': '8 wallet integrations (MetaMask, Trust, Phantom, etc.), EVM + Solana multi-chain',
    'projects.dwinsta.badge': 'Learning Project',
    'projects.dwinsta.summary': 'Firebase-Based Instagram Clone',
    'projects.dwinsta.problem': 'Building complex SNS features (feed, follow, likes, comments, messaging) from scratch without a server',
    'projects.dwinsta.solution': 'Serverless architecture with Firebase Realtime DB + Cloud Storage + Auth, media optimization with Glide',
    'projects.dwinsta.proven': 'Full-stack SNS completed within 4-month DW Academy course',
    'projects.timewalker.badge': 'Learning Project',
    'projects.timewalker.summary': 'Interactive History Education Adventure Game',
    'projects.timewalker.problem': 'No natural bridge between Flame game engine and Flutter UI state management',
    'projects.timewalker.solution': 'Game-UI Bridge pattern for Flame game state ↔ Flutter Riverpod state sync, Supabase cloud sync + Hive offline caching',
    'projects.timewalker.proven': 'Flame engine practical application, gamification design capability proven',

    // Project labels
    'projects.label.problem': 'Problem',
    'projects.label.solution': 'Solution',
    'projects.label.proven': 'Proven',

    // Modal
    'modal.features': 'Key Features',
    'modal.challenge': 'Challenge',
    'modal.solution': 'Solution',
    'modal.achievements': 'Achievements',
    'modal.tech': 'Tech Stack',
    'modal.capabilities': 'Proven Capabilities',

    // Tech
    'tech.title': 'Tech Stack',
    'tech.subtitle': 'Skills organized by proficiency',
    'tech.expert': 'Expert',
    'tech.advanced': 'Advanced',
    'tech.intermediate': 'Intermediate',
    'tech.tools': 'Tools',

    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': "Let's work together",
    'contact.availability': 'Currently <strong>Open to Work</strong>',
    'contact.copied': 'Copied!',
    'contact.response': 'Usually responds within 24h',

    // Footer
    'footer.copyright': '© 2025 Daegak Kim. All rights reserved.'
  }
};
