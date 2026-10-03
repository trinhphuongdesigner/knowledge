/** Quy tắc hồ sơ dùng chung cho client + server (không import gì phía server). */
export const MIN_AGE = 5;
export const MAX_AGE = 120;
export const BIRTH_YEAR_MIN = 1900;

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
