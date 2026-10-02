import { z } from "zod";

export const CATEGORY_COLORS = ["BLUE", "GREEN", "AMBER", "PURPLE", "ROSE", "SLATE"] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export const CATEGORY_NAME_MAX = 40;

/** Collapse whitespace + trim: how a category name is stored. */
export function normalizeCategoryName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

/** Key for case-insensitive duplicate detection. */
export function categoryNameKey(name: string): string {
  return normalizeCategoryName(name).toLocaleLowerCase("vi");
}

export const categoryInputSchema = z.object({
  name: z
    .string()
    .transform(normalizeCategoryName)
    .pipe(z.string().min(1, "Vui lòng nhập tên danh mục").max(CATEGORY_NAME_MAX, "Tên tối đa 40 ký tự")),
  color: z.enum(CATEGORY_COLORS).default("BLUE"),
  isEnglish: z.boolean().default(false),
});

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
  categoryId: z.string().uuid(),
  level: z.enum(LEVELS).optional().nullable(),
});

/** PATCH body: every key optional, no defaults re-applied. */
export const categoryUpdateSchema = z.object({
  name: categoryInputSchema.shape.name.optional(),
  color: z.enum(CATEGORY_COLORS).optional(),
  isEnglish: z.boolean().optional(),
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
export type CategoryInput = z.input<typeof categoryInputSchema>;
export type CardInput = z.infer<typeof cardInputSchema>;
export type BulkCardsInput = z.input<typeof bulkCardsSchema>;

export type CategoryRefDTO = {
  id: string;
  name: string;
  color: CategoryColor;
  isEnglish: boolean;
};

export type CategoryDTO = CategoryRefDTO & {
  setCount: number;
  createdAt: string;
};

export type StudySetDTO = {
  id: string;
  title: string;
  description: string | null;
  category: CategoryRefDTO;
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

// ── Study progress ────────────────────────────────────────────────────────
const STUDY_IDS_MAX = 5000;
const studyIds = z.array(z.string().uuid()).max(STUDY_IDS_MAX);

export const studyProgressInputSchema = z.object({
  known: studyIds,
  unknown: studyIds,
  order: studyIds,
  index: z.number().int().min(0).max(STUDY_IDS_MAX),
  shuffle: z.boolean(),
  swap: z.boolean(),
  /** True when the user just finished a full pass: sets completedAt = now. */
  completed: z.boolean().optional(),
});
export type StudyProgressInput = z.infer<typeof studyProgressInputSchema>;
