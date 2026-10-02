import { db } from "./db";
import { QUOTA, evaluateQuota, type QuotaRequest, type QuotaUsage } from "./quota-limits";

export * from "./quota-limits";

export async function getUsage(userId: string): Promise<QuotaUsage> {
  const [sets, cards, subscriptions] = await Promise.all([
    db.studySet.count({ where: { userId } }),
    db.card.count({ where: { set: { userId } } }),
    db.setSubscription.count({ where: { userId } }),
  ]);
  return { sets, cards, subscriptions };
}

/** Trả thông báo lỗi (tiếng Việt) nếu vượt giới hạn, null nếu được phép. ADMIN không bị giới hạn. */
export async function checkQuota(
  user: { id: string; role: "USER" | "ADMIN" },
  req: QuotaRequest,
): Promise<string | null> {
  if (user.role === "ADMIN") return null;
  const usage = await getUsage(user.id);
  const setCardCount = req.setId && req.cards ? await db.card.count({ where: { setId: req.setId } }) : 0;
  return evaluateQuota(QUOTA, usage, req, setCardCount);
}
