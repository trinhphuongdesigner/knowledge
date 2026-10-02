"use client";

import { Plus, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { cardInputSchema, type AiSuggestionDTO, type CardDTO } from "@/lib/validators";
import { useWordLookup } from "./useWordLookup";

type AiStatus = { enabled: boolean; remaining?: number };
// One status fetch per page load, shared by every CardForm instance.
let aiStatusPromise: Promise<AiStatus> | null = null;
function loadAiStatus(): Promise<AiStatus> {
  aiStatusPromise ??= api.aiStatus().catch(() => {
    aiStatusPromise = null;
    return { enabled: false };
  });
  return aiStatusPromise;
}

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

  const [ai, setAi] = useState<AiStatus>({ enabled: false });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiPreview, setAiPreview] = useState<AiSuggestionDTO | null>(null);

  useEffect(() => {
    let alive = true;
    void loadAiStatus().then((s) => {
      if (alive) setAi(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function autoFill(silent: boolean) {
    const entry = await lookup(question, { silent });
    if (!entry) return null;
    // Never overwrite what the user already typed when this is the automatic (blur) lookup.
    if (!silent || !phonetic) setPhonetic(entry.phonetic ?? "");
    if (!silent || !partOfSpeech) setPartOfSpeech(entry.partOfSpeech ?? "");
    setAudioUrl(entry.audioUrl ?? "");
    autoFilled.current = true;
    return entry;
  }

  function applyAi(s: AiSuggestionDTO, overwrite: boolean, dictPhonetic?: string) {
    const pick = (cur: string, next: string | undefined) => (next && (overwrite || !cur.trim()) ? next : cur);
    // Dictionary phonetic (real IPA) wins over the model's guess.
    const nextPhonetic = dictPhonetic || s.phonetic;
    setAnswer((v) => pick(v, s.answer));
    if (s.explanation) {
      setExplanation((v) => pick(v, s.explanation));
      setShowExplanation(true);
    }
    if (english) {
      setPartOfSpeech((v) => pick(v, s.partOfSpeech));
      setPhonetic((v) => pick(v, nextPhonetic));
    }
  }

  async function suggest() {
    const term = question.trim();
    if (!term || aiLoading) return;
    setAiError("");
    setAiPreview(null);
    setAiLoading(true);
    try {
      const [s, entry] = await Promise.all([
        api.aiSuggest({ term, english }),
        english && !phonetic.trim() ? autoFill(true) : Promise.resolve(null),
      ]);
      aiStatusPromise = null; // refresh the remaining count next time a form opens
      setAi((a) => (a.remaining === undefined ? a : { ...a, remaining: Math.max(0, a.remaining - 1) }));
      if (questionRef.current && questionRef.current.value.trim() !== term) return; // question changed meanwhile
      const conflicts =
        (answer.trim() && answer.trim() !== s.answer) ||
        (explanation.trim() && s.explanation && explanation.trim() !== s.explanation) ||
        (english && partOfSpeech.trim() && s.partOfSpeech && partOfSpeech.trim() !== s.partOfSpeech);
      applyAi(s, false, entry?.phonetic ?? undefined);
      if (conflicts) setAiPreview(s);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Không lấy được gợi ý AI.");
    } finally {
      setAiLoading(false);
    }
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
      setAiPreview(null);
      setAiError("");
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
      {ai.enabled && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            className="self-start"
            loading={aiLoading}
            disabled={!question.trim() || ai.remaining === 0}
            title={
              ai.remaining === undefined ? "Gợi ý nghĩa và ví dụ bằng AI" : `Còn ${ai.remaining} lượt gợi ý AI hôm nay`
            }
            onClick={() => void suggest()}
          >
            ✨ Gợi ý bằng AI
          </Button>
          {ai.remaining === 0 && <p className="text-sm text-ink-500">Bạn đã dùng hết lượt gợi ý AI hôm nay.</p>}
          {aiError && (
            <p role="alert" className="text-sm text-red-700">
              {aiError}
            </p>
          )}
          {aiPreview && (
            <div role="status" className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-ink-700">
              <p className="mb-1 font-medium">Gợi ý AI (các ô đã có nội dung được giữ nguyên)</p>
              <p>
                <span className="text-ink-500">Đáp án: </span>
                {aiPreview.answer}
              </p>
              {aiPreview.explanation && (
                <p className="whitespace-pre-line">
                  <span className="text-ink-500">Giải thích: </span>
                  {aiPreview.explanation}
                </p>
              )}
              {english && aiPreview.partOfSpeech && (
                <p>
                  <span className="text-ink-500">Từ loại: </span>
                  {aiPreview.partOfSpeech}
                </p>
              )}
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    applyAi(aiPreview, true);
                    setAiPreview(null);
                  }}
                >
                  Áp dụng
                </Button>
                <Button type="button" variant="secondary" onClick={() => setAiPreview(null)}>
                  Bỏ qua
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
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
          className="min-h-11 self-start rounded-xl px-2 text-sm font-medium text-accent hover:bg-brand-50"
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
      <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 mt-1 flex flex-col gap-2 border-t border-ink-200 bg-surface px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
