import type { Grade } from "@/lib/srs";
import type { ReviewInput } from "@/lib/validators";

export type ReviewEntry = { setId: string; cardId: string; grade: Grade };
export type ReviewBatch = { setId: string; items: { cardId: string; grade: Grade }[] };
/** Gửi một lô lên server; reject khi lỗi (SaveHttpError cho phản hồi không ok). */
export type SendBatch = (batch: ReviewBatch, keepalive: boolean) => Promise<void>;

export class SaveHttpError extends Error {
  constructor(readonly status: number) {
    super(`review save failed (${status})`);
  }
}

/** Lỗi 4xx (trừ 401/408/429) gửi lại cũng vô ích → bỏ lô đó, không chặn cả hàng đợi. */
export function isPermanentFailure(err: unknown): boolean {
  if (!(err instanceof SaveHttpError)) return false;
  const s = err.status;
  return s >= 400 && s < 500 && s !== 401 && s !== 408 && s !== 429;
}

/**
 * Cắt khỏi `queue` một lô (tối đa `max` mục) của bộ thẻ đứng đầu, giữ nguyên thứ tự. Mục của bộ khác
 * nằm xen giữa được giữ lại: mỗi thẻ chỉ thuộc một bộ nên thứ tự trả lời của từng thẻ không đổi.
 * Bỏ qua (giữ lại trong hàng đợi) thẻ có trong `skip`.
 */
export function takeBatch(queue: ReviewEntry[], max: number, skip?: ReadonlySet<string>): ReviewBatch | null {
  const first = queue.find((e) => !skip?.has(e.cardId));
  if (!first) return null;
  const items: ReviewBatch["items"] = [];
  for (let i = 0; i < queue.length && items.length < max; ) {
    const e = queue[i];
    if (e.setId === first.setId && !skip?.has(e.cardId)) {
      items.push({ cardId: e.cardId, grade: e.grade });
      queue.splice(i, 1);
    } else i++;
  }
  return { setId: first.setId, items };
}

const toEntries = (b: ReviewBatch): ReviewEntry[] => b.items.map((i) => ({ setId: b.setId, ...i }));

export type SaveQueue = {
  /** Thêm một câu trả lời; gửi sau `delayMs`, hoặc ngay khi đủ `maxBatch`. */
  add(entry: ReviewEntry): void;
  /** Gửi ngay mọi thứ đang chờ (tuần tự). Resolve true khi tất cả đã lưu, false nếu còn lô lỗi. */
  flush(): Promise<boolean>;
  /** Trang sắp đóng/ẩn: gửi keepalive ngay, không chờ request đang chạy. */
  flushKeepalive(): void;
  /** Số câu trả lời chưa gửi (kể cả lô lỗi chờ gửi lại). */
  size(): number;
};

/**
 * Hàng đợi lưu kết quả ôn theo đúng thứ tự trả lời: mỗi lúc chỉ một request thường đang chạy, lô lỗi
 * quay về ĐẦU hàng đợi nên luôn được gửi lại trước mọi câu trả lời mới hơn. Nhờ vậy lượt "Được" của
 * thẻ vừa bấm "Lại" không thể tới server trước lượt "Lại" (server sẽ đọc trạng thái cũ, chưa quên).
 */
export function createSaveQueue(opts: {
  send: SendBatch;
  maxBatch?: number;
  delayMs?: number;
  onStatus?: (failed: boolean) => void;
  onDrop?: (batch: ReviewBatch, err: unknown) => void;
}): SaveQueue {
  const { send, maxBatch = 50, delayMs = 800, onStatus, onDrop } = opts;
  const queue: ReviewEntry[] = [];
  /** Lô đang bay (thường + keepalive): keepalive không gửi thẻ nằm trong đây để khỏi vượt mặt. */
  const inflight = new Set<ReviewBatch>();
  const keepalives = new Set<Promise<void>>();
  let draining: Promise<void> | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const inflightCards = () => new Set([...inflight].flatMap((b) => b.items.map((i) => i.cardId)));

  /** true = gửi lại sau; false = lỗi vĩnh viễn, đã bỏ lô. */
  function failed(batch: ReviewBatch, err: unknown): boolean {
    if (isPermanentFailure(err)) {
      onDrop?.(batch, err);
      return false;
    }
    queue.unshift(...toEntries(batch));
    onStatus?.(true);
    return true;
  }

  async function drain() {
    for (;;) {
      // Chờ keepalive đang bay trước: lô lỗi của nó quay về đầu hàng đợi và phải đi trước.
      if (keepalives.size > 0) await Promise.allSettled([...keepalives]);
      const batch = takeBatch(queue, maxBatch);
      if (!batch) return;
      inflight.add(batch);
      try {
        await send(batch, false);
        onStatus?.(false);
      } catch (err) {
        if (failed(batch, err)) return; // dừng; lần flush sau gửi lại từ lô này
      } finally {
        inflight.delete(batch);
      }
    }
  }

  function flush(): Promise<boolean> {
    clearTimeout(timer);
    if (!draining) draining = drain().finally(() => (draining = null));
    return draining.then(async () => {
      if (keepalives.size > 0) await Promise.allSettled([...keepalives]);
      return queue.length === 0;
    });
  }

  function flushKeepalive() {
    clearTimeout(timer);
    // Thẻ đang có request bay thì để lại: gửi song song có thể tới server trước lượt cũ hơn.
    const skip = inflightCards();
    for (let batch = takeBatch(queue, maxBatch, skip); batch; batch = takeBatch(queue, maxBatch, skip)) {
      const b = batch;
      inflight.add(b);
      const p: Promise<void> = send(b, true)
        .then(
          () => onStatus?.(false),
          (err) => void failed(b, err),
        )
        .finally(() => {
          inflight.delete(b);
          keepalives.delete(p);
        });
      keepalives.add(p);
      for (const i of b.items) skip.add(i.cardId);
    }
  }

  function add(entry: ReviewEntry) {
    queue.push(entry);
    clearTimeout(timer);
    if (queue.length >= maxBatch) void flush();
    else timer = setTimeout(() => void flush(), delayMs);
  }

  return { add, flush, flushKeepalive, size: () => queue.length };
}

/** POST /api/reviews; ném SaveHttpError khi server trả lỗi, TypeError khi mất mạng. */
export async function postReviews(body: ReviewInput, keepalive: boolean): Promise<void> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive,
  });
  if (!res.ok) throw new SaveHttpError(res.status);
}
