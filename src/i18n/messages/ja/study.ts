const study = {
  meta: {
    title: "カードを学習 — Knowledge",
  },
  loading: "カードを準備中…",
  breadcrumb: {
    home: "ホーム",
    study: "学習",
  },
  filter: {
    aria: "学習するカードを絞り込む",
    all: "すべて",
    starred: "スター付き（{count}）",
    hard: "苦手な単語（{count}）",
  },
  toolbar: {
    shuffle: "シャッフル",
    swap: "表裏を入れ替え",
    restart: "最初から",
  },
  controls: {
    unknown: "まだ覚えていない",
    known: "覚えた",
    prev: "前のカード",
    next: "次のカード",
    flip: "カードをめくる",
  },
  progress: {
    known: "覚えた {count}",
    unknown: "まだ覚えていない {count}",
    aria: "学習の進捗",
  },
  flashcard: {
    ariaBack: "裏面を表示中。タップすると戻ります",
    ariaFront: "表面を表示中。タップするとめくります",
    hint: "タップしてめくる ↻",
  },
  finished: {
    title: "すべて完了！",
    summary: { other: "「{title}」の {count} 枚すべてに目を通しました。" },
    known: "覚えた",
    unknown: "まだ覚えていない",
    unmarked: "未選択",
    quiz: "クイズに挑戦",
    quizHint: "単語を入力すると、より長く記憶に残ります",
    restartUnknown: "まだ覚えていないカードを学習",
    restartUnmarked: "未選択のカードを学習",
    restartAll: "すべてもう一度学習",
    back: "デッキに戻る",
  },
  session: {
    emptyTitle: "このデッキにはまだカードがありません",
    emptyDescription: "カードを追加するか、ファイルからインポートして学習を始めましょう。",
    addCards: "カードを追加",
    import: "ファイルからインポート",
    restartTitle: "最初からやり直しますか？",
    restartBody: "最初のカードに戻ります。「覚えた / まだ覚えていない」の印は保持されます。",
    cancel: "キャンセル",
    restart: "最初から",
    question: "問題",
    answer: "答え",
    saveFailed: "進捗を保存できませんでした。あとで再試行します。",
  },
};

export default study;
