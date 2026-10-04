/** Quy tắc hồ sơ dùng chung cho client + server (không import gì phía server). */
export const MIN_AGE = 5;
export const MAX_AGE = 120;
export const BIRTH_YEAR_MIN = 1900;

/** Khớp enum Prisma `Gender`. */
export const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof GENDERS)[number];

export function isGender(v: unknown): v is Gender {
  return typeof v === "string" && (GENDERS as readonly string[]).includes(v);
}

export function currentYear(now: Date = new Date()): number {
  return now.getFullYear();
}

/** Tuổi ước tính (hiệu của năm hiện tại và năm sinh). */
export function ageFromBirthYear(birthYear: number, now: Date = new Date()): number {
  return currentYear(now) - birthYear;
}

/** Năm sinh hợp lệ: số nguyên, 1900..năm nay và tuổi ước tính nằm trong 5–120. */
export function isValidBirthYear(birthYear: number, now: Date = new Date()): boolean {
  if (!Number.isInteger(birthYear)) return false;
  if (birthYear < BIRTH_YEAR_MIN || birthYear > currentYear(now)) return false;
  const age = ageFromBirthYear(birthYear, now);
  return age >= MIN_AGE && age <= MAX_AGE;
}

/** Ảnh đại diện hiệu lực: ảnh Google nếu người dùng bật và có, ngược lại null (dùng ảnh mặc định theo giới tính). */
export function effectiveAvatarUrl(user: { avatarUrl?: string | null; useGoogleAvatar?: boolean | null }): string | null {
  return user.useGoogleAvatar && user.avatarUrl ? user.avatarUrl : null;
}

export const AVATAR_URL_MAX = 1000;

/** Chỉ nhận URL ảnh https hợp lệ, tối đa 1000 ký tự; ngược lại trả null. */
export function sanitizePictureUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim();
  if (!v || v.length > AVATAR_URL_MAX) return null;
  try {
    return new URL(v).protocol === "https:" ? v : null;
  } catch {
    return null;
  }
}
