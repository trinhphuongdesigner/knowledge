const importNs = {
  loading: "カードのインポートを準備中…",
  page: {
    metaTitle: "カードをインポート — Knowledge",
    home: "ホーム",
    breadcrumb: "ファイルからインポート",
    title: "カードをインポート：{title}",
  },
  steps: { label: "インポートの手順", source: "ソースを選択", preview: "プレビューして保存" },
  tabs: { label: "データソース", file: "ファイルをアップロード", paste: "テキストを貼り付け" },
  format: { label: "形式", csv: "CSV（, ; またはタブ区切り）", markdown: "Markdown" },
  content: {
    label: "内容",
    placeholderCsv: "question,answer,explanation\nクロージャとは？,スコープを記憶する関数,例：カウンター",
    placeholderMarkdown: "Q: クロージャとは？\nA: スコープを記憶する関数\nE: 例：カウンター",
  },
  actions: { preview: "プレビュー", back: "戻る", cancel: "キャンセル" },
  templates: { title: "サンプルファイルをダウンロード", csv: "CSV サンプル", excel: "Excel サンプル", markdown: "Markdown サンプル" },
  guide: {
    title: "形式のガイド",
    csv: "CSV / Excel：1 行目はヘッダー（question、answer、explanation）です。ヘッダーがない場合は、1 列目 = 問題、2 列目 = 答え、3 列目 = 解説として扱います。",
    heading: "Markdown の見出し：## 問題、その下のテキストが答えになります。> で始まる行や --- より後の部分は解説になります。",
    qa: "Markdown の Q/A：Q:/A:/E:（または Question:/Answer:/Explanation:）で書き、カードは空行で区切ります。",
    table: "Markdown の表：| question | answer | explanation |。",
    english:
      "英語（任意）：phonetic/IPA と partOfSpeech/pos の列を追加できます。Markdown の Q/A では P: で発音記号を書きます。発音記号がないカードは、保存後に自動で検索されます（インターネット接続が必要です）。",
    max: "1 回のインポートは最大 {max} 枚までです。",
  },
  mode: {
    title: "保存方法",
    append: "末尾に追加",
    appendHint: "既存のカードを残したまま、新しいカードをその後ろに追加します。",
    replace: "すべて置き換え",
    replaceHint: "既存のカードをすべて削除し、これらのカードに置き換えます。",
    replaceWarning: "警告：このデッキの既存のカードはすべて完全に削除されます。",
  },
  errors: {
    tooMany: "1 回のインポートは最大 {max} 枚までです（現在 {count} 枚）。いくつか削除するか、ファイルを分割してください。",
    invalid: {
      other: "{count} 枚のカードに問題または答えがありません。入力するか、削除してください。",
    },
  },
  parse: {
    noCards: "カードを読み取れませんでした。{row}{message}",
    rowPrefix: "{row} 行目：",
    empty: "データにカードが見つかりません。",
    pickFile: "先にファイルを選択してください。",
    pasteContent: "インポートする内容を貼り付けてください。",
    failed: "データを読み取れませんでした。",
    unsupportedFormat: "ファイル形式「{format}」には対応していません。.csv、.xlsx、.xls、.md、.markdown、.txt のいずれかを使用してください。",
  },
  parseErrors: {
    missingQuestion: "問題がありません",
    missingAnswer: "答えがありません",
    missingBoth: "問題と答えの両方がありません",
    missingAnswerFor: "「{text}」の答えがありません",
    csvFormat: "CSV 形式のエラー：{text}",
    noSheet: "Excel ファイルにシートがありません",
    orphanLine: "カードの外にある行です（Q: / Question: で始める必要があります）",
    unknownMarkdown: "Markdown の形式を認識できませんでした（見出し、Q:/A:、または表を使用してください）",
  },
  save: {
    lookingUp: "発音記号を検索中…",
    lookingUpProgress: "発音記号を検索中 {done}/{total}",
    lookupInterrupted:
      "カードは保存されましたが、一部のカードの発音記号を検索できませんでした（インターネット接続が必要です）。後でデッキのページから発音記号の検索ボタンを押してください。",
    failed: "保存に失敗しました。もう一度お試しください。",
    saving: "保存中…",
    button: { other: "{count} 枚のカードを保存" },
  },
  replaceModal: {
    title: "すべてのカードを置き換えますか？",
    body: {
      other: "このデッキの既存のカードはすべて完全に削除され、今入力した {count} 枚のカードに置き換えられます。",
    },
    confirm: "置き換える",
  },
  fields: { question: "問題", answer: "答え", explanation: "解説" },
  preview: {
    valid: { other: "有効なカード {count} 枚" },
    errorRows: { other: "エラー行 {count} 件（スキップされます）" },
    errorTitle: "次の行は読み取れなかったため、スキップされます",
    empty: "インポートするカードがありません。",
    delete: "削除",
    required: "必須項目です",
    card: "カード",
    deleteCard: "カード {n} を削除",
    fieldLabel: "{field} — カード {n}",
  },
  dropzone: {
    aria: "インポートするファイルを選択、またはドラッグ＆ドロップ",
    prompt: "ここにファイルをドラッグ＆ドロップするか、",
    promptAction: "クリックしてファイルを選択",
    supported: ".csv、.xlsx、.xls、.md、.markdown、.txt に対応",
    clear: "選択したファイルを削除",
  },
};

export default importNs;
