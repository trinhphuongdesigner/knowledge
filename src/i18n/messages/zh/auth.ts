const auth = {
  errors: {
    generic: "无法使用 Google 登录，请重试。",
    closed: "目前暂不接受新账号注册",
    disabled: "此账号已被停用",
    network: "网络未连接，请检查网络后重试。",
    tooManyRequests: "请几分钟后再试",
    unauthorizedDomain: "此域名不允许使用 Google 登录。",
    userDisabled: "此 Google 账号已被停用。",
  },
  login: {
    metaTitle: "登录 — Knowledge",
    title: "登录",
    subtitle: "欢迎回来，继续学习吧！",
    expired: "登录已过期，请重新登录。",
    firstTime: "首次登录时会自动为你创建账号。",
    agree: "继续即表示你同意{terms}和{privacy}。",
    terms: "服务条款",
    privacy: "隐私政策",
    google: "使用 Google 继续",
    signingIn: "正在登录…",
  },
  onboarding: {
    metaTitle: "完善个人资料 — Knowledge",
    title: "欢迎！",
    subtitle: "请简单介绍一下自己，以完善你的个人资料（{email}）。",
    submit: "完成",
    signOut: "退出登录",
  },
};

export default auth;
