const layout = {
  title: "Knowledge — フラッシュカードで学ぶ",
  description: "フラッシュカードで IT と英語を復習",
  footer: {
    about: "概要",
    terms: "利用規約",
    privacy: "プライバシー",
    ecosystem: "Trinh Phuong のエコシステム",
    bongDaTuNhi: "Bóng Đá Tú Nhi",
  },
  header: {
    search: "検索",
    searchTitle: "検索 (/)",
    about: "概要",
    login: "ログイン",
  },
  theme: {
    label: "外観",
    system: "システム",
    light: "ライト",
    dark: "ダーク",
  },
  userMenu: {
    account: "アカウント",
    review: "今日の復習",
    library: "ライブラリ",
    search: "検索",
    about: "概要",
    accountSettings: "アカウント設定",
    admin: "管理",
    signOut: "ログアウト",
  },
  install: {
    button: "アプリをインストール",
    iosAria: "iPhone へのアプリのインストール方法",
    iosTitle: "iPhone に Knowledge をインストール",
    step1: "ブラウザの**共有**ボタン（または **···** メニュー → 共有）をタップします。",
    step2: "**ホーム画面に追加**を選び、**追加**をタップします。",
    iosNote: "「ホーム画面に追加」が見つかりませんか？共有シートを下までスクロールするか、「その他」をタップしてください。",
  },
  offline: "オフラインです。一部の機能が利用できない場合があります。",
  home: {
    greeting: "こんにちは 👋",
    greetingNamed: "こんにちは、{name} さん 👋",
    heading: "今日は何を**復習**しますか？",
    subtitle: "復習するデッキを選ぶか、新しく作成しましょう。",
    explore: "ライブラリを見る",
    emptyFilteredTitle: "一致するデッキが見つかりません",
    emptyTitle: "デッキはまだありません",
    emptyFilteredDescription: "別のキーワードやフィルターをお試しください。",
    emptyDescription: "最初のデッキを作成して、フラッシュカード学習を始めましょう。",
    saved: "保存したライブラリ",
    inProgress: "学習中",
  },
  about: {
    metaTitle: "概要 — Knowledge",
    metaDescription:
      "Knowledge はフラッシュカード学習アプリです。カードめくり、間隔反復、クイズ、手書きボード、共有ライブラリ、オフライン学習に対応。",
    badge: "概要",
    heroTitle: "Knowledge でもっと覚えよう",
    heroBody:
      "Knowledge は、IT の知識や英単語、そのほか覚えたいことなら何でも使えるフラッシュカードアプリです。カードを作成し、最適なタイミングで復習し、コミュニティとデッキのライブラリを共有できます。",
    ctaHome: "マイページへ",
    ctaLibrary: "ライブラリを見る",
    ctaStart: "無料で始める",
    ctaLogin: "ログイン",
    featuresTitle: "主な機能",
    newBadge: "新機能",
    stepsTitle: "始め方",
    features: {
      cards: {
        title: "フラッシュカードとデッキ",
        body: "カテゴリとレベルごとにセットを作成。各カードに問題・答え・解説（Markdown 対応）を設定できます。詳細リスト表示とめくれるカード表示を切り替え、気になるカードにはスターを付けられます。",
      },
      progress: {
        title: "続きからすぐ再開",
        body: "学習途中のセットはホームの一番上に表示され、進捗バーと、全部覚えたらクイズを促す表示が付きます。1 周終えると、次にやるべきことを提案します。",
      },
      srs: {
        title: "間隔反復 (SRS)",
        body: "覚え具合に合わせて各カードの復習日を自動で決めます。復習はカードめくりか単語入力で。よく忘れる単語は「苦手」としてマークされ、安定して思い出せるようになると自動で外れます。1 日の目標を自分で設定し、連続学習日数や統計も確認できます。",
      },
      modes: {
        title: "多彩な練習モード",
        body: "選択式、答えの入力、マッチング、聞き取って選ぶ、穴埋めに対応。覚え方に合わせてモードを選べます。",
      },
      vocab: {
        title: "英単語を学ぶ",
        body: "英語カテゴリでは発音記号・品詞・意味・例文を自動提案し、発音ボタンや単語追加時の AI 提案も使えます。IPA 発音記号表（単母音・二重母音・子音）のセットも用意しています。",
      },
      board: {
        title: "手書きボード",
        body: "どのページでもフローティングの黒板を開いて、マウス・指・ペンでメモや書き取り練習ができます。色や線の太さの変更、消しゴム、元に戻す、PNG 保存に対応。",
      },
      importExport: {
        title: "インポートとエクスポート",
        body: "CSV、Excel、Markdown から一括インポートできます（テンプレートとプレビュー付き）。デッキはいつでもファイルに書き出せます。",
      },
      library: {
        title: "共有ライブラリ",
        body: "公開されているデッキを閲覧し、名前やカテゴリで検索できます。自分で一から作らなくても、すぐに学習を始められます。",
      },
      saveCopy: {
        title: "参照として保存、またはコピー",
        body: "デッキを自分のライブラリに保存すれば（元のデッキと常に同期）、コピーを作って自由に編集することもできます。",
      },
      share: {
        title: "リンクで共有",
        body: "各セットは非公開、リンクで共有、または管理者の承認後にライブラリへ公開できます。SNS で共有したリンクにはロゴ入りのプレビュー画像が表示されます。",
      },
      reminders: {
        title: "毎日の学習リマインダー",
        body: "プッシュ通知をオンにすると、まだ学習しておらず復習カードが残っている日の夕方に 1 回お知らせします。アカウント設定からいつでもオン／オフできます。",
      },
      offline: {
        title: "アプリとしてインストール、オフラインでも学習",
        body: "スマートフォンやパソコンにアプリ (PWA) としてインストールできます。ライト / ダークテーマに対応し、あらゆる画面サイズで快適に使えます。",
      },
    },
    steps: {
      create: {
        title: "デッキを作成または保存",
        body: "自分で作る、ファイルからインポートする、ライブラリの既成デッキを使う、のどれでも始められます。",
      },
      study: {
        title: "学習と練習",
        body: "カードをめくり、覚えたものに印を付けて、最後にクイズで定着させましょう。",
      },
      review: {
        title: "最適なタイミングで復習",
        body: "毎日「今日の復習」を開けば、数分でもっと覚えられます。",
      },
    },
  },
  board: {
    open: "ボードを開く",
    title: "ボード",
    hasContent: "ボードに内容があります",
    tool: "ツール",
    chalk: "チョーク",
    eraser: "黒板消し",
    colors: "チョークの色",
    color: { white: "白", yellow: "黄", pink: "ピンク", dark: "黒" },
    size: "線の太さ",
    sizes: { xs: "極細", s: "細", m: "中", l: "太" },
    picker: { open: "その他の色", title: "色を選ぶ", sv: "彩度と明度", hue: "色相", hex: "HEX", recent: "最近使った色" },
    eraserSize: "黒板消しの大きさ",
    background: "ボードの色",
    bg: { green: "緑", black: "黒", white: "白" },
    undo: "元に戻す (Ctrl+Z)",
    clear: "すべて消去",
    download: "PNG をダウンロード",
    canvasAria: "描画ボード — マウス、指、ペンで書けます",
  },
};

export default layout;
