export type ParsedCard = {
  question: string;
  answer: string;
  explanation?: string;
  phonetic?: string;
  partOfSpeech?: string;
};
export type ParseError = { row: number; message: string };
export type ParseResult = { cards: ParsedCard[]; errors: ParseError[] };
