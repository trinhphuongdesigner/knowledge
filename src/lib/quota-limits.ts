/** Phần thuần của quota (không import DB) — test được bằng vitest. */
export type QuotaLimits = {
  setsPerUser: number;
  cardsPerUser: number;
  cardsPerSet: number;
  subscriptionsPerUser: number;
  aiPerDay: number;
};

export const DEFAULT_QUOTA: QuotaLimits = {
  setsPerUser: 100,
  cardsPerUser: 5000,
  cardsPerSet: 2000,
  subscriptionsPerUser: 200,
  aiPerDay: 50,
};

const ENV_KEYS: Record<keyof QuotaLimits, string> = {
  setsPerUser: "QUOTA_SETS_PER_USER",
  cardsPerUser: "QUOTA_CARDS_PER_USER",
  cardsPerSet: "QUOTA_CARDS_PER_SET",
  subscriptionsPerUser: "QUOTA_SUBSCRIPTIONS_PER_USER",
  aiPerDay: "QUOTA_AI_PER_DAY",
};

/** Ghi đè mặc định bằng env `QUOTA_*` (số nguyên >= 0; giá trị sai bị bỏ qua). */
export function parseQuota(env: Record<string, string | undefined>): QuotaLimits {
  const out = { ...DEFAULT_QUOTA };
  for (const key of Object.keys(ENV_KEYS) as (keyof QuotaLimits)[]) {
    const raw = env[ENV_KEYS[key]]?.trim();
    if (raw && /^\d+$/.test(raw)) out[key] = Number(raw);
  }
  return out;
}

export const QUOTA: QuotaLimits = parseQuota(process.env);

export type QuotaUsage = { sets: number; cards: number; subscriptions: number };

export type QuotaRequest = {
  /** số bộ thẻ sắp tạo thêm */
  sets?: number;
  /** số thẻ sắp thêm */
  cards?: number;
  /** bộ thẻ sẽ nhận thẻ mới (kiểm giới hạn mỗi bộ) */
  setId?: string;
  /** số lượt lưu thư viện sắp thêm */
  subscriptions?: number;
};

/** Thuần: so sánh với giới hạn, trả thông báo lỗi tiếng Việt hoặc null. */
export function evaluateQuota(
  limits: QuotaLimits,
  usage: QuotaUsage,
  req: QuotaRequest,
  setCardCount = 0,
): string | null {
  if (req.sets && usage.sets + req.sets > limits.setsPerUser) {
    return `Bạn đã đạt giới hạn ${limits.setsPerUser} bộ thẻ. Hãy xoá bớt bộ không dùng.`;
  }
  if (req.cards) {
    if (req.setId && setCardCount + req.cards > limits.cardsPerSet) {
      return `Mỗi bộ thẻ tối đa ${limits.cardsPerSet} thẻ.`;
    }
    if (usage.cards + req.cards > limits.cardsPerUser) {
      return `Bạn đã đạt giới hạn ${limits.cardsPerUser} thẻ trong tài khoản.`;
    }
  }
  if (req.subscriptions && usage.subscriptions + req.subscriptions > limits.subscriptionsPerUser) {
    return `Bạn đã lưu tối đa ${limits.subscriptionsPerUser} bộ từ thư viện.`;
  }
  return null;
}
