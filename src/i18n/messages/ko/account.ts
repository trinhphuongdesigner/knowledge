const account = {
  metaTitle: "계정 설정 — Knowledge",
  title: "계정 설정",
  breadcrumb: "계정",
  loading: "계정 정보를 불러오는 중…",
  tabsLabel: "계정 설정",
  tabs: {
    history: "학습 기록",
    stats: "통계",
    settings: "학습 설정",
    profile: "프로필",
  },
  export: {
    title: "내 데이터 다운로드",
    description: "프로필, 카테고리, 덱, 진도, 통계를 JSON 파일로 받아요.",
    button: "다운로드",
  },
  profile: {
    updated: "계정 정보를 업데이트했어요",
    signedInWithGoogle: "Google로 로그인됨",
    saveChanges: "변경 사항 저장",
    useGoogleAvatar: "내 Google 사진 사용",
    displayName: "표시 이름",
    fullName: "이름",
    gender: "성별",
    birthYear: "출생 연도",
    birthYearPlaceholder: "예: 2000",
    age: {
      other: "약 {count}세",
    },
    nativeLanguage: "모국어",
    genders: {
      MALE: "남성",
      FEMALE: "여성",
      OTHER: "기타",
    },
  },
  uiLanguage: {
    label: "표시 언어",
    hint: "앱의 메뉴, 버튼, 메시지에 사용되는 언어예요. 학습에 사용하는 모국어와는 별개예요.",
    saved: "표시 언어를 변경했어요",
    saveFailed: "표시 언어를 변경하지 못했어요",
    invalid: "지원하지 않는 언어예요",
  },
  sound: {
    label: "퀴즈 효과음",
    hint: "정답이면 ‘딩’ 소리가 납니다. ‘단어 입력’과 ‘빈칸 채우기’(영어 세트)에서는 단어를 먼저 읽어 준 뒤 소리가 납니다. 오답이면 낮은 소리가 납니다. 이 기기에만 적용됩니다.",
  },
  avatar: {
    male: "기본 아바타 — 남성",
    female: "기본 아바타 — 여성",
    anonymous: "기본 아바타 — 익명",
    alt: "프로필 사진",
    altNamed: "{name}님의 프로필 사진",
  },
  push: {
    title: "이 기기의 알림",
    enable: "알림 켜기",
    disable: "알림 끄기",
    enableFailed: "알림을 켜지 못했어요",
    disableFailed: "알림을 끄지 못했어요",
    missingKey: "브라우저에서 구독 키를 받지 못했어요",
    iosHint:
      "iPhone/iPad에서는 앱을 홈 화면에 추가(공유 → 홈 화면에 추가)한 뒤, 해당 아이콘으로 열어 알림을 켜세요.",
    status: {
      checking: "확인하는 중…",
      unsupported: "이 브라우저는 푸시 알림을 지원하지 않아요.",
      noKey: "서버에 푸시 알림이 설정되어 있지 않아요.",
      noSw: "앱이 프로덕션 빌드로 실행될 때만 사용할 수 있어요(서비스 워커 필요).",
      denied:
        "알림이 차단되어 있어요. 브라우저 설정에서 이 사이트의 알림을 허용한 뒤 새로고침하세요.",
      off: "이 기기에서는 꺼져 있어요.",
      on: "이 기기에서 켜져 있어요.",
    },
  },
  history: {
    emptyTitle: "아직 학습 기록이 없어요",
    emptyDescription: "덱 학습을 시작하면 진도가 여기에 표시돼요.",
    emptyAction: "학습할 덱 선택",
    mastered: "마스터함",
    setsStudied: "학습한 덱",
    progress: "진도",
    words: {
      other: "단어 {count}개",
    },
    cards: {
      other: "카드 {count}장",
    },
    progressHint: "{known}/{total}장",
    progressOf: "{title} 진도",
    completed: "완료",
    inProgress: "진행 중",
    lastStudied: "마지막 학습: {date}",
    studyAgain: "다시 학습",
    continue: "이어서 학습",
  },
  studySettings: {
    dailyGoal: "하루 목표 ({min}–{max}장)",
    dailyGoalError: "{min}에서 {max} 사이의 정수를 입력하세요",
    saved: "학습 설정을 저장했어요",
    saveFailed: "설정을 저장하지 못했어요",
    reminders: "푸시 알림으로 학습 리마인더 받기",
    remindersHint:
      "오늘 학습하지 않았고 복습할 카드가 있으면 하루 최대 1번(오후 7시경) 알림을 보내요. 알림은 종 아이콘에도 표시돼요.",
    save: "설정 저장",
  },
};

export default account;
