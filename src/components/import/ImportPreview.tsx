"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { PhoneticLine } from "@/components/cards/SpeakButton";
import { Badge } from "@/components/ui";
import { fieldClass } from "@/components/ui/fieldStyles";
import type { ParseError } from "@/lib/import";

export type EditableCard = {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  /** Carried through from the file (not editable here); empty ones are looked up after saving. */
  phonetic?: string;
  partOfSpeech?: string;
};

type Field = "question" | "answer" | "explanation";

const LABELS: Record<Field, string> = { question: "Câu hỏi", answer: "Đáp án", explanation: "Giải thích" };

export function ImportPreview({
  cards,
  errors,
  onChange,
}: {
  cards: EditableCard[];
  errors: ParseError[];
  onChange: (cards: EditableCard[]) => void;
}) {
  const update = (id: number, field: Field, value: string) =>
    onChange(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  const remove = (id: number) => onChange(cards.filter((c) => c.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        <Badge tone="green">{cards.length} thẻ hợp lệ</Badge>
        {errors.length > 0 && <Badge tone="gray">{errors.length} dòng lỗi (bị bỏ qua)</Badge>}
      </div>

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" aria-hidden /> Các dòng sau không đọc được và sẽ bị bỏ qua
          </p>
          <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-5">
            {errors.map((e, i) => (
              <li key={i}>
                {e.row > 0 ? `Dòng ${e.row}: ` : ""}
                {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cards.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          Không còn thẻ nào để import.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[2.5rem_1fr_1fr_1fr_2.75rem] gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 md:grid">
            <span>#</span>
            <span>{LABELS.question}</span>
            <span>{LABELS.answer}</span>
            <span>{LABELS.explanation}</span>
            <span className="sr-only">Xoá</span>
          </div>
          <ul className="divide-y divide-slate-200">
            {cards.map((c, i) => {
              const bad = (f: Field) => (f !== "explanation" && c[f].trim() === "" ? "Không được để trống" : undefined);
              return (
                <li
                  key={c.id}
                  className="grid grid-cols-1 gap-2 p-3 md:grid-cols-[2.5rem_1fr_1fr_1fr_2.75rem] md:items-start md:gap-3"
                >
                  <div className="flex items-center justify-between md:block md:pt-2.5">
                    <span className="text-sm font-medium text-slate-600">
                      <span className="md:hidden">Thẻ </span>
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      aria-label={`Xoá thẻ ${i + 1}`}
                      className="flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 md:hidden"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                  {(["question", "answer", "explanation"] as Field[]).map((f) => (
                    <label key={f} className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600 md:sr-only">{LABELS[f]}</span>
                      <textarea
                        value={c[f]}
                        rows={2}
                        aria-label={`${LABELS[f]} — thẻ ${i + 1}`}
                        aria-invalid={!!bad(f) || undefined}
                        onChange={(e) => update(c.id, f, e.target.value)}
                        className={fieldClass(bad(f), "min-h-16 py-2 text-sm")}
                      />
                      {f === "question" && (c.phonetic || c.partOfSpeech) && (
                        <PhoneticLine phonetic={c.phonetic} partOfSpeech={c.partOfSpeech} className="mt-1 block text-xs" />
                      )}
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    aria-label={`Xoá thẻ ${i + 1}`}
                    className="hidden size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 md:flex"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
