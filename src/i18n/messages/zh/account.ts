const account = {
  metaTitle: "账号设置 — Knowledge",
  title: "账号设置",
  breadcrumb: "账号",
  loading: "正在加载账号…",
  tabsLabel: "账号设置",
  tabs: {
    history: "学习记录",
    stats: "统计",
    settings: "学习设置",
    profile: "个人资料",
  },
  export: {
    title: "下载我的数据",
    description: "以 JSON 格式导出你的个人资料、分类、卡组、学习进度和统计数据。",
    button: "下载",
  },
  profile: {
    updated: "账号信息已更新",
    signedInWithGoogle: "已通过 Google 登录",
    saveChanges: "保存更改",
    useGoogleAvatar: "使用我的 Google 头像",
    displayName: "显示名称",
    fullName: "姓名",
    gender: "性别",
    birthYear: "出生年份",
    birthYearPlaceholder: "例如 2000",
    age: {
      other: "约 {count} 岁",
    },
    nativeLanguage: "母语",
    genders: {
      MALE: "男",
      FEMALE: "女",
      OTHER: "其他",
    },
  },
  uiLanguage: {
    label: "显示语言",
    hint: "应用中菜单、按钮和提示所使用的语言。与用于学习的母语设置相互独立。",
    saved: "显示语言已更新",
    saveFailed: "无法更改显示语言",
    invalid: "不支持的语言",
  },
  sound: {
    label: "测验音效",
    hint: "答对时播放“叮”声；在“填写单词”和“填空”（英语卡组）中，会先朗读单词再播放“叮”声。答错时播放低音提示。仅对此设备生效。",
  },
  avatar: {
    male: "默认头像 — 男",
    female: "默认头像 — 女",
    anonymous: "默认头像 — 匿名",
    alt: "头像",
    altNamed: "{name} 的头像",
  },
  push: {
    title: "本设备上的通知",
    enable: "开启通知",
    disable: "关闭通知",
    enableFailed: "无法开启通知",
    disableFailed: "无法关闭通知",
    missingKey: "浏览器未返回订阅密钥",
    iosHint:
      "在 iPhone/iPad 上：先将应用添加到主屏幕（分享 → 添加到主屏幕），然后从该图标打开应用来开启通知。",
    status: {
      checking: "正在检查…",
      unsupported: "此浏览器不支持推送通知。",
      noKey: "服务器尚未配置推送通知。",
      noSw: "仅在应用以生产版本运行时可用（需要 Service Worker）。",
      denied:
        "通知已被屏蔽。请在浏览器设置中允许此网站发送通知，然后刷新页面。",
      off: "本设备已关闭。",
      on: "本设备已开启。",
    },
  },
  history: {
    emptyTitle: "还没有学习记录",
    emptyDescription: "开始学习一个卡组后，你的进度会显示在这里。",
    emptyAction: "选择要学习的卡组",
    mastered: "已掌握",
    setsStudied: "已学习的卡组",
    progress: "进度",
    words: {
      other: "{count} 个单词",
    },
    cards: {
      other: "{count} 张卡片",
    },
    progressHint: "{known}/{total} 张卡片",
    progressOf: "{title} 的进度",
    completed: "已完成",
    inProgress: "进行中",
    lastStudied: "上次学习：{date}",
    studyAgain: "再学一次",
    continue: "继续学习",
  },
  studySettings: {
    dailyGoal: "每日目标（{min}–{max} 张卡片）",
    dailyGoalError: "请输入 {min} 到 {max} 之间的整数",
    saved: "学习设置已保存",
    saveFailed: "无法保存设置",
    reminders: "通过推送通知提醒学习",
    remindersHint:
      "当你当天尚未学习且有到期卡片时，每天最多发送 1 条通知（约 19:00）。通知也会显示在铃铛图标中。",
    save: "保存设置",
  },
};

export default account;
