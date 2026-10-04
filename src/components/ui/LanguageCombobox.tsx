"use client";

import { Check, ChevronDown } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLocale, useT } from "@/i18n/client";
import { languageOptions, type LanguageCode } from "@/lib/languages";
import { cn } from "@/lib/utils";
import { Field } from "./Field";
import { fieldClass } from "./fieldStyles";

/** "đ" (U+0111) không tách được bằng NFD nên thay riêng; viết bằng mã để file không chứa ký tự có dấu. */
const D_STROKE = String.fromCharCode(0x111);

/**
 * Chuẩn hoá để so khớp: NFD + bỏ dấu kết hợp + đ→d + chữ thường, nên "tieng viet" ra "Tiếng Việt".
 * Chữ không thuộc hệ Latin (CJK, Thái, Cyrillic…) vẫn so khớp được vì cùng một phép chuẩn hoá áp cho nhãn lẫn từ khoá.
 */
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replaceAll(D_STROKE, "d");

export function LanguageCombobox({
  name,
  label,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  defaultValue: LanguageCode | string;
  error?: string;
}) {
  const locale = useLocale();
  const t = useT("common");
  const options = useMemo(() => languageOptions(locale), [locale]);
  const folded = useMemo(() => options.map((o) => fold(o.label) + " " + o.code), [options]);
  const [value, setValue] = useState<string>(defaultValue);
  const [query, setQuery] = useState<string | null>(null); // null = hiển thị tên đã chọn
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (code: string) => `${id}-opt-${code}`;

  const selected = options.find((o) => o.code === value);
  const filtered = useMemo(() => {
    const q = query ? fold(query.trim()) : "";
    return q ? options.filter((_, i) => folded[i].includes(q)) : options;
  }, [query, options, folded]);
  const activeIndex = Math.min(active, Math.max(filtered.length - 1, 0));
  const activeOption = open ? filtered[activeIndex] : undefined;

  function scrollTo(index: number) {
    // Chờ React render lại danh sách rồi cuộn tới mục đang chọn.
    requestAnimationFrame(() => listRef.current?.children[index]?.scrollIntoView({ block: "nearest" }));
  }

  function choose(code: string) {
    setValue(code);
    setQuery(null);
    setOpen(false);
  }

  function move(delta: number) {
    if (!open) {
      setOpen(true);
      const i = Math.max(
        0,
        filtered.findIndex((o) => o.code === value),
      );
      setActive(i);
      scrollTo(i);
      return;
    }
    if (filtered.length === 0) return;
    const next = (activeIndex + delta + filtered.length) % filtered.length;
    setActive(next);
    scrollTo(next);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      if (open) {
        e.preventDefault(); // không gửi form khi đang chọn
        if (activeOption) choose(activeOption.code);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setQuery(null);
      }
    } else if (e.key === "Tab") {
      setOpen(false);
      setQuery(null);
    }
  }

  return (
    <Field id={id} label={label} error={error}>
      <input type="hidden" name={name} value={value} />
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOption ? optionId(activeOption.code) : undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={t("languageSearch")}
          className={fieldClass(error, "min-h-11 pr-10")}
          value={query ?? selected?.label ?? ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={(e) => e.currentTarget.select()}
          onClick={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setQuery(null);
          }}
          onKeyDown={onKeyDown}
        />
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-500"
        />
        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            // Giữ focus ở ô nhập khi bấm vào mục (tránh onBlur đóng danh sách trước khi chọn).
            onMouseDown={(e) => e.preventDefault()}
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-ink-200 bg-surface py-1 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li role="presentation" className="px-3.5 py-3 text-sm text-ink-500">
                {t("languageNone")}
              </li>
            ) : (
              filtered.map((o, i) => (
                <li
                  key={o.code}
                  id={optionId(o.code)}
                  role="option"
                  aria-selected={o.code === value}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(o.code)}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3.5 text-sm text-ink-900",
                    i === activeIndex && "bg-brand-50",
                  )}
                >
                  <span>
                    {o.label} <span className="text-ink-500">({o.code})</span>
                  </span>
                  {o.code === value && <Check className="size-4 text-accent" aria-hidden />}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </Field>
  );
}
