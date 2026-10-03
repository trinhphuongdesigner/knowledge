/** Phần thuần (không import DB) của quản lý tài khoản — test được bằng vitest. */

export const USERS_PAGE_SIZE = 25;

export const USER_SORTS = ["createdAt", "lastLoginAt", "cards", "sets"] as const;
export type UserSort = (typeof USER_SORTS)[number];

export const USER_FILTERS = ["unonboarded", "inactive", "nearlimit", "disabled"] as const;
export type UserFilter = (typeof USER_FILTERS)[number];

export const USER_FILTER_LABELS: Record<UserFilter, string> = {
  unonboarded: "Chưa hoàn tất hồ sơ",
  inactive: "Không hoạt động > 30 ngày",
  nearlimit: "Gần chạm hạn mức (≥ 80%)",
  disabled: "Đang bị khoá",
};

export const NEAR_LIMIT_PERCENT = 80;
export const INACTIVE_DAYS = 30;

export type UserListQuery = {
  q: string;
  sort: UserSort;
  dir: "asc" | "desc";
  filter: UserFilter | null;
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** Chuẩn hoá searchParams (không tin đầu vào): sort/filter theo whitelist, page >= 1. */
export function parseUserListQuery(raw: Raw): UserListQuery {
  const sortRaw = first(raw.sort);
  const sort = (USER_SORTS as readonly string[]).includes(sortRaw) ? (sortRaw as UserSort) : "createdAt";
  const filterRaw = first(raw.filter);
  const filter = (USER_FILTERS as readonly string[]).includes(filterRaw) ? (filterRaw as UserFilter) : null;
  const pageNum = Number.parseInt(first(raw.page), 10);
  return {
    q: first(raw.q).trim().slice(0, 100),
    sort,
    dir: first(raw.dir) === "asc" ? "asc" : "desc",
    filter,
    page: Number.isFinite(pageNum) && pageNum >= 1 ? Math.min(pageNum, 100000) : 1,
  };
}

/** Query string cho link (bỏ giá trị mặc định). */
export function userListHref(q: UserListQuery, patch: Partial<UserListQuery> = {}): string {
  const n = { ...q, ...patch };
  const sp = new URLSearchParams();
  if (n.q) sp.set("q", n.q);
  if (n.filter) sp.set("filter", n.filter);
  if (n.sort !== "createdAt") sp.set("sort", n.sort);
  if (n.dir !== "desc") sp.set("dir", n.dir);
  if (n.page > 1) sp.set("page", String(n.page));
  const s = sp.toString();
  return s ? `/admin/users?${s}` : "/admin/users";
}

/** Escape ký tự đặc biệt của LIKE/ILIKE (dùng với `ESCAPE '\'`). */
export function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => "\\" + c);
}

/** Phần trăm đã dùng so với hạn mức (làm tròn; hạn mức 0 → 100 nếu đã dùng, 0 nếu chưa). */
export function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return used > 0 ? 100 : 0;
  return Math.round((used / limit) * 100);
}

export type QuotaFormInput = { quotaSets: number | null; quotaCards: number | null; quotaAiPerDay: number | null };

/** Chuyển giá trị ô nhập ("" = mặc định) sang số nguyên 0..1_000_000 hoặc null; sai → undefined. */
export function parseQuotaField(raw: string): number | null | undefined {
  const t = raw.trim();
  if (t === "") return null;
  if (!/^\d{1,7}$/.test(t)) return undefined;
  const n = Number(t);
  return n <= 1_000_000 ? n : undefined;
}

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  onboardedAt: Date | null;
  lastLoginAt: Date | null;
  lastStudyDay: Date | null;
  disabledAt: Date | null;
  sets: number;
  cards: number;
  saved: number;
  reviews: number;
  setsPct: number;
  cardsPct: number;
};
