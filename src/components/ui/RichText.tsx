import type { ReactNode } from "react";

/** Hiển thị chuỗi message có `**đậm**`; `boldClassName` đổi kiểu của đoạn được đánh dấu. */
export function RichText({ text, boldClassName }: { text: string; boldClassName?: string }): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <b key={i} className={boldClassName}>
        {part}
      </b>
    ) : (
      part
    ),
  );
}
