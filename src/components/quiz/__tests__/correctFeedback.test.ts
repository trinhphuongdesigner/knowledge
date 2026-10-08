import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleAfterCorrect } from "../correctFeedback";

const resolveIn = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

describe("scheduleAfterCorrect", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("sound off (no reading): moves on after the usual pause", async () => {
    const next = vi.fn();
    scheduleAfterCorrect(null, next);
    await vi.advanceTimersByTimeAsync(1499);
    expect(next).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(next).toHaveBeenCalledOnce();
  });

  it("waits for a long reading to finish, then a short beat after the ding", async () => {
    const next = vi.fn();
    scheduleAfterCorrect(resolveIn(2000), next);
    await vi.advanceTimersByTimeAsync(2699);
    expect(next).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(next).toHaveBeenCalledOnce();
  });

  it("a quick reading still keeps the feedback on screen for the usual pause", async () => {
    const next = vi.fn();
    scheduleAfterCorrect(resolveIn(100), next);
    await vi.advanceTimersByTimeAsync(1499);
    expect(next).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(next).toHaveBeenCalledOnce();
  });

  it("cleanup (user pressed Next early) cancels the auto-advance", async () => {
    const next = vi.fn();
    const cancel = scheduleAfterCorrect(resolveIn(500), next);
    await vi.advanceTimersByTimeAsync(200);
    cancel();
    await vi.advanceTimersByTimeAsync(5000);
    expect(next).not.toHaveBeenCalled();
  });
});
