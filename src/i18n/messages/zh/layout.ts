const layout = {
  title: "Knowledge — 用抽认卡学习",
  description: "用抽认卡复习 IT 和英语",
  footer: {
    about: "关于",
    terms: "条款",
    privacy: "隐私",
    ecosystem: "Trinh Phuong 的生态",
    bongDaTuNhi: "Bóng Đá Tú Nhi",
  },
  header: {
    search: "搜索",
    searchTitle: "搜索 (/)",
    about: "关于",
    login: "登录",
  },
  theme: {
    label: "外观",
    system: "跟随系统",
    light: "浅色",
    dark: "深色",
  },
  userMenu: {
    account: "账号",
    review: "今日复习",
    library: "资源库",
    search: "搜索",
    about: "关于",
    accountSettings: "账号设置",
    admin: "管理",
    signOut: "退出登录",
  },
  install: {
    button: "安装应用",
    iosAria: "如何在 iPhone 上安装应用",
    iosTitle: "在 iPhone 上安装 Knowledge",
    step1: "点按浏览器中的**分享**按钮（或 **···** 菜单 → 分享）。",
    step2: "选择**添加到主屏幕**，然后点按**添加**。",
    iosNote: "没有看到“添加到主屏幕”？请滑到分享面板底部，或点按“更多”。",
  },
  offline: "你已离线，部分功能可能无法使用。",
  home: {
    greeting: "你好 👋",
    greetingNamed: "你好，{name} 👋",
    heading: "今天要**复习**什么呢？",
    subtitle: "选择一个卡组开始复习，或创建新的卡组。",
    explore: "探索资源库",
    emptyFilteredTitle: "没有找到匹配的卡组",
    emptyTitle: "还没有卡组",
    emptyFilteredDescription: "试试其他关键词或筛选条件。",
    emptyDescription: "创建你的第一个卡组，开始用抽认卡学习。",
    saved: "已收藏的资源库",
    inProgress: "正在学习",
  },
  about: {
    metaTitle: "关于 — Knowledge",
    metaDescription:
      "Knowledge 是一款闪卡学习应用：翻转卡片、间隔重复、测验、手写板、共享资料库与离线学习。",
    badge: "关于",
    heroTitle: "用 Knowledge 记得更牢",
    heroBody:
      "Knowledge 是一款抽认卡应用，适用于 IT 知识、英语词汇以及任何你想记住的内容。创建卡片，在恰当的时间复习，还能与社区共享卡组资源库。",
    ctaHome: "前往我的主页",
    ctaLibrary: "浏览资源库",
    ctaStart: "免费开始使用",
    ctaLogin: "登录",
    featuresTitle: "主要功能",
    newBadge: "新功能",
    stepsTitle: "如何开始",
    features: {
      cards: {
        title: "抽认卡与卡组",
        body: "按分类和级别创建卡组。每张卡片包含问题、答案和解释（支持 Markdown）。可在详细列表和可翻转的卡片视图之间切换，并为需要留意的卡片加星标。",
      },
      progress: {
        title: "从上次停下的地方继续",
        body: "学到一半的卡组会显示在首页最上方，附带进度条；全部记住后会提醒你参加测验。每学完一轮，应用都会建议合适的下一步。",
      },
      srs: {
        title: "间隔重复 (SRS)",
        body: "系统根据你的记忆程度自动安排每张卡片的复习时间，可以翻卡或输入单词来复习。常忘的单词会被标为“难词”，稳定记住后自动取消。可自定每日目标，并查看连续学习天数和统计。",
      },
      modes: {
        title: "多种练习模式",
        body: "选择题、输入答案、配对、听音选词和填空。每种模式适合不同的记忆方式。",
      },
      vocab: {
        title: "学习英语词汇",
        body: "英语分类会自动建议音标、词性、释义和例句，带发音按钮，添加单词时还可用 AI 快速建议。内置 IPA 音标表卡组：单元音、双元音和辅音。",
      },
      board: {
        title: "手写板",
        body: "在任意页面打开浮动黑板，用鼠标、手指或触控笔打草稿、练习书写或做笔记。可选颜色和笔画粗细，支持擦除、撤销和下载 PNG。",
      },
      importExport: {
        title: "导入与导出",
        body: "支持从 CSV、Excel 或 Markdown 批量导入（提供模板和预览）。随时可将卡组导出为文件。",
      },
      library: {
        title: "共享资源库",
        body: "浏览已发布的卡组，按名称或分类搜索。无需自己从头编写，立即开始学习。",
      },
      saveCopy: {
        title: "收藏引用或创建副本",
        body: "将卡组收藏到你的资源库（始终与原卡组保持同步），或创建自己的副本，随意编辑。",
      },
      share: {
        title: "通过链接分享",
        body: "每个卡组可设为私密、通过链接分享，或经管理员审核后发布到资料库。在社交媒体分享的链接会显示带 Logo 的预览图。",
      },
      reminders: {
        title: "每日学习提醒",
        body: "开启推送通知：当天还没学习且有待复习的卡片时，应用会在晚上提醒一次。可随时在账户设置中开启或关闭。",
      },
      offline: {
        title: "安装为应用，离线学习",
        body: "可作为应用 (PWA) 安装到手机或电脑上。支持浅色/深色主题，适配各种屏幕尺寸。",
      },
    },
    steps: {
      create: {
        title: "创建或收藏卡组",
        body: "自己编写、从文件导入，或直接使用资源库中的现成卡组。",
      },
      study: {
        title: "学习与练习",
        body: "翻转卡片，标记已记住的卡片，再做一次测验巩固所学。",
      },
      review: {
        title: "在恰当的时间复习",
        body: "每天打开“今日复习”，只需几分钟，就能记得更多。",
      },
    },
  },
  board: {
    open: "打开黑板",
    title: "黑板",
    hasContent: "黑板上有内容",
    tool: "工具",
    chalk: "粉笔",
    eraser: "板擦",
    colors: "粉笔颜色",
    color: { white: "白色", yellow: "黄色", pink: "粉色", dark: "黑色" },
    size: "笔画粗细",
    sizes: { xs: "极细", s: "细", m: "中", l: "粗" },
    picker: { open: "更多颜色", title: "选择颜色", sv: "饱和度和亮度", hue: "色相", hex: "HEX", recent: "最近使用的颜色" },
    eraserSize: "板擦大小",
    background: "黑板颜色",
    bg: { green: "绿色", black: "黑色", white: "白色" },
    undo: "撤销 (Ctrl+Z)",
    clear: "全部清除",
    download: "下载 PNG",
    canvasAria: "绘图板——可用鼠标、手指或触控笔书写",
  },
};

export default layout;
