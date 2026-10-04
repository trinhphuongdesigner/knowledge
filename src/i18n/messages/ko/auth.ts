const auth = {
  errors: {
    generic: "Google로 로그인하지 못했어요. 다시 시도해 주세요.",
    closed: "현재 새 계정을 받지 않고 있어요",
    disabled: "비활성화된 계정이에요",
    network: "네트워크에 연결되어 있지 않아요. 인터넷 연결을 확인하고 다시 시도해 주세요.",
    tooManyRequests: "몇 분 뒤에 다시 시도해 주세요",
    unauthorizedDomain: "이 도메인은 Google 로그인이 허용되지 않아요.",
    userDisabled: "이 Google 계정은 비활성화되었어요.",
  },
  login: {
    metaTitle: "로그인 — Knowledge",
    title: "로그인",
    subtitle: "다시 오신 것을 환영해요. 계속 공부해 볼까요?",
    expired: "세션이 만료되었어요. 다시 로그인해 주세요.",
    firstTime: "처음 로그인하면 계정이 자동으로 만들어져요.",
    agree: "계속하면 {terms} 및 {privacy}에 동의하는 것으로 간주돼요.",
    terms: "이용약관",
    privacy: "개인정보 처리방침",
    google: "Google로 계속하기",
    signingIn: "로그인하는 중…",
  },
  onboarding: {
    metaTitle: "프로필 완성하기 — Knowledge",
    title: "환영해요!",
    subtitle: "프로필을 완성할 수 있도록 간단한 정보를 알려 주세요 ({email}).",
    submit: "완료",
    signOut: "로그아웃",
  },
};

export default auth;
