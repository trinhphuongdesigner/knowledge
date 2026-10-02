import { db } from "./db";

const withCategory = { category: true } as const;

/** Bộ thẻ do chính user sở hữu (route sửa/xoá), hoặc null. */
export async function getOwnedSet(userId: string, setId: string) {
  return db.studySet.findFirst({ where: { id: setId, userId }, include: withCategory });
}

/**
 * Bộ thẻ user được phép đọc/học: của mình, hoặc đã subscribe một bộ PUBLIC+approved / LINK.
 * Trả null nếu không tồn tại hoặc không có quyền (không phân biệt, để không lộ id).
 */
export async function getReadableSet(userId: string, setId: string) {
  const set = await db.studySet.findUnique({
    where: { id: setId },
    include: { ...withCategory, user: { select: { name: true } } },
  });
  if (!set) return null;
  if (set.userId === userId) return { set, isOwner: true, subscribed: false };
  const shareable = set.visibility === "LINK" || (set.visibility === "PUBLIC" && set.approved);
  if (!shareable) return null;
  const sub = await db.setSubscription.findUnique({ where: { userId_setId: { userId, setId } } });
  if (!sub) return null;
  return { set, isOwner: false, subscribed: true };
}

/** Xem bộ thẻ qua link chia sẻ (ẩn danh): LINK hoặc PUBLIC. */
export async function getSetByShareToken(token: string) {
  if (!token || token.length > 64) return null;
  const set = await db.studySet.findUnique({
    where: { shareToken: token },
    include: {
      ...withCategory,
      user: { select: { name: true } },
      cards: { orderBy: { position: "asc" } },
    },
  });
  if (!set) return null;
  if (set.visibility === "PRIVATE") return null; // PUBLIC chưa duyệt vẫn xem được bằng link
  return set;
}
