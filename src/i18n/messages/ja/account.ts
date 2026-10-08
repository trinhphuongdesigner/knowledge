const account = {
  metaTitle: "アカウント設定 — Knowledge",
  title: "アカウント設定",
  breadcrumb: "アカウント",
  loading: "アカウントを読み込み中…",
  tabsLabel: "アカウント設定",
  tabs: {
    history: "学習履歴",
    stats: "統計",
    settings: "学習設定",
    profile: "プロフィール",
  },
  export: {
    title: "自分のデータをダウンロード",
    description: "プロフィール、カテゴリ、デッキ、進捗、統計を JSON 形式で書き出します。",
    button: "ダウンロード",
  },
  profile: {
    updated: "アカウント情報を更新しました",
    signedInWithGoogle: "Google でログイン中",
    saveChanges: "変更を保存",
    useGoogleAvatar: "Google の写真を使う",
    displayName: "表示名",
    fullName: "氏名",
    gender: "性別",
    birthYear: "生まれた年",
    birthYearPlaceholder: "例：2000",
    age: {
      other: "約 {count} 歳",
    },
    nativeLanguage: "母語",
    genders: {
      MALE: "男性",
      FEMALE: "女性",
      OTHER: "その他",
    },
  },
  uiLanguage: {
    label: "表示言語",
    hint: "アプリ内のメニュー、ボタン、メッセージに使う言語です。学習に使う母語の設定とは別です。",
    saved: "表示言語を更新しました",
    saveFailed: "表示言語を変更できませんでした",
    invalid: "未対応の言語です",
  },
  sound: {
    label: "クイズの効果音",
    hint: "正解すると「ピンポン」が鳴ります。「単語を入力」と「穴埋め」（英語セット）では、先に単語を読み上げてから鳴ります。不正解では低い音が鳴ります。この端末のみに適用されます。",
  },
  avatar: {
    male: "デフォルトのアバター — 男性",
    female: "デフォルトのアバター — 女性",
    anonymous: "デフォルトのアバター — 匿名",
    alt: "プロフィール画像",
    altNamed: "{name} さんのプロフィール画像",
  },
  push: {
    title: "この端末での通知",
    enable: "通知をオンにする",
    disable: "通知をオフにする",
    enableFailed: "通知をオンにできませんでした",
    disableFailed: "通知をオフにできませんでした",
    missingKey: "ブラウザからサブスクリプションキーが返されませんでした",
    iosHint:
      "iPhone / iPad の場合：アプリをホーム画面に追加し（共有 → ホーム画面に追加）、そのアイコンから開いて通知をオンにしてください。",
    status: {
      checking: "確認中…",
      unsupported: "このブラウザはプッシュ通知に対応していません。",
      noKey: "サーバーでプッシュ通知が設定されていません。",
      noSw: "アプリを本番ビルドで実行している場合のみ利用できます（Service Worker が必要です）。",
      denied:
        "通知がブロックされています。ブラウザの設定でこのサイトの通知を許可してから、ページを再読み込みしてください。",
      off: "この端末ではオフです。",
      on: "この端末ではオンです。",
    },
  },
  history: {
    emptyTitle: "学習履歴はまだありません",
    emptyDescription: "デッキの学習を始めると、ここに進捗が表示されます。",
    emptyAction: "学習するデッキを選ぶ",
    mastered: "習得済み",
    setsStudied: "学習したデッキ",
    progress: "進捗",
    words: {
      other: "{count} 語",
    },
    cards: {
      other: "{count} 枚",
    },
    progressHint: "{known}/{total} 枚",
    progressOf: "{title} の進捗",
    completed: "完了",
    inProgress: "学習中",
    lastStudied: "最終学習：{date}",
    studyAgain: "もう一度学習",
    continue: "学習を続ける",
  },
  studySettings: {
    dailyGoal: "1 日の目標（{min}〜{max} 枚）",
    dailyGoalError: "{min} から {max} までの整数を入力してください",
    saved: "学習設定を保存しました",
    saveFailed: "設定を保存できませんでした",
    reminders: "プッシュ通知で学習をリマインド",
    remindersHint:
      "その日にまだ学習しておらず、復習期限のカードがある場合に、1 日 1 回まで（19:00 頃）通知します。通知はベルのアイコンにも表示されます。",
    save: "設定を保存",
  },
};

export default account;
