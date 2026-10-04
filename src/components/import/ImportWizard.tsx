"use client";

import { ArrowLeft, Download, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Modal, Select, Textarea } from "@/components/ui";
import { api, enrichSetFully } from "@/lib/api";
import { parseCsv, parseFile, parseMarkdown, UnsupportedFormatError, type ParseError, type ParseResult } from "@/lib/import";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { FileDropzone } from "./FileDropzone";
import { ImportPreview, type EditableCard } from "./ImportPreview";

const MAX_CARDS = 2000;

type Tab = "file" | "paste";
type Mode = "append" | "replace";
type Format = "csv" | "md";

const TEMPLATES = [
  { href: "/templates/mau-import.csv", key: "templates.csv" },
  { href: "/templates/mau-import.xlsx", key: "templates.excel" },
  { href: "/templates/mau-import.md", key: "templates.markdown" },
] as const;

export function ImportWizard({ setId, english = false }: { setId: string; english?: boolean }) {
  const router = useRouter();
  const t = useT("import");
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmReplace, setConfirmReplace] = useState(false);
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
          ? t("parse.noCards", {
              row: first.row > 0 ? t("parse.rowPrefix", { row: first.row }) : "",
              message: t(`parseErrors.${first.code}`, { text: first.text ?? "" }),
            })
          : t("parse.empty"),
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
        if (!file) throw new Error(t("parse.pickFile"));
        applyResult(await parseFile(file));
      } else {
        if (!text.trim()) throw new Error(t("parse.pasteContent"));
        applyResult(format === "csv" ? parseCsv(text) : parseMarkdown(text));
      }
    } catch (e) {
      setParseError(
        e instanceof UnsupportedFormatError
          ? t("parse.unsupportedFormat", { format: e.format })
          : e instanceof Error
            ? e.message
            : t("parse.failed"),
      );
    } finally {
      setParsing(false);
    }
  };

  const invalidCount = cards.filter((c) => !c.question.trim() || !c.answer.trim()).length;
  const tooMany = cards.length > MAX_CARDS;
  const canSave = cards.length > 0 && invalidCount === 0 && !tooMany && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setConfirmReplace(false);
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
        setSaveNote(t("save.lookingUp"));
        const summary = await enrichSetFully(setId, (done, total) => setSaveNote(t("save.lookingUpProgress", { done, total })));
        if (summary.interrupted) {
          window.alert(t("save.lookupInterrupted"));
        }
      }
      router.push(`/sets/${setId}`);
      router.refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t("save.failed"));
      setSaveNote(null);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <ol className="flex items-center gap-2 text-sm" aria-label={t("steps.label")}>
        {[t("steps.source"), t("steps.preview")].map((label, i) => {
          const active = step === i + 1;
          return (
            <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-brand-600 text-white" : "bg-ink-200 text-ink-600",
                )}
              >
                {i + 1}
              </span>
              <span className={active ? "font-medium text-ink-900" : "text-ink-600"}>{label}</span>
              {i === 0 && <span className="mx-1 h-px w-6 bg-ink-300" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <Card className="space-y-5">
          <div role="tablist" aria-label={t("tabs.label")} className="grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
            {([
              ["file", t("tabs.file")],
              ["paste", t("tabs.paste")],
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
                  tab === key ? "bg-surface text-accent-strong shadow-sm" : "text-ink-600 hover:text-ink-900",
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
              <Select label={t("format.label")} value={format} onChange={(e) => setFormat(e.target.value as Format)}>
                <option value="csv">{t("format.csv")}</option>
                <option value="md">{t("format.markdown")}</option>
              </Select>
              <Textarea
                label={t("content.label")}
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  format === "csv"
                    ? t("content.placeholderCsv")
                    : t("content.placeholderMarkdown")
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
            {t("actions.preview")}
          </Button>

          <div className="space-y-3 border-t border-ink-200 pt-4 text-sm text-ink-600">
            <p className="font-medium text-ink-900">{t("templates.title")}</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <a
                  key={tpl.href}
                  href={tpl.href}
                  download
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-surface px-3 text-sm font-medium text-accent-strong hover:bg-brand-50"
                >
                  <Download className="size-4" aria-hidden />
                  {t(tpl.key)}
                </a>
              ))}
            </div>
            <details className="rounded-xl bg-ink-50 p-3">
              <summary className="cursor-pointer font-medium text-ink-900">{t("guide.title")}</summary>
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                <li>{t("guide.csv")}</li>
                <li>{t("guide.heading")}</li>
                <li>{t("guide.qa")}</li>
                <li>{t("guide.table")}</li>
                <li>{t("guide.english")}</li>
                <li>{t("guide.max", { max: MAX_CARDS })}</li>
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
              <legend className="mb-1 text-sm font-medium text-ink-900">{t("mode.title")}</legend>
              {(
                [
                  ["append", t("mode.append"), t("mode.appendHint")],
                  ["replace", t("mode.replace"), t("mode.replaceHint")],
                ] as const
              ).map(([value, label, hint]) => (
                <label
                  key={value}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3",
                    mode === value ? "border-brand-600 bg-brand-50" : "border-ink-200 bg-surface",
                  )}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="mt-1 size-4 accent-brand-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink-900">{label}</span>
                    <span className="block text-xs text-ink-600">{hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            {mode === "replace" && (
              <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {t("mode.replaceWarning")}
              </p>
            )}
          </Card>

          {tooMany && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {t("errors.tooMany", { max: MAX_CARDS, count: cards.length })}
            </p>
          )}
          {invalidCount > 0 && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {t("errors.invalid", { count: invalidCount })}
            </p>
          )}
          {saveNote && (
            <p role="status" className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-accent-strong">
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
              <ArrowLeft className="size-4" aria-hidden /> {t("actions.back")}
            </Button>
            <Button onClick={() => (mode === "replace" ? setConfirmReplace(true) : handleSave())} loading={saving} disabled={!canSave}>
              <Save className="size-4" aria-hidden />
              {saving ? (saveNote ?? t("save.saving")) : t("save.button", { count: cards.length })}
            </Button>
          </div>
        </div>
      )}

      <Modal open={confirmReplace} onClose={() => setConfirmReplace(false)} title={t("replaceModal.title")} centered>
        <p className="text-sm text-ink-600">
          {t("replaceModal.body", { count: cards.length })}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmReplace(false)}>
            {t("actions.cancel")}
          </Button>
          <Button variant="danger" onClick={handleSave}>
            {t("replaceModal.confirm")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
