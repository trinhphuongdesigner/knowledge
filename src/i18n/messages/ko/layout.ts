const layout = {
  title: "Knowledge — 플래시카드로 학습하기",
  description: "플래시카드로 IT와 영어를 복습하세요",
  footer: {
    about: "소개",
    terms: "이용약관",
    privacy: "개인정보",
    ecosystem: "Trinh Phuong의 에코시스템",
    bongDaTuNhi: "Bóng Đá Tú Nhi",
  },
  header: {
    search: "검색",
    searchTitle: "검색 (/)",
    about: "소개",
    login: "로그인",
  },
  theme: {
    label: "화면 모드",
    system: "시스템",
    light: "라이트",
    dark: "다크",
  },
  userMenu: {
    account: "계정",
    review: "오늘의 복습",
    library: "라이브러리",
    search: "검색",
    about: "소개",
    accountSettings: "계정 설정",
    admin: "관리자",
    signOut: "로그아웃",
  },
  install: {
    button: "앱 설치",
    iosAria: "iPhone에서 앱을 설치하는 방법",
    iosTitle: "iPhone에 Knowledge 설치하기",
    step1: "브라우저의 **공유** 버튼(또는 **···** 메뉴 → 공유)을 누르세요.",
    step2: "**홈 화면에 추가**를 선택한 뒤 **추가**를 누르세요.",
    iosNote: "\"홈 화면에 추가\"가 보이지 않나요? 공유 시트 맨 아래로 스크롤하거나 \"더 보기\"를 누르세요.",
  },
  offline: "오프라인 상태예요. 일부 기능을 사용하지 못할 수 있어요.",
  home: {
    greeting: "안녕하세요 👋",
    greetingNamed: "안녕하세요, {name}님 👋",
    heading: "오늘은 무엇을 **복습**할까요?",
    subtitle: "복습할 덱을 고르거나 새 덱을 만들어 보세요.",
    explore: "라이브러리 둘러보기",
    emptyFilteredTitle: "일치하는 덱이 없어요",
    emptyTitle: "아직 덱이 없어요",
    emptyFilteredDescription: "다른 키워드나 필터를 사용해 보세요.",
    emptyDescription: "첫 덱을 만들어 플래시카드로 학습을 시작해 보세요.",
    saved: "저장한 라이브러리",
    inProgress: "학습 중",
  },
  about: {
    metaTitle: "소개 — Knowledge",
    metaDescription:
      "Knowledge는 플래시카드 학습 앱입니다: 카드 뒤집기, 간격 반복, 퀴즈, 손글씨 보드, 공유 라이브러리, 오프라인 학습.",
    badge: "소개",
    heroTitle: "Knowledge로 더 오래 기억하세요",
    heroBody:
      "Knowledge는 IT 지식, 영어 단어, 그 밖에 기억하고 싶은 모든 것을 위한 플래시카드 앱이에요. 카드를 만들고, 알맞은 때에 복습하고, 커뮤니티와 덱 라이브러리를 공유해 보세요.",
    ctaHome: "내 페이지로 이동",
    ctaLibrary: "라이브러리 둘러보기",
    ctaStart: "무료로 시작하기",
    ctaLogin: "로그인",
    featuresTitle: "주요 기능",
    newBadge: "새 기능",
    stepsTitle: "시작하는 방법",
    features: {
      cards: {
        title: "플래시카드와 덱",
        body: "카테고리와 레벨별로 세트를 만드세요. 각 카드에는 질문, 답, 설명(Markdown 지원)이 있습니다. 상세 목록 보기와 뒤집는 카드 보기를 전환하고, 신경 쓸 카드에는 별표를 달 수 있습니다.",
      },
      progress: {
        title: "하던 곳에서 바로 이어서",
        body: "학습 중인 세트는 홈 맨 위에 진행률 막대와 함께 표시되고, 모두 외우면 퀴즈를 보라고 알려 줍니다. 한 바퀴를 마치면 알맞은 다음 단계를 제안합니다.",
      },
      srs: {
        title: "간격 반복 (SRS)",
        body: "기억 정도에 따라 카드별 복습 일정을 자동으로 정합니다. 복습은 카드 뒤집기나 단어 입력으로 할 수 있습니다. 자주 잊는 단어는 ‘어려운 단어’로 표시되고, 안정적으로 기억하면 자동으로 해제됩니다. 하루 목표를 직접 정하고 연속 학습일과 통계를 확인하세요.",
      },
      modes: {
        title: "다양한 연습 모드",
        body: "객관식, 정답 입력, 짝 맞추기, 듣고 고르기, 빈칸 채우기를 지원해요. 모드마다 외우는 방식이 달라요.",
      },
      vocab: {
        title: "영어 단어 학습",
        body: "영어 카테고리는 발음 기호, 품사, 뜻, 예문을 자동으로 제안하며 발음 버튼과 단어 추가 시 AI 제안도 제공합니다. IPA 발음 기호표(단모음, 이중모음, 자음) 세트도 준비되어 있습니다.",
      },
      board: {
        title: "손글씨 보드",
        body: "어느 페이지에서나 떠 있는 칠판을 열어 마우스, 손가락, 펜으로 메모하거나 쓰기 연습을 할 수 있습니다. 색상과 굵기 선택, 지우개, 실행 취소, PNG 저장을 지원합니다.",
      },
      importExport: {
        title: "가져오기 및 내보내기",
        body: "CSV, Excel, Markdown에서 한꺼번에 가져올 수 있어요(템플릿과 미리보기 제공). 덱은 언제든 파일로 내보낼 수 있어요.",
      },
      library: {
        title: "공유 라이브러리",
        body: "공개된 덱을 둘러보고 이름이나 카테고리로 검색하세요. 직접 만들지 않아도 바로 학습을 시작할 수 있어요.",
      },
      saveCopy: {
        title: "참조 저장 또는 복사",
        body: "덱을 내 라이브러리에 저장하면(원본과 항상 동기화) 되고, 복사본을 만들어 자유롭게 수정할 수도 있어요.",
      },
      share: {
        title: "링크로 공유",
        body: "각 세트는 비공개, 링크 공유, 또는 관리자 승인 후 라이브러리 공개로 설정할 수 있습니다. SNS에 공유한 링크에는 로고가 들어간 미리보기 이미지가 표시됩니다.",
      },
      reminders: {
        title: "매일 학습 알림",
        body: "푸시 알림을 켜면, 아직 공부하지 않았고 복습할 카드가 남은 날 저녁에 한 번 알려 드립니다. 계정 설정에서 언제든 켜고 끌 수 있습니다.",
      },
      offline: {
        title: "앱으로 설치하고 오프라인 학습",
        body: "휴대폰이나 컴퓨터에 앱(PWA)으로 설치하세요. 라이트/다크 테마를 지원하고 어떤 화면 크기에서도 잘 작동해요.",
      },
    },
    steps: {
      create: {
        title: "덱 만들기 또는 저장하기",
        body: "직접 작성하거나, 파일에서 가져오거나, 라이브러리의 기성 덱을 가져오세요.",
      },
      study: {
        title: "학습하고 연습하기",
        body: "카드를 뒤집고 외운 카드를 표시한 다음, 퀴즈로 확실히 다지세요.",
      },
      review: {
        title: "알맞은 때에 복습하기",
        body: "매일 “오늘의 복습”을 열어 몇 분만 투자해도 더 많이 기억할 수 있어요.",
      },
    },
  },
  board: {
    open: "칠판 열기",
    title: "칠판",
    hasContent: "칠판에 내용이 있습니다",
    tool: "도구",
    chalk: "분필",
    eraser: "칠판지우개",
    colors: "분필 색",
    color: { white: "흰색", yellow: "노란색", pink: "분홍색", dark: "검은색" },
    size: "선 굵기",
    sizes: { xs: "아주 가늘게", s: "가늘게", m: "보통", l: "굵게" },
    picker: { open: "다른 색", title: "색 선택", sv: "채도와 명도", hue: "색상", hex: "HEX", recent: "최근 색" },
    eraserSize: "지우개 크기",
    background: "칠판 색",
    bg: { green: "초록", black: "검정", white: "흰색" },
    undo: "실행 취소 (Ctrl+Z)",
    clear: "모두 지우기",
    download: "PNG 다운로드",
    canvasAria: "그리기 칠판 — 마우스, 손가락 또는 펜으로 쓰세요",
  },
};

export default layout;
