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

// ── Auth ──────────────────────────────────────────────────────────────────
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Vui lòng nhập email")
  .max(254, "Email quá dài")
  .email("Email không hợp lệ");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Vui lòng nhập mật khẩu").max(128, "Mật khẩu quá dài"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().max(100, "Tên quá dài").optional(),
    email: emailField,
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(128, "Mật khẩu tối đa 128 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

// ── Account ───────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().trim().max(80, "Tên tối đa 80 ký tự").optional(),
  email: emailField,
  currentPassword: z.string().max(128, "Mật khẩu quá dài").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại").max(128, "Mật khẩu quá dài"),
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(128, "Mật khẩu tối đa 128 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
  });
