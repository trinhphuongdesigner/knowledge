"use client";

import { ArrowLeft, Download, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Select, Textarea } from "@/components/ui";
import { api, enrichSetFully } from "@/lib/api";
import { parseCsv, parseFile, parseMarkdown, type ParseError, type ParseResult } from "@/lib/import";
import { cn } from "@/lib/utils";
import { FileDropzone } from "./FileDropzone";
import { ImportPreview, type EditableCard } from "./ImportPreview";

const MAX_CARDS = 2000;

type Tab = "file" | "paste";
type Mode = "append" | "replace";
type Format = "csv" | "md";

const TEMPLATES = [
  { href: "/templates/mau-import.csv", label: "Mẫu CSV" },
  { href: "/templates/mau-import.xlsx", label: "Mẫu Excel" },
  { href: "/templates/mau-import.md", label: "Mẫu Markdown" },
];

export function ImportWizard({ setId, english = false }: { setId: string; english?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [tab, setTab] = useState<Tab>("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [format, setFormat] = useState<Format>("csv");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [cards, setCards] = useState<EditableCard[]>([]);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [mode, setMode] = useState<Mode>("append");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const applyResult = (result: ParseResult) => {
    if (result.cards.length === 0) {
      const first = result.errors[0];
      setParseError(
        first
          ? `Không đọc được thẻ nào. ${first.row > 0 ? `Dòng ${first.row}: ` : ""}${first.message}`
          : "Không tìm thấy thẻ nào trong dữ liệu.",
      );
      return;
    }
    setCards(
      result.cards.map((c, i) => ({
        id: i,
        question: c.question,
        answer: c.answer,
        explanation: c.explanation ?? "",
        phonetic: c.phonetic,
        partOfSpeech: c.partOfSpeech,
      })),
    );
    setErrors(result.errors);
    setSaveError(null);
    setStep(2);
  };

  const handleFile = (f: File) => {
    setFile(f);
    setParseError(null);
  };

  const handleParse = async () => {
    setParseError(null);
    setParsing(true);
    try {
      if (tab === "file") {
        if (!file) throw new Error("Hãy chọn một file trước.");
        applyResult(await parseFile(file));
      } else {
        if (!text.trim()) throw new Error("Hãy dán nội dung cần import.");
        applyResult(format === "csv" ? parseCsv(text) : parseMarkdown(text));
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Không đọc được dữ liệu.");
    } finally {
      setParsing(false);
    }
  };

  const invalidCount = cards.filter((c) => !c.question.trim() || !c.answer.trim()).length;
  const tooMany = cards.length > MAX_CARDS;
  const canSave = cards.length > 0 && invalidCount === 0 && !tooMany && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    if (mode === "replace" && !window.confirm("Thay thế toàn bộ sẽ xoá tất cả thẻ hiện có trong bộ học này. Tiếp tục?")) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await api.bulkCreateCards(setId, {
        mode,
        cards: cards.map((c) => ({
          question: c.question.trim(),
          answer: c.answer.trim(),
          explanation: c.explanation.trim() || null,
          phonetic: c.phonetic?.trim() || null,
          partOfSpeech: c.partOfSpeech?.trim() || null,
        })),
      });
      if (english) {
        // Best effort: network problems never block the import (cards are already saved).
        setSaveNote("Đang tra phiên âm…");
        const summary = await enrichSetFully(setId, (done, total) => setSaveNote(`Đang tra phiên âm ${done}/${total}`));
        if (summary.interrupted) {
          window.alert(
            "Đã lưu thẻ, nhưng không tra được phiên âm cho một số thẻ (cần có internet). Bạn có thể bấm nút Tra phiên âm ở trang bộ học sau.",
          );
        }
      }
      router.push(`/sets/${setId}`);
      router.refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Lưu thất bại, vui lòng thử lại.");
      setSaveNote(null);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <ol className="flex items-center gap-2 text-sm" aria-label="Các bước import">
        {["Chọn nguồn", "Xem trước & lưu"].map((label, i) => {
          const active = step === i + 1;
          return (
            <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600",
                )}
              >
                {i + 1}
              </span>
              <span className={active ? "font-medium text-slate-900" : "text-slate-600"}>{label}</span>
              {i === 0 && <span className="mx-1 h-px w-6 bg-slate-300" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <Card className="space-y-5">
          <div role="tablist" aria-label="Nguồn dữ liệu" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {([
              ["file", "Tải file"],
              ["paste", "Dán văn bản"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => {
                  setTab(key);
                  setParseError(null);
                }}
                className={cn(
                  "min-h-11 rounded-lg text-sm font-medium transition-colors",
                  tab === key ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "file" ? (
            <FileDropzone file={file} onFile={handleFile} onClear={() => setFile(null)} disabled={parsing} />
          ) : (
            <div className="space-y-3">
              <Select label="Định dạng" value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                <option value="csv">CSV (phân cách bằng , ; hoặc Tab)</option>
                <option value="md">Markdown</option>
              </Select>
              <Textarea
                label="Nội dung"
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  format === "csv"
                    ? "question,answer,explanation\nClosure là gì?,Hàm nhớ scope,Ví dụ: counter"
                    : "Q: Closure là gì?\nA: Hàm nhớ scope\nE: Ví dụ: counter"
                }
                className="font-mono text-sm"
              />
            </div>
          )}

          {parseError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {parseError}
            </p>
          )}

          <Button onClick={handleParse} loading={parsing} className="w-full sm:w-auto">
            Xem trước
          </Button>

          <div className="space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Tải file mẫu</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <a
                  key={t.href}
                  href={t.href}
                  download
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  <Download className="size-4" aria-hidden />
                  {t.label}
                </a>
              ))}
            </div>
            <details className="rounded-xl bg-slate-50 p-3">
              <summary className="cursor-pointer font-medium text-slate-900">Hướng dẫn định dạng</summary>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>
                  <b>CSV / Excel:</b> dòng đầu là tiêu đề (<code>question</code>/<code>Câu hỏi</code>,{" "}
                  <code>answer</code>/<code>Đáp án</code>, <code>explanation</code>/<code>Giải thích</code>). Không có
                  tiêu đề thì cột 1 = câu hỏi, cột 2 = đáp án, cột 3 = giải thích.
                </li>
                <li>
                  <b>Markdown heading:</b> <code>## Câu hỏi</code>, phần bên dưới là đáp án; dòng bắt đầu bằng{" "}
                  <code>&gt; </code> hoặc phần sau <code>---</code> là giải thích.
                </li>
                <li>
                  <b>Markdown Q/A:</b> <code>Q:</code>/<code>A:</code>/<code>E:</code> (hoặc <code>Hỏi:</code>/
                  <code>Đáp:</code>/<code>Giải thích:</code>), các thẻ cách nhau bằng dòng trống.
                </li>
                <li>
                  <b>Markdown bảng:</b> <code>| question | answer | explanation |</code>.
                </li>
                <li>
                  <b>Tiếng Anh (tuỳ chọn):</b> thêm cột <code>phonetic</code>/<code>Phiên âm</code>/<code>IPA</code> và{" "}
                  <code>partOfSpeech</code>/<code>Từ loại</code>/<code>pos</code>; trong Markdown Q/A dùng{" "}
                  <code>P:</code> hoặc <code>Phiên âm:</code>. Thẻ thiếu phiên âm sẽ được tra tự động sau khi lưu (cần
                  internet).
                </li>
                <li>Tối đa {MAX_CARDS} thẻ mỗi lần import.</li>
              </ul>
            </details>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <ImportPreview cards={cards} errors={errors} onChange={setCards} />

          <Card className="space-y-3">
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium text-slate-900">Cách lưu</legend>
              {(
                [
                  ["append", "Thêm vào cuối", "Giữ nguyên các thẻ hiện có, thêm thẻ mới phía sau."],
                  ["replace", "Thay thế toàn bộ", "Xoá tất cả thẻ hiện có rồi thay bằng các thẻ này."],
                ] as const
              ).map(([value, label, hint]) => (
                <label
                  key={value}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3",
                    mode === value ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="mt-1 size-4 accent-blue-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">{label}</span>
                    <span className="block text-xs text-slate-600">{hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            {mode === "replace" && (
              <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Cảnh báo: toàn bộ thẻ hiện có của bộ học này sẽ bị xoá vĩnh viễn.
              </p>
            )}
          </Card>

          {tooMany && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Tối đa {MAX_CARDS} thẻ mỗi lần import (hiện có {cards.length}). Hãy xoá bớt hoặc chia nhỏ file.
            </p>
          )}
          {invalidCount > 0 && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Có {invalidCount} thẻ đang thiếu câu hỏi hoặc đáp án. Hãy bổ sung hoặc xoá thẻ đó.
            </p>
          )}
          {saveNote && (
            <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {saveNote}
            </p>
          )}
          {saveError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="secondary" onClick={() => setStep(1)} disabled={saving}>
              <ArrowLeft className="size-4" aria-hidden /> Quay lại
            </Button>
            <Button onClick={handleSave} loading={saving} disabled={!canSave}>
              <Save className="size-4" aria-hidden />
              {saving ? (saveNote ?? "Đang lưu...") : `Lưu ${cards.length} thẻ`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
