// Translations data
const translations = {
  ko: {
    // Navigation
    'nav.skills': '기술',
    'nav.experience': '경력',
    'nav.projects': '프로젝트',
    'nav.education': '학력',
    'nav.contact': '연락처',
    'nav.etc': '기타',

    // Hero
    'hero.greeting': '안녕하세요',
    'hero.name': '김대각',
    'hero.role': 'Senior Flutter Developer',
    'hero.description': 'Flutter 기반 크로스플랫폼 앱 개발 3년+ 경험<br>Clean Architecture & Riverpod | Blockchain dApp 개발',
    'hero.cta.contact': '연락하기',
    'hero.cta.projects': '프로젝트 보기',

    // Skills
    'skills.title': '기술 스택',
    'skills.subtitle': '모바일 앱 개발에 필요한 핵심 기술들',
    'skills.mobile.title': '모바일 개발',
    'skills.architecture.title': '아키텍처',
    'skills.backend.title': '백엔드 & 데이터',
    'skills.ai.title': 'AI 개발',
    'skills.blockchain.title': 'Blockchain & Web3',
    'skills.devops.title': '운영',

    // Experience
    'experience.title': '경력',
    'experience.subtitle': '실무에서 쌓아온 경험들',
    'experience.forlong.period': '2025.12 - 현재',
    'experience.forlong.role': '대리 @ 개발팀',
    'experience.forlong.project': 'iLity Hub - 멀티체인 크립토 지갑 & 소셜 트레이딩 플랫폼',
    'experience.forlong.description': 'Clean Architecture 기반 확장 가능한 앱 구조 설계. WalletConnect v2 통합 및 State Machine 기반 4단계 지갑 연결 플로우 구현. fl_chart 기반 DeFi UI 개발. 299개 테스트 케이스 작성 (33.47% 커버리지).',
    'experience.siseon.period': '2024.11 - 2025.11',
    'experience.siseon.role': '대리 @ 사업부',
    'experience.siseon.project': '안전디딤돌 & 이머전시레디앱 - 재난안전 서비스앱',
    'experience.siseon.description': 'Android/iOS 레거시를 Flutter로 전환. LocationBasedFCMManager 개발로 실시간 위치 기반 재난 알림 구현. Google Translate API V3로 19개 언어 실시간 번역. TalkBack/VoiceOver 접근성 최적화.',
    'experience.placelink.period': '2022.10 - 2024.11',
    'experience.placelink.role': '대리 @ 개발팀',
    'experience.placelink.project': '포인트투어 - 위치기반 포인트적립앱',
    'experience.placelink.description': 'RxJava 2 기반 비동기 로직 리팩토링으로 레거시 AsyncTask 문제 해결. 대전시 "0시축제" 이벤트 시스템 개발로 앱 다운로드 400% 증가 (1,000→5,000회). B2G 프로젝트 수행.',

    // Projects
    'projects.title': '프로젝트',
    'projects.subtitle': '주요 개발 프로젝트',
    'projects.filter.all': '전체',
    'projects.filter.personal': '개인',
    'projects.filter.company': '회사',
    'projects.filter.learning': '학습',
    'projects.mindlog.badge': '개인 프로젝트',
    'projects.mindlog.description': 'Llama 3.3 기반 AI 감정 분석 스마트 다이어리. 4가지 상태별 오버레이 UI로 사용자 이탈 방지. 2단계 안전 필터로 위기 상황 조기 감지. fl_chart 기반 감정 추이 시각화. Google Play Store v1.4.2 운영 중.',
    'projects.cryptowallet.badge': '개인 프로젝트',
    'projects.cryptowallet.description': 'WalletConnect v2 프로토콜 기반 멀티체인 지갑 연동 프로토타입. MetaMask, Trust Wallet 등 8종 지갑 지원. Android 백그라운드 WebSocket 연결 끊김 해결 (Exponential Backoff).',
    'projects.ility.badge': '회사 프로젝트',
    'projects.ility.description': '멀티체인 크립토 지갑 & 소셜 트레이딩 플랫폼. Ethereum, BNB Chain, Base 등 EVM 호환 네트워크 지원. 온체인 트랜잭션 검증 기반 Trustless Social Feed 설계.',
    'projects.safekorea.badge': '회사 프로젝트',
    'projects.safekorea.description': '재난안전 서비스앱 Flutter 신규 개발. Android/iOS 레거시 전환. LocationBasedFCMManager로 위치 기반 재난 알림, 19개 언어 실시간 번역, TalkBack/VoiceOver 접근성 강화.',
    'projects.dwinsta.badge': '학습 프로젝트',
    'projects.dwinsta.description': 'DW 아카데미 교육 과정 중 개발한 Instagram 클론 Android 앱. 게시물 CRUD, 팔로우/언팔로우, 좋아요/댓글, 실시간 알림 기능 구현.',
    'projects.timewalker.badge': '학습 프로젝트',
    'projects.timewalker.description': 'Flame 엔진 기반 역사 교육 어드벤처 게임. 인터랙티브 지도 탐험, 시대 여행 시스템, JSON 기반 대화 시스템으로 역사 인물과 상호작용.',

    // Education
    'education.title': '학력',
    'education.subtitle': '교육 및 수료 이력',
    'education.university.name': '공주교육대학교',
    'education.university.major': '초등교육학과 학사',
    'education.university.duration': '7년',
    'education.university.achievement1': '교원자격증 취득',
    'education.university.achievement2': '교육학 전공 심화',
    'education.academy.name': 'DW 아카데미',
    'education.academy.course': 'Java/Android/Web 개발 과정 수료',
    'education.academy.duration': '6개월',
    'education.academy.achievement1': 'Android 앱 개발 실습',
    'education.academy.achievement2': '팀 프로젝트 수행',

    // Contact
    'contact.title': '연락처',
    'contact.subtitle': '함께 일하고 싶으시다면 연락주세요',
    'contact.availability': '현재 <strong>채용 가능</strong> 상태입니다',
    'contact.copied': '복사됨!',
    'contact.response': '보통 24시간 내 응답',

    // ETC
    'etc.title': '기타',
    'etc.subtitle': '자격증 및 지속적 학습',
    'etc.certifications.title': '자격증',
    'etc.learning.title': '지속적 학습',
    'etc.status.completed': '완료',
    'etc.status.progress': '75%',
    'etc.status.ongoing': '진행중',

    // Footer
    'footer.copyright': '© 2025 김대각. All rights reserved.'
  },

  en: {
    // Navigation
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    'nav.etc': 'ETC',

    // Hero
    'hero.greeting': 'Hello',
    'hero.name': 'Daegak Kim',
    'hero.role': 'Senior Flutter Developer',
    'hero.description': '3+ years of Flutter cross-platform app development<br>Clean Architecture & Riverpod | Blockchain dApp Developer',
    'hero.cta.contact': 'Contact Me',
    'hero.cta.projects': 'View Projects',

    // Skills
    'skills.title': 'Tech Stack',
    'skills.subtitle': 'Core technologies for mobile app development',
    'skills.mobile.title': 'Mobile Dev',
    'skills.architecture.title': 'Architecture',
    'skills.backend.title': 'Backend & Data',
    'skills.ai.title': 'AI Development',
    'skills.blockchain.title': 'Blockchain & Web3',
    'skills.devops.title': 'DevOps',

    // Experience
    'experience.title': 'Experience',
    'experience.subtitle': 'Professional journey in the field',
    'experience.forlong.period': 'Dec 2025 - Present',
    'experience.forlong.role': 'Assistant Manager @ Dev Team',
    'experience.forlong.project': 'iLity Hub - Multi-chain Crypto Wallet & Social Trading Platform',
    'experience.forlong.description': 'Designed scalable app architecture based on Clean Architecture. Integrated WalletConnect v2 with State Machine-based 4-step wallet connection flow. Developed DeFi UI with fl_chart. Created 299 test cases (33.47% coverage).',
    'experience.siseon.period': 'Nov 2024 - Nov 2025',
    'experience.siseon.role': 'Assistant Manager @ Business Dept',
    'experience.siseon.project': 'SafeKorea & EmergencyReady - Disaster Safety Service App',
    'experience.siseon.description': 'Migrated Android/iOS legacy to Flutter. Developed LocationBasedFCMManager for real-time location-based disaster alerts. Implemented 19-language real-time translation with Google Translate API V3. Optimized TalkBack/VoiceOver accessibility.',
    'experience.placelink.period': 'Oct 2022 - Nov 2024',
    'experience.placelink.role': 'Assistant Manager @ Dev Team',
    'experience.placelink.project': 'PointTour - Location-based Point Rewards App',
    'experience.placelink.description': 'Refactored async logic with RxJava 2 to resolve legacy AsyncTask issues. Developed "Zero Hour Festival" event system, increasing app downloads by 400% (1,000→5,000). B2G project experience.',

    // Projects
    'projects.title': 'Projects',
    'projects.subtitle': 'Featured development projects',
    'projects.filter.all': 'All',
    'projects.filter.personal': 'Personal',
    'projects.filter.company': 'Company',
    'projects.filter.learning': 'Learning',
    'projects.mindlog.badge': 'Side Project',
    'projects.mindlog.description': 'AI-powered emotion analysis smart diary based on Llama 3.3. Prevents user churn with 4-state overlay UI. Early crisis detection with 2-step safety filter. Emotion trend visualization with fl_chart. Running on Google Play Store v1.4.2.',
    'projects.cryptowallet.badge': 'Side Project',
    'projects.cryptowallet.description': 'Multi-chain wallet integration prototype based on WalletConnect v2 protocol. Supports 8 wallets including MetaMask and Trust Wallet. Resolved Android background WebSocket disconnection with Exponential Backoff.',
    'projects.ility.badge': 'Company Project',
    'projects.ility.description': 'Multi-chain crypto wallet & social trading platform. Supports EVM-compatible networks including Ethereum, BNB Chain, Base. Designed Trustless Social Feed based on on-chain transaction verification.',
    'projects.safekorea.badge': 'Company Project',
    'projects.safekorea.description': 'New Flutter development for disaster safety service app. Migrated from Android/iOS legacy. Location-based disaster alerts with LocationBasedFCMManager, 19-language real-time translation, TalkBack/VoiceOver accessibility.',
    'projects.dwinsta.badge': 'Learning Project',
    'projects.dwinsta.description': 'Instagram clone Android app developed during DW Academy training course. Implemented post CRUD, follow/unfollow, likes/comments, and real-time notifications.',
    'projects.timewalker.badge': 'Learning Project',
    'projects.timewalker.description': 'History education adventure game built with Flame engine. Interactive map exploration, time travel system, and JSON-based dialogue system for historical character interactions.',

    // Education
    'education.title': 'Education',
    'education.subtitle': 'Academic background and certifications',
    'education.university.name': 'Gongju National University of Education',
    'education.university.major': 'Elementary Education (Bachelor)',
    'education.university.duration': '7 years',
    'education.university.achievement1': 'Teacher Certification',
    'education.university.achievement2': 'Education Major In-depth Study',
    'education.academy.name': 'DW Academy',
    'education.academy.course': 'Java/Android/Web Development Course',
    'education.academy.duration': '6 months',
    'education.academy.achievement1': 'Android App Development Practice',
    'education.academy.achievement2': 'Team Project Experience',

    // Contact
    'contact.title': 'Contact',
    'contact.subtitle': "Let's work together",
    'contact.availability': 'Currently <strong>Open to Work</strong>',
    'contact.copied': 'Copied!',
    'contact.response': 'Usually responds within 24h',

    // ETC
    'etc.title': 'ETC',
    'etc.subtitle': 'Certifications & Continuous Learning',
    'etc.certifications.title': 'Certifications',
    'etc.learning.title': 'Continuous Learning',
    'etc.status.completed': 'Done',
    'etc.status.progress': '75%',
    'etc.status.ongoing': 'Ongoing',

    // Footer
    'footer.copyright': '© 2025 Daegak Kim. All rights reserved.'
  }
};
