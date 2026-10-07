import { db } from "@/lib/db";
import { computeSetStatus, type SetStatus } from "@/lib/set-status";

/** Trạng thái học của user trên từng bộ thẻ. studiedAt: lần cuối lưu tiến trình (xếp "đang học dở" mới nhất trước). */
export type SetStatusWithTime = SetStatus & { studiedAt: Date | null };

export async function getSetStatuses(userId: string, setIds: string[]): Promise<Record<string, SetStatusWithTime>> {
  if (setIds.length === 0) return {};
  const [progress, cards] = await Promise.all([
    db.studyProgress.findMany({
      where: { userId, setId: { in: setIds } },
      select: { setId: true, known: true, unknown: true, index: true, completedAt: true, quizBestPct: true, updatedAt: true },
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
  const out: Record<string, SetStatusWithTime> = {};
  for (const setId of setIds) {
    const p = progressBySet.get(setId);
    // Mở trang học rồi thoát ngay vẫn tạo dòng progress: chỉ tính là "đã bắt đầu" khi có lật / chấm thẻ.
    const started =
      !!p && (p.known.length > 0 || p.unknown.length > 0 || p.index > 0 || p.completedAt !== null || p.quizBestPct !== null);
    out[setId] = {
      ...computeSetStatus({
        cardIds: cardIds.get(setId) ?? [],
        known: p?.known ?? [],
        quizBestPct: p?.quizBestPct ?? null,
        started,
      }),
      studiedAt: p?.updatedAt ?? null,
    };
  }
  return out;
}
