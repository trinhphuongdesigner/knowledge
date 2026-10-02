"use client";

import { Plus, Search } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { cardInputSchema, type CardDTO } from "@/lib/validators";
import { useWordLookup } from "./useWordLookup";

type Errors = Partial<Record<"question" | "answer" | "explanation", string>>;

/**
 * Card add/edit form, meant to live inside a Modal (mount it only while open so state resets).
 * Without `card`: "Thêm" and "Thêm & tiếp tục". With `card`: "Lưu".
 */
export function CardForm({
  setId,
  card,
  english = false,
  onSaved,
  onClose,
}: {
  setId: string;
  card?: CardDTO;
  english?: boolean;
  onSaved: (card: CardDTO, mode: "added" | "updated") => void;
  onClose: () => void;
}) {
  const formId = useId();
  const [question, setQuestion] = useState(card?.question ?? "");
  const [answer, setAnswer] = useState(card?.answer ?? "");
  const [explanation, setExplanation] = useState(card?.explanation ?? "");
  const [phonetic, setPhonetic] = useState(card?.phonetic ?? "");
  const [partOfSpeech, setPartOfSpeech] = useState(card?.partOfSpeech ?? "");
  const [audioUrl, setAudioUrl] = useState(card?.audioUrl ?? "");
  const autoFilled = useRef(false);
  const { looking, message: lookupMessage, lookup, reset: resetLookup } = useWordLookup();
  const [showExplanation, setShowExplanation] = useState(!!card?.explanation);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState<"close" | "continue" | null>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  async function autoFill(silent: boolean) {
    const entry = await lookup(question, { silent });
    if (!entry) return;
    // Never overwrite what the user already typed when this is the automatic (blur) lookup.
    if (!silent || !phonetic) setPhonetic(entry.phonetic ?? "");
    if (!silent || !partOfSpeech) setPartOfSpeech(entry.partOfSpeech ?? "");
    setAudioUrl(entry.audioUrl ?? "");
    autoFilled.current = true;
  }

  async function submit(after: "close" | "continue") {
    if (loading) return;
    setSubmitError("");
    setNotice("");
    const parsed = cardInputSchema.safeParse({
      question,
      answer,
      explanation,
      ...(english ? { phonetic, partOfSpeech, audioUrl } : {}),
    });
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (errs[key]) continue;
        errs[key] =
          key === "question"
            ? "Vui lòng nhập câu hỏi (tối đa 5000 ký tự)."
            : key === "answer"
              ? "Vui lòng nhập câu trả lời (tối đa 5000 ký tự)."
              : "Giải thích tối đa 5000 ký tự.";
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(after);
    try {
      if (card) {
        onSaved(await api.updateCard(card.id, parsed.data), "updated");
        onClose();
        return;
      }
      const created = await api.createCard(setId, parsed.data);
      onSaved(created, "added");
      if (after === "close") {
        onClose();
        return;
      }
      setQuestion("");
      setAnswer("");
      setExplanation("");
      setPhonetic("");
      setPartOfSpeech("");
      setAudioUrl("");
      autoFilled.current = false;
      resetLookup();
      setNotice("Đã thêm thẻ. Nhập thẻ tiếp theo.");
      questionRef.current?.focus();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : card ? "Không thể lưu thẻ." : "Không thể thêm thẻ.");
    } finally {
      setLoading(null);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void submit("close");
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void submit(card ? "close" : "continue");
    }
  }

  return (
    <form id={formId} onSubmit={onSubmit} onKeyDown={onKeyDown} noValidate className="flex flex-col gap-3">
      <Textarea
        ref={questionRef}
        label="Câu hỏi"
        rows={3}
        value={question}
        autoFocus
        onChange={(e) => {
          setQuestion(e.target.value);
          if (autoFilled.current) {
            // The question changed: drop the stale auto-filled data.
            autoFilled.current = false;
            setPhonetic("");
            setPartOfSpeech("");
            setAudioUrl("");
          }
        }}
        onBlur={() => {
          const q = question.trim();
          if (english && q && !phonetic.trim() && !looking && q !== card?.question) void autoFill(true);
        }}
        error={errors.question}
        placeholder="Mặt trước: thuật ngữ hoặc câu hỏi (hỗ trợ Markdown)"
      />
      <Textarea
        label="Đáp án"
        rows={4}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        error={errors.answer}
        placeholder="Mặt sau: định nghĩa hoặc đáp án (hỗ trợ Markdown)"
      />
      {english && (
        <div className="flex flex-col gap-2">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Input
              label="Phiên âm"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="/ˈeɪbl/"
              maxLength={200}
            />
            <Input
              label="Từ loại"
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              placeholder="adjective"
              maxLength={200}
            />
            <Button type="button" variant="secondary" loading={looking} onClick={() => void autoFill(false)}>
              <Search className="size-4" aria-hidden />
              Tự tra
            </Button>
          </div>
          {lookupMessage && (
            <p role="status" className="text-sm text-ink-500">
              {lookupMessage}
            </p>
          )}
        </div>
      )}
      {showExplanation ? (
        <Textarea
          label="Giải thích (tuỳ chọn)"
          rows={3}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          error={errors.explanation}
          placeholder="Giải thích hoặc ví dụ"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowExplanation(true)}
          className="min-h-11 self-start rounded-xl px-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
        >
          + Thêm giải thích
        </button>
      )}
      {submitError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}
      <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 mt-1 flex flex-col gap-2 border-t border-ink-200 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className="hidden text-xs text-ink-500 sm:block">
          {card ? "Ctrl/Cmd + Enter để lưu." : "Ctrl/Cmd + Enter để thêm & tiếp tục."}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={!!loading}>
            Huỷ
          </Button>
          {card ? (
            <Button type="submit" loading={loading === "close"}>
              Lưu
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                loading={loading === "continue"}
                disabled={loading === "close"}
                onClick={() => void submit("continue")}
              >
                <Plus className="size-4" aria-hidden />
                Thêm &amp; tiếp tục
              </Button>
              <Button type="submit" loading={loading === "close"} disabled={loading === "continue"}>
                Thêm
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
