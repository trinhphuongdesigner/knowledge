import { db } from "@/lib/db";
import { computeSetStatus, type SetStatus } from "@/lib/set-status";

/** Trạng thái "đã thuộc hết" / "đạt kiểm tra" của user trên từng bộ thẻ. */
export async function getSetStatuses(userId: string, setIds: string[]): Promise<Record<string, SetStatus>> {
  if (setIds.length === 0) return {};
  const [progress, cards] = await Promise.all([
    db.studyProgress.findMany({
      where: { userId, setId: { in: setIds } },
      select: { setId: true, known: true, quizBestPct: true },
    }),
    db.card.findMany({ where: { setId: { in: setIds } }, select: { id: true, setId: true } }),
  ]);
  const cardIds = new Map<string, string[]>();
  for (const c of cards) {
    const list = cardIds.get(c.setId);
    if (list) list.push(c.id);
    else cardIds.set(c.setId, [c.id]);
  }
  const progressBySet = new Map(progress.map((p) => [p.setId, p]));
  const out: Record<string, SetStatus> = {};
  for (const setId of setIds) {
    const p = progressBySet.get(setId);
    out[setId] = p
      ? computeSetStatus({ cardIds: cardIds.get(setId) ?? [], known: p.known, quizBestPct: p.quizBestPct })
      : { mastered: false, quizBestPct: null, quizPassed: false };
  }
  return out;
}
