import { z } from "zod";
import { isLanguageCode } from "./languages";
import { isGender, isValidBirthYear } from "./profile";

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
    .pipe(z.string().min(1, "validation.categoryNameRequired").max(CATEGORY_NAME_MAX, "validation.categoryNameMax")),
  color: z.enum(CATEGORY_COLORS).default("BLUE"),
  isEnglish: z.boolean().default(false),
});

export const LEVELS = ["BASIC", "INTERMEDIATE", "ADVANCED"] as const;
export type Level = (typeof LEVELS)[number];

/** English fallback labels; UI translates via its own namespace. */
export const LEVEL_LABELS: Record<Level, string> = {
  BASIC: "Basic",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
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
  visibility: Visibility;
  /** false khi đây là bộ của người khác (đã lưu từ thư viện / xem qua link) */
  isOwner: boolean;
  ownerName?: string | null;
  /** chỉ có khi isOwner và đã bật chia sẻ */
  shareToken?: string | null;
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

// ── Hồ sơ (onboarding + tài khoản) ─────────────────────────────────────────
export const onboardingSchema = z.object({
  name: z.string().trim().min(1, "validation.nameRequired").max(40, "validation.nameMax"),
  fullName: z.string().trim().min(1, "validation.fullNameRequired").max(80, "validation.fullNameMax"),
  birthYear: z.coerce
    .number({ error: "validation.birthYearInvalid" })
    .int("validation.birthYearInvalid")
    .refine((y) => isValidBirthYear(y), "validation.birthYearRange"),
  nativeLanguage: z.string().refine(isLanguageCode, "validation.languageRequired"),
  gender: z.string().refine(isGender, "validation.genderRequired"),
  useGoogleAvatar: z.boolean().default(true),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

/** Cập nhật hồ sơ ở trang tài khoản: cùng các trường với onboarding (email chỉ đọc). */
export const updateProfileSchema = onboardingSchema;

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

/** Result of a finished quiz: cards answered right the first time become "known", the rest "unknown". */
export const quizResultInputSchema = z.object({
  passed: studyIds,
  failed: studyIds,
});
export type QuizResultInput = z.infer<typeof quizResultInputSchema>;

// ── Học hiệu quả / thư viện / tiện ích (đợt 7) ────────────────────────────
export const VISIBILITIES = ["PRIVATE", "LINK", "PUBLIC"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const REVIEW_MODES = ["FLASHCARD", "QUIZ", "TYPING", "MATCHING", "LISTEN", "CLOZE", "REVIEW"] as const;
export type ReviewModeValue = (typeof REVIEW_MODES)[number];

export const reviewInputSchema = z.object({
  setId: z.string().uuid(),
  mode: z.enum(REVIEW_MODES),
  items: z
    .array(
      z.object({
        cardId: z.string().uuid(),
        grade: z.number().int().min(0).max(3),
      }),
    )
    .min(1)
    .max(500),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

export const starInputSchema = z.object({ starred: z.boolean() });
export const visibilityInputSchema = z.object({ visibility: z.enum(VISIBILITIES) });

export const DAILY_GOAL_MIN = 5;
export const DAILY_GOAL_MAX = 500;
export const studySettingsSchema = z.object({
  dailyGoal: z.number().int().min(DAILY_GOAL_MIN, "validation.dailyGoalMin").max(DAILY_GOAL_MAX, "validation.dailyGoalMax"),
  pushReminders: z.boolean(),
});
export type StudySettingsInput = z.infer<typeof studySettingsSchema>;

export const aiSuggestInputSchema = z.object({
  term: z.string().trim().min(1).max(200),
  english: z.boolean(),
});
export type AiSuggestInput = z.infer<typeof aiSuggestInputSchema>;

export const searchQuerySchema = z.object({ q: z.string().trim().min(1).max(100) });

export type ReviewStateDTO = { cardId: string; due: string; interval: number; starred: boolean; hard: boolean };
export type DueSummaryDTO = { dueCount: number; newCount: number; goal: number; doneToday: number };
export type StudyStatsDTO = {
  streak: number;
  longestStreak: number;
  /** 90 ngày gần nhất */
  days: { day: string; reviewed: number; correct: number }[];
  totalReviewed: number;
  /** 0..1 */
  accuracy: number;
};
export type SearchResultDTO = { cardId: string; setId: string; setTitle: string; question: string; answer: string };
export type AiSuggestionDTO = { answer: string; explanation: string; partOfSpeech: string; phonetic?: string };
export type PublicSetDTO = StudySetDTO & { ownerName: string | null; subscriberCount: number };

/** PushSubscription.toJSON() từ trình duyệt. */
export const pushSubscribeSchema = z.object({
  endpoint: z.string().url().max(2048).refine((u) => u.startsWith("https://"), "validation.endpointHttps"),
  keys: z.object({ p256dh: z.string().min(1).max(512), auth: z.string().min(1).max(512) }),
});
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>;
export const pushUnsubscribeSchema = z.object({ endpoint: z.string().min(1).max(2048) });

export type NotificationDTO = {
  id: string;
  type: "REVIEW_REMINDER" | "SET_APPROVED" | "SET_REJECTED" | "SET_SUBSCRIBED" | "SYSTEM";
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};
export type NotificationsPageDTO = { items: NotificationDTO[]; nextCursor: string | null; unreadCount: number };
