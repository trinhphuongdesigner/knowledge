export type ParsedCard = {
  question: string;
  answer: string;
  explanation?: string;
  phonetic?: string;
  partOfSpeech?: string;
};
/** Mã lỗi — UI dịch qua namespace "import" (`parseErrors.<code>`); `text` là tham số {text}. */
export type ParseErrorCode =
  | "missingQuestion"
  | "missingAnswer"
  | "missingBoth"
  | "missingAnswerFor"
  | "csvFormat"
  | "noSheet"
  | "orphanLine"
  | "unknownMarkdown";
export type ParseError = { row: number; code: ParseErrorCode; text?: string };
export type ParseResult = { cards: ParsedCard[]; errors: ParseError[] };
