import { isSfxEnabled, playSfx, unlockSfx } from "@/lib/sfx";
import { stopSpeech } from "./speech";

/** Tắt âm thanh (hoặc không có gì để đọc) thì vẫn giữ màn "Chính xác" chừng này trước khi sang câu. */
const AUTO_NEXT_MS = 1500;
/** Sau tiếng "ting" chờ thêm một chút cho nghe hết rồi mới sang câu. */
const AFTER_DING_MS = 700;
/** Phòng khi trình duyệt không báo đọc xong (TTS treo): quá thời gian thì cứ "ting" và đi tiếp. */
const READ_TIMEOUT_MS = 4000;

/**
 * Trả lời đúng → bắt đầu đọc lại từ. Gọi NGAY trong sự kiện submit (iOS chặn phát âm thanh ngoài thao tác người dùng).
 * Trả về promise xong khi đọc xong; null nếu người dùng đã tắt âm thanh.
 */
export function startCorrectReading(read: (() => Promise<void>) | null): Promise<void> | null {
  if (!isSfxEnabled()) return null;
  unlockSfx();
  if (!read) return Promise.resolve();
  return Promise.race([read(), new Promise<void>((r) => setTimeout(r, READ_TIMEOUT_MS))]);
}

/**
 * Trình tự sau khi trả lời đúng: (đọc lại từ) → "ting" → tự sang câu tiếp.
 * Dùng trong effect; hàm trả về là cleanup — bấm "Tiếp" sớm sẽ ngắt đọc và bỏ tiếng "ting".
 */
export function scheduleAfterCorrect(reading: Promise<void> | null, next: () => void): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const startedAt = Date.now();
  const advanceIn = (ms: number) => {
    timer = setTimeout(() => {
      if (!cancelled) next();
    }, ms);
  };

  if (!reading) advanceIn(AUTO_NEXT_MS);
  else
    void reading.then(() => {
      if (cancelled) return;
      playSfx("correct");
      advanceIn(Math.max(AFTER_DING_MS, AUTO_NEXT_MS - (Date.now() - startedAt)));
    });

  return () => {
    cancelled = true;
    clearTimeout(timer);
    stopSpeech();
  };
}
