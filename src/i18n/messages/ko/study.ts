const study = {
  meta: {
    title: "카드 학습 — Knowledge",
  },
  loading: "카드를 준비하는 중…",
  breadcrumb: {
    home: "홈",
    study: "학습",
  },
  filter: {
    aria: "학습할 카드 필터",
    all: "전체",
    starred: "별표 ({count})",
    hard: "어려운 단어 ({count})",
  },
  toolbar: {
    shuffle: "섞기",
    swap: "앞뒤 바꾸기",
    restart: "처음부터",
  },
  controls: {
    unknown: "아직 학습 중",
    known: "알아요",
    prev: "이전 카드",
    next: "다음 카드",
    flip: "카드 뒤집기",
  },
  progress: {
    known: "알아요 {count}",
    unknown: "학습 중 {count}",
    aria: "학습 진행 상황",
  },
  flashcard: {
    ariaBack: "뒷면을 보고 있어요. 누르면 다시 뒤집어요",
    ariaFront: "앞면을 보고 있어요. 누르면 뒤집어요",
    hint: "탭하여 뒤집기 ↻",
  },
  finished: {
    title: "모두 마쳤어요!",
    summary: { other: "“{title}”의 카드 {count}장을 모두 살펴봤어요." },
    known: "알아요",
    unknown: "학습 중",
    unmarked: "표시 안 함",
    quiz: "퀴즈 풀기",
    quizHint: "단어를 직접 입력하면 더 오래 기억해요",
    restartUnknown: "학습 중인 카드 다시 학습",
    restartUnmarked: "표시 안 한 카드 학습",
    restartAll: "전체 다시 학습",
    back: "세트로 돌아가기",
  },
  session: {
    emptyTitle: "이 세트에는 아직 카드가 없어요",
    emptyDescription: "카드를 추가하거나 파일에서 가져와 학습을 시작하세요.",
    addCards: "카드 추가",
    import: "파일에서 가져오기",
    restartTitle: "처음부터 다시 시작할까요?",
    restartBody: "첫 번째 카드로 돌아가요. 알아요 / 학습 중 표시는 그대로 유지돼요.",
    cancel: "취소",
    restart: "다시 시작",
    question: "질문",
    answer: "답",
    saveFailed: "진도를 저장하지 못했어요. 나중에 다시 시도할게요.",
  },
};

export default study;
