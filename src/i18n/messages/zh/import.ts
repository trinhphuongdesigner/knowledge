const importNs = {
  loading: "正在准备导入卡片…",
  page: {
    metaTitle: "导入卡片 — Knowledge",
    home: "首页",
    breadcrumb: "从文件导入",
    title: "导入卡片到：{title}",
  },
  steps: { label: "导入步骤", source: "选择来源", preview: "预览并保存" },
  tabs: { label: "数据来源", file: "上传文件", paste: "粘贴文本" },
  format: { label: "格式", csv: "CSV（以 , ; 或 Tab 分隔）", markdown: "Markdown" },
  content: {
    label: "内容",
    placeholderCsv: "question,answer,explanation\n什么是闭包？,能记住其作用域的函数,示例：计数器",
    placeholderMarkdown: "Q: 什么是闭包？\nA: 能记住其作用域的函数\nE: 示例：计数器",
  },
  actions: { preview: "预览", back: "返回", cancel: "取消" },
  templates: { title: "下载示例文件", csv: "CSV 示例", excel: "Excel 示例", markdown: "Markdown 示例" },
  guide: {
    title: "格式说明",
    csv: "CSV / Excel：第一行为表头（question、answer、explanation）。没有表头时，第 1 列 = 问题，第 2 列 = 答案，第 3 列 = 解释。",
    heading: "Markdown 标题：## 问题，其下的文字为答案；以 > 开头的行或 --- 之后的部分为解释。",
    qa: "Markdown 问答：Q:/A:/E:（或 Question:/Answer:/Explanation:），卡片之间用空行分隔。",
    table: "Markdown 表格：| question | answer | explanation |。",
    english:
      "英语（可选）：添加 phonetic/IPA 和 partOfSpeech/pos 列；在 Markdown 问答中用 P: 表示音标。缺少音标的卡片会在保存后自动查询（需要联网）。",
    max: "每次最多导入 {max} 张卡片。",
  },
  mode: {
    title: "保存方式",
    append: "添加到末尾",
    appendHint: "保留现有卡片，并将新卡片添加到其后。",
    replace: "全部替换",
    replaceHint: "删除所有现有卡片，并替换为这些卡片。",
    replaceWarning: "警告：此卡组中所有现有卡片都将被永久删除。",
  },
  errors: {
    tooMany: "每次最多导入 {max} 张卡片（你有 {count} 张）。请删减一些或拆分文件。",
    invalid: {
      other: "有 {count} 张卡片缺少问题或答案。请补全或删除它们。",
    },
  },
  parse: {
    noCards: "无法读取任何卡片。{row}{message}",
    rowPrefix: "第 {row} 行：",
    empty: "数据中没有找到卡片。",
    pickFile: "请先选择一个文件。",
    pasteContent: "请粘贴要导入的内容。",
    failed: "无法读取数据。",
    unsupportedFormat: "不支持“{format}”文件格式。请使用 .csv、.xlsx、.xls、.md、.markdown 或 .txt。",
  },
  parseErrors: {
    missingQuestion: "缺少问题",
    missingAnswer: "缺少答案",
    missingBoth: "缺少问题和答案",
    missingAnswerFor: "“{text}”缺少答案",
    csvFormat: "CSV 格式错误：{text}",
    noSheet: "此 Excel 文件中没有工作表",
    orphanLine: "该行不在任何卡片内（必须以 Q: / Question: 开头）",
    unknownMarkdown: "无法识别 Markdown 格式（请使用标题、Q:/A: 或表格）",
  },
  save: {
    lookingUp: "正在查询音标…",
    lookingUpProgress: "正在查询音标 {done}/{total}",
    lookupInterrupted:
      "卡片已保存，但部分卡片的音标未能查询（需要联网）。你可以稍后在卡组页面点击查询音标按钮。",
    failed: "保存失败，请重试。",
    saving: "正在保存…",
    button: { other: "保存 {count} 张卡片" },
  },
  replaceModal: {
    title: "替换所有卡片？",
    body: {
      other: "此卡组中所有现有卡片都将被永久删除，并替换为你刚刚输入的 {count} 张卡片。",
    },
    confirm: "替换",
  },
  fields: { question: "问题", answer: "答案", explanation: "解释" },
  preview: {
    valid: { other: "{count} 张有效卡片" },
    errorRows: { other: "{count} 行有误（将被跳过）" },
    errorTitle: "以下行无法读取，将被跳过",
    empty: "没有可导入的卡片了。",
    delete: "删除",
    required: "不能为空",
    card: "卡片",
    deleteCard: "删除第 {n} 张卡片",
    fieldLabel: "{field} — 第 {n} 张卡片",
  },
  dropzone: {
    aria: "选择文件，或拖放文件以导入",
    prompt: "将文件拖放到此处，或",
    promptAction: "点击选择文件",
    supported: "支持 .csv、.xlsx、.xls、.md、.markdown、.txt",
    clear: "移除已选文件",
  },
};

export default importNs;
