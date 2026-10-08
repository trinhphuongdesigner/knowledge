const study = {
  meta: {
    title: "学习卡片 — Knowledge",
  },
  loading: "正在准备卡片…",
  breadcrumb: {
    home: "首页",
    study: "学习",
  },
  filter: {
    aria: "筛选要学习的卡片",
    all: "全部",
    starred: "已加星标（{count}）",
    hard: "难词（{count}）",
  },
  toolbar: {
    shuffle: "随机打乱",
    swap: "交换正反面",
    restart: "重新开始",
  },
  controls: {
    unknown: "还在学",
    known: "已掌握",
    prev: "上一张卡片",
    next: "下一张卡片",
    flip: "翻转卡片",
  },
  progress: {
    known: "已掌握 {count}",
    unknown: "还在学 {count}",
    aria: "学习进度",
  },
  flashcard: {
    ariaBack: "当前显示背面，点按可翻回",
    ariaFront: "当前显示正面，点按可翻转",
    hint: "点按翻转 ↻",
  },
  finished: {
    title: "全部完成！",
    summary: { other: "你已学完“{title}”中的全部 {count} 张卡片。" },
    known: "已掌握",
    unknown: "还在学",
    unmarked: "未标记",
    quiz: "参加测验",
    quizHint: "输入单词，记得更久",
    restartUnknown: "学习还没掌握的卡片",
    restartUnmarked: "学习未标记的卡片",
    restartAll: "全部重新学习",
    back: "返回卡组",
  },
  session: {
    emptyTitle: "此卡组还没有卡片",
    emptyDescription: "添加卡片或从文件导入，即可开始学习。",
    addCards: "添加卡片",
    import: "从文件导入",
    restartTitle: "重新开始？",
    restartBody: "你将回到第一张卡片，已标记的“已掌握 / 还在学”会保留。",
    cancel: "取消",
    restart: "重新开始",
    question: "问题",
    answer: "答案",
    saveFailed: "无法保存你的进度，稍后将重试。",
  },
};

export default study;
