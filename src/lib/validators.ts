import { z } from "zod";

export const CATEGORIES = ["IT", "ENGLISH"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  IT: "Công nghệ (IT)",
  ENGLISH: "Tiếng Anh",
};

export const LEVELS = ["BASIC", "INTERMEDIATE", "ADVANCED"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  BASIC: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};

export const setInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.enum(CATEGORIES),
  level: z.enum(LEVELS).optional().nullable(),
});

export const cardInputSchema = z.object({
  question: z.string().trim().min(1).max(5000),
  answer: z.string().trim().min(1).max(5000),
  explanation: z.string().trim().max(5000).optional().nullable(),
  phonetic: z.string().trim().max(200).optional().nullable(),
  partOfSpeech: z.string().trim().max(200).optional().nullable(),
  audioUrl: z.string().trim().max(1000).optional().nullable(),
});

export const bulkCardsSchema = z.object({
  mode: z.enum(["append", "replace"]).default("append"),
  cards: z.array(cardInputSchema).min(1).max(2000),
});

export type SetInput = z.infer<typeof setInputSchema>;
export type CardInput = z.infer<typeof cardInputSchema>;
export type BulkCardsInput = z.input<typeof bulkCardsSchema>;

export type StudySetDTO = {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  level: Level | null;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CardDTO = {
  id: string;
  setId: string;
  question: string;
  answer: string;
  explanation: string | null;
  phonetic: string | null;
  partOfSpeech: string | null;
  audioUrl: string | null;
  position: number;
};

export type StudySetDetailDTO = StudySetDTO & { cards: CardDTO[] };

export type DictionaryEntryDTO = {
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  audioUrl: string | null;
};

export type EnrichResultDTO = { updated: number; notFound: number; remaining: number; failed?: number };
