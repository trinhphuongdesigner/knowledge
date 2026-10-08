import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSaveQueue, isPermanentFailure, SaveHttpError, takeBatch, type ReviewBatch, type ReviewEntry } from "../saveQueue";

type Call = { batch: ReviewBatch; keepalive: boolean; resolve: () => void; reject: (e: unknown) => void };

/** send giả: giữ từng request lại để test tự quyết định khi nào xong / lỗi. */
function fakeSend() {
  const calls: Call[] = [];
  const send = (batch: ReviewBatch, keepalive: boolean) =>
    new Promise<void>((resolve, reject) => calls.push({ batch, keepalive, resolve, reject }));
  return { calls, send };
}

// setTimeout thật (giữ trước khi bị fake) để chờ các promise chạy xong.
const realSetTimeout = globalThis.setTimeout;
const tick = () => new Promise((r) => realSetTimeout(r, 0));
const e = (cardId: string, grade: 0 | 1 | 2 | 3 = 2, setId = "s1"): ReviewEntry => ({ setId, cardId, grade });
const ids = (b: ReviewBatch) => b.items.map((i) => `${i.cardId}:${i.grade}`);

describe("takeBatch", () => {
  it("takes the first set's entries in order and leaves the others", () => {
    const q = [e("a", 0), e("x", 2, "s2"), e("b"), e("a", 2)];
    const b = takeBatch(q, 50);
    expect(b?.setId).toBe("s1");
    expect(ids(b!)).toEqual(["a:0", "b:2", "a:2"]);
    expect(q).toEqual([e("x", 2, "s2")]);
  });
  it("respects max and skip", () => {
    const q = [e("a"), e("b"), e("c")];
    expect(ids(takeBatch(q, 2, new Set(["a"]))!)).toEqual(["b:2", "c:2"]);
    expect(q).toEqual([e("a")]);
    expect(takeBatch(q, 2, new Set(["a"]))).toBeNull();
  });
});

describe("isPermanentFailure", () => {
  it("drops 4xx except auth / timeout / rate limit", () => {
    expect(isPermanentFailure(new SaveHttpError(400))).toBe(true);
    expect(isPermanentFailure(new SaveHttpError(404))).toBe(true);
    expect(isPermanentFailure(new SaveHttpError(401))).toBe(false);
    expect(isPermanentFailure(new SaveHttpError(429))).toBe(false);
    expect(isPermanentFailure(new SaveHttpError(500))).toBe(false);
    expect(isPermanentFailure(new TypeError("offline"))).toBe(false);
  });
});

describe("createSaveQueue", () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] }));
  afterEach(() => vi.useRealTimers());

  it("debounces, then sends one batch", async () => {
    const { calls, send } = fakeSend();
    const q = createSaveQueue({ send, delayMs: 800 });
    q.add(e("a"));
    q.add(e("b"));
    expect(calls).toHaveLength(0);
    vi.advanceTimersByTime(800);
    expect(calls).toHaveLength(1);
    expect(ids(calls[0].batch)).toEqual(["a:2", "b:2"]);
  });

  it("never has two normal requests in flight; later answers wait", async () => {
    const { calls, send } = fakeSend();
    const q = createSaveQueue({ send, maxBatch: 2 });
    q.add(e("a", 0));
    q.add(e("b")); // đủ lô → gửi ngay
    expect(calls).toHaveLength(1);
    q.add(e("a", 2));
    q.add(e("c")); // đủ lô nữa nhưng lô trước chưa xong
    expect(calls).toHaveLength(1);
    calls[0].resolve();
    await tick();
    expect(calls).toHaveLength(2);
    expect(ids(calls[1].batch)).toEqual(["a:2", "c:2"]);
  });

  it("a failed batch is retried before newer answers, and reports status", async () => {
    const { calls, send } = fakeSend();
    const onStatus = vi.fn();
    const q = createSaveQueue({ send, onStatus });
    q.add(e("a", 0));
    const saved = q.flush();
    q.add(e("a", 2)); // trả lời lại trong lúc lô "Lại" đang bay
    calls[0].reject(new TypeError("offline"));
    expect(await saved).toBe(false);
    expect(onStatus).toHaveBeenLastCalledWith(true);
    expect(calls).toHaveLength(1); // dừng, không gửi tiếp lượt mới hơn
    expect(q.size()).toBe(2);

    const again = q.flush();
    expect(ids(calls[1].batch)).toEqual(["a:0", "a:2"]);
    calls[1].resolve();
    expect(await again).toBe(true);
    expect(onStatus).toHaveBeenLastCalledWith(false);
    expect(q.size()).toBe(0);
  });

  it("drops permanently rejected batches and keeps going", async () => {
    const { calls, send } = fakeSend();
    const onDrop = vi.fn();
    const q = createSaveQueue({ send, onDrop });
    q.add(e("a"));
    q.add(e("x", 2, "s2"));
    const saved = q.flush();
    calls[0].reject(new SaveHttpError(404));
    await tick();
    expect(onDrop).toHaveBeenCalledOnce();
    expect(calls[1].batch.setId).toBe("s2");
    calls[1].resolve();
    expect(await saved).toBe(true);
  });

  it("flush resolves only after everything (including later batches) is saved", async () => {
    const { calls, send } = fakeSend();
    const q = createSaveQueue({ send, maxBatch: 1 });
    q.add(e("a")); // gửi ngay
    q.add(e("b"));
    let done = false;
    void q.flush().then(() => (done = true));
    calls[0].resolve();
    await tick();
    expect(done).toBe(false);
    calls[1].resolve();
    await tick();
    expect(done).toBe(true);
  });

  it("keepalive sends pending items once, skipping cards still in flight", async () => {
    const { calls, send } = fakeSend();
    const q = createSaveQueue({ send });
    q.add(e("a", 0));
    void q.flush(); // lô thường đang bay: a:0
    q.add(e("a", 2));
    q.add(e("b"));
    q.flushKeepalive();
    expect(calls).toHaveLength(2);
    expect(calls[1].keepalive).toBe(true);
    expect(ids(calls[1].batch)).toEqual(["b:2"]); // a:2 phải chờ a:0
    expect(q.size()).toBe(1);

    q.flushKeepalive(); // ẩn trang lần nữa: không gửi trùng
    expect(calls).toHaveLength(2);

    calls[0].resolve();
    await tick();
    // Lô thường kế tiếp chờ keepalive xong rồi mới đi.
    expect(calls).toHaveLength(2);
    calls[1].resolve();
    await tick();
    expect(calls).toHaveLength(3);
    expect(ids(calls[2].batch)).toEqual(["a:2"]);
  });

  it("a failed keepalive batch goes back to the front", async () => {
    const { calls, send } = fakeSend();
    const q = createSaveQueue({ send });
    q.add(e("a", 0));
    q.flushKeepalive();
    q.add(e("a", 2));
    const saved = q.flush(); // chờ keepalive
    expect(calls).toHaveLength(1);
    calls[0].reject(new TypeError("offline"));
    await tick();
    expect(ids(calls[1].batch)).toEqual(["a:0", "a:2"]);
    calls[1].resolve();
    expect(await saved).toBe(true);
  });
});
