import { db } from "./db";
import { QUOTA, effectiveLimits, evaluateQuota, type QuotaLimits, type QuotaViolation, type QuotaRequest, type QuotaUsage } from "./quota-limits";

export * from "./quota-limits";

export async function getUsage(userId: string): Promise<QuotaUsage> {
  const [sets, cards, subscriptions] = await Promise.all([
    db.studySet.count({ where: { userId } }),
    db.card.count({ where: { set: { userId } } }),
    db.setSubscription.count({ where: { userId } }),
  ]);
  return { sets, cards, subscriptions };
}

/** Hạn mức hiệu lực của user: mặc định (QUOTA) + override riêng trong DB (nếu có). */
export async function getUserLimits(userId: string): Promise<QuotaLimits> {
  const overrides = await db.user.findUnique({
    where: { id: userId },
    select: { quotaSets: true, quotaCards: true, quotaAiPerDay: true },
  });
  return effectiveLimits(QUOTA, overrides);
}

/** Trả vi phạm hạn mức (dịch bằng quotaExceeded() trong http.ts) nếu vượt giới hạn, null nếu được phép. ADMIN không bị giới hạn. */
export async function checkQuota(
  user: { id: string; role: "USER" | "ADMIN" },
  req: QuotaRequest,
): Promise<QuotaViolation | null> {
  if (user.role === "ADMIN") return null;
  const [usage, limits] = await Promise.all([getUsage(user.id), getUserLimits(user.id)]);
  const setCardCount = req.setId && req.cards ? await db.card.count({ where: { setId: req.setId } }) : 0;
  return evaluateQuota(limits, usage, req, setCardCount);
}
