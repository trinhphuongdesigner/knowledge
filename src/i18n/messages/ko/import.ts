const importNs = {
  loading: "카드 가져오기를 준비하는 중…",
  page: {
    metaTitle: "카드 가져오기 — Knowledge",
    home: "홈",
    breadcrumb: "파일에서 가져오기",
    title: "카드 가져오기: {title}",
  },
  steps: { label: "가져오기 단계", source: "소스 선택", preview: "미리보기 및 저장" },
  tabs: { label: "데이터 소스", file: "파일 업로드", paste: "텍스트 붙여넣기" },
  format: { label: "형식", csv: "CSV (, ; 또는 Tab으로 구분)", markdown: "Markdown" },
  content: {
    label: "내용",
    placeholderCsv: "question,answer,explanation\nWhat is a closure?,A function that remembers its scope,Example: counter",
    placeholderMarkdown: "Q: What is a closure?\nA: A function that remembers its scope\nE: Example: counter",
  },
  actions: { preview: "미리보기", back: "뒤로", cancel: "취소" },
  templates: { title: "샘플 파일 다운로드", csv: "CSV 샘플", excel: "Excel 샘플", markdown: "Markdown 샘플" },
  guide: {
    title: "형식 안내",
    csv: "CSV / Excel: 첫 행은 헤더(question, answer, explanation)예요. 헤더가 없으면 1열 = 질문, 2열 = 답, 3열 = 설명으로 처리해요.",
    heading: "Markdown 제목: ## 질문, 아래 텍스트는 답이에요. >로 시작하는 줄이나 --- 뒤의 내용은 설명이에요.",
    qa: "Markdown Q/A: Q:/A:/E:(또는 Question:/Answer:/Explanation:)를 사용하고, 카드는 빈 줄로 구분해요.",
    table: "Markdown 표: | question | answer | explanation |",
    english:
      "영어(선택): phonetic/IPA와 partOfSpeech/pos 열을 추가하세요. Markdown Q/A에서는 P:로 발음 기호를 적어요. 발음 기호가 없는 카드는 저장 후 자동으로 검색해요(인터넷 필요).",
    max: "한 번에 최대 {max}장까지 가져올 수 있어요.",
  },
  mode: {
    title: "저장 방식",
    append: "끝에 추가",
    appendHint: "기존 카드는 그대로 두고 새 카드를 뒤에 추가해요.",
    replace: "전체 교체",
    replaceHint: "기존 카드를 모두 삭제하고 이 카드들로 바꿔요.",
    replaceWarning: "주의: 이 세트의 기존 카드가 모두 영구적으로 삭제돼요.",
  },
  errors: {
    tooMany: "한 번에 최대 {max}장까지 가져올 수 있어요(현재 {count}장). 일부를 삭제하거나 파일을 나눠 주세요.",
    invalid: {
      other: "질문 또는 답이 비어 있는 카드가 {count}장 있어요. 내용을 채우거나 삭제해 주세요.",
    },
  },
  parse: {
    noCards: "읽을 수 있는 카드가 없어요. {row}{message}",
    rowPrefix: "{row}행: ",
    empty: "데이터에서 카드를 찾지 못했어요.",
    pickFile: "먼저 파일을 선택해 주세요.",
    pasteContent: "가져올 내용을 붙여넣어 주세요.",
    failed: "데이터를 읽지 못했어요.",
    unsupportedFormat: '"{format}" 파일 형식은 지원하지 않아요. .csv, .xlsx, .xls, .md, .markdown 또는 .txt를 사용하세요.',
  },
  parseErrors: {
    missingQuestion: "질문이 없어요",
    missingAnswer: "답이 없어요",
    missingBoth: "질문과 답이 모두 없어요",
    missingAnswerFor: '"{text}"의 답이 없어요',
    csvFormat: "CSV 형식 오류: {text}",
    noSheet: "Excel 파일에 시트가 없어요",
    orphanLine: "카드 밖에 있는 줄이에요 (Q: / Question:으로 시작해야 해요)",
    unknownMarkdown: "Markdown 형식을 인식하지 못했어요 (제목, Q:/A: 또는 표를 사용하세요)",
  },
  save: {
    lookingUp: "발음 기호를 검색하는 중…",
    lookingUpProgress: "발음 기호 검색 중 {done}/{total}",
    lookupInterrupted:
      "카드를 저장했지만 일부 카드의 발음 기호를 검색하지 못했어요(인터넷 필요). 나중에 세트 페이지에서 발음 기호 검색 버튼을 눌러 주세요.",
    failed: "저장하지 못했어요. 다시 시도해 주세요.",
    saving: "저장하는 중…",
    button: { other: "카드 {count}장 저장" },
  },
  replaceModal: {
    title: "모든 카드를 교체할까요?",
    body: {
      other: "이 세트의 기존 카드가 모두 영구적으로 삭제되고, 방금 입력한 카드 {count}장으로 교체돼요.",
    },
    confirm: "교체",
  },
  fields: { question: "질문", answer: "답", explanation: "설명" },
  preview: {
    valid: { other: "유효한 카드 {count}장" },
    errorRows: { other: "오류 행 {count}개 (건너뜀)" },
    errorTitle: "다음 행은 읽을 수 없어 건너뛰어요",
    empty: "가져올 카드가 남아 있지 않아요.",
    delete: "삭제",
    required: "비워 둘 수 없어요",
    card: "카드",
    deleteCard: "{n}번 카드 삭제",
    fieldLabel: "{field} — {n}번 카드",
  },
  dropzone: {
    aria: "가져올 파일을 선택하거나 끌어다 놓기",
    prompt: "여기에 파일을 끌어다 놓거나",
    promptAction: "클릭해서 파일 선택",
    supported: ".csv, .xlsx, .xls, .md, .markdown, .txt 지원",
    clear: "선택한 파일 제거",
  },
};

export default importNs;
