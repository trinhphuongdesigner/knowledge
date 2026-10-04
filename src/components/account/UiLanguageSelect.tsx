"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition, type KeyboardEvent } from "react";
import { updateUiLanguage } from "@/app/account/actions";
import { fieldClass } from "@/components/ui/fieldStyles";
import { useT } from "@/i18n/client";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { FLAGS } from "@/i18n/flags";
import { cn } from "@/lib/utils";
import { FormError } from "@/components/auth/FormError";
import { FormSuccess } from "./FormSuccess";

function Flag({ locale }: { locale: Locale }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={FLAGS[locale]} alt="" width={20} height={14} className="h-3.5 w-5 shrink-0 rounded-sm object-cover" />
  );
}

/**
 * Chọn ngôn ngữ hiển thị (tách biệt với ngôn ngữ mẹ đẻ). Chọn xong lưu ngay; server action ghi DB + cookie
 * và làm mới layout nên giao diện đổi ngôn ngữ tức thì.
 */
export function UiLanguageSelect({ value }: { value: Locale }) {
  const t = useT("account");
  const [selected, setSelected] = useState<Locale>(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, LOCALES.indexOf(value)));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-opt-${i}`;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function openList() {
    setActive(Math.max(0, LOCALES.indexOf(selected)));
    setOpen(true);
  }

  function choose(locale: Locale) {
    setOpen(false);
    buttonRef.current?.focus();
    if (locale === selected) return;
    const previous = selected;
    setSelected(locale);
    setSaved(false);
    setError(undefined);
    startTransition(async () => {
      try {
        const res = await updateUiLanguage(locale);
        if (res.ok) setSaved(true);
        else {
          setSelected(previous);
          setError(res.error);
        }
      } catch {
        setSelected(previous);
        setError(t("uiLanguage.saveFailed"));
      }
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const last = LOCALES.length - 1;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) return openList();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setActive((i) => (i + delta + LOCALES.length) % LOCALES.length);
        return;
      }
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        return;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(last);
        }
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(LOCALES[active]);
        else openList();
        return;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        setOpen(false);
        return;
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-sm font-medium text-ink-700">
        {t("uiLanguage.label")}
      </span>
      <div ref={rootRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? optionId(active) : undefined}
          aria-labelledby={`${labelId} ${id}-value`}
          aria-describedby={hintId}
          aria-busy={pending || undefined}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
          className={fieldClass(
            undefined,
            cn("flex min-h-11 items-center gap-2.5 py-2 pr-3 text-left", open && "border-brand-600 ring-2 ring-brand-600/30"),
          )}
        >
          <Flag locale={selected} />
          <span id={`${id}-value`} className="min-w-0 flex-1 truncate">
            {LOCALE_NAMES[selected]}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-ink-500 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            // Giữ focus ở nút khi bấm vào mục.
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-ink-200 bg-surface py-1 shadow-lg"
          >
            {LOCALES.map((l, i) => (
              <li
                key={l}
                id={optionId(i)}
                role="option"
                lang={l}
                aria-selected={l === selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(l)}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2.5 px-3.5 text-sm text-ink-900",
                  i === active && "bg-brand-50",
                )}
              >
                <Flag locale={l} />
                <span className="min-w-0 flex-1 truncate">{LOCALE_NAMES[l]}</span>
                {l === selected && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p id={hintId} className="text-xs text-ink-500">
        {t("uiLanguage.hint")}
      </p>
      <FormSuccess message={saved ? t("uiLanguage.saved") : undefined} />
      <FormError message={error} />
    </div>
  );
}
