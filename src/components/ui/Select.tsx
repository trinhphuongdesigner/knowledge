"use client";
"use no memo"; // React Compiler crashes the Next build on this file (listbox with portal + manual focus)

/**
 * Custom listbox dropdown (replaces the native <select> popup).
 *
 * API (backwards compatible with the old native Select):
 *   <Select label? error? disabled? name? placeholder? value onChange? onValueChange? options? className? id? aria-label?>
 *     <option value="x" disabled?>Label</option> ...        // children are parsed, OR
 *   </Select>
 *   <Select options={[{ value, label, color?, disabled? }]} />
 *
 * - `onChange` receives an event-like object `{ target: { value, name } }` (so `e.target.value` keeps working);
 *   `onValueChange(value)` is the plain alternative.
 * - `option.color` is a Tailwind background class (static string, e.g. "bg-blue-500") rendered as a dot.
 * - `name` renders a hidden input so plain <form> submissions work.
 * - The popover is portalled to document.body (never clipped by Modal overflow), flips up when there
 *   is no room below, and Esc closes only the dropdown (it stops propagation before the Modal sees it).
 */

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { fieldClass } from "./fieldStyles";

export type SelectOption = { value: string; label: string; color?: string; disabled?: boolean };

export type SelectProps = {
  label?: string;
  error?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  placeholder?: string;
  value: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  children?: ReactNode;
  "aria-label"?: string;
};

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
}

function parseChildren(children: ReactNode): SelectOption[] {
  const out: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const p = child.props as { value?: string | number; children?: ReactNode; disabled?: boolean };
    if (child.type === "option") {
      const label = textOf(p.children);
      out.push({ value: p.value == null ? label : String(p.value), label, disabled: p.disabled });
    } else if (p.children) {
      out.push(...parseChildren(p.children));
    }
  });
  return out;
}

const MAX_H = 288;
const GAP = 6;

type Pos = { left: number; width: number; top?: number; bottom?: number; maxHeight: number };

export function Select({
  label,
  error,
  disabled,
  name,
  id,
  className,
  placeholder,
  value,
  onChange,
  onValueChange,
  options,
  children,
  "aria-label": ariaLabel,
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const listId = `${fieldId}-list`;
  const opts = useMemo(() => options ?? parseChildren(children), [options, children]);
  const selectedIndex = opts.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? opts[selectedIndex] : undefined;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeBuf = useRef({ text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });

  useEffect(() => {
    const t = typeBuf.current;
    return () => clearTimeout(t.timer);
  }, []);

  const enabled = useCallback((i: number) => i >= 0 && i < opts.length && !opts[i].disabled, [opts]);
  const firstEnabled = useCallback(() => opts.findIndex((o) => !o.disabled), [opts]);
  const lastEnabled = useCallback(() => {
    for (let i = opts.length - 1; i >= 0; i--) if (!opts[i].disabled) return i;
    return -1;
  }, [opts]);

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const below = vh - r.bottom - GAP - 8;
    const above = r.top - GAP - 8;
    const want = Math.min(MAX_H, opts.length * 44 + 8);
    const up = below < want && above > below;
    const room = up ? above : below;
    const width = Math.min(r.width, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setPos(
      up
        ? { left, width, bottom: vh - r.top + GAP, maxHeight: Math.max(120, Math.min(MAX_H, room)) }
        : { left, width, top: r.bottom + GAP, maxHeight: Math.max(120, Math.min(MAX_H, room)) },
    );
  }, [opts.length]);

  useLayoutEffect(() => {
    if (open) measure();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (listRef.current?.contains(e.target as Node)) return;
      measure();
    };
    // Capture on window so Esc closes only the dropdown, before a surrounding Modal (document listener) sees it.
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onEsc, true);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("keydown", onEsc, true);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, measure]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open || active < 0) return;
    document.getElementById(`${fieldId}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, fieldId]);

  function openList(at?: number) {
    if (disabled) return;
    setActive(at ?? (enabled(selectedIndex) ? selectedIndex : firstEnabled()));
    setOpen(true);
  }

  function commit(i: number) {
    if (!enabled(i)) return;
    const next = opts[i].value;
    if (next !== value) {
      onChange?.({ target: { value: next, name } });
      onValueChange?.(next);
    }
    setOpen(false);
    triggerRef.current?.focus();
  }

  function move(from: number, dir: 1 | -1) {
    for (let i = from + dir; i >= 0 && i < opts.length; i += dir) if (!opts[i].disabled) return i;
    return from;
  }

  function typeAhead(ch: string) {
    const b = typeBuf.current;
    clearTimeout(b.timer);
    b.text += ch.toLowerCase();
    b.timer = setTimeout(() => (b.text = ""), 600);
    const repeated = b.text.length > 1 && [...b.text].every((c) => c === b.text[0]);
    const needle = repeated ? b.text[0] : b.text;
    const start = open ? active : selectedIndex;
    const n = opts.length;
    for (let k = 0; k < n; k++) {
      // Cycle forward from the current item when one letter is repeated; otherwise search from the current item.
      const i = (start + (repeated || b.text.length === 1 ? 1 : 0) + k + n) % n;
      if (!opts[i].disabled && opts[i].label.toLowerCase().startsWith(needle)) {
        if (open) setActive(i);
        else openList(i);
        return;
      }
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    const k = e.key;
    if (k === "Tab") {
      if (open) setOpen(false);
      return;
    }
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      if (!open) openList();
      else setActive((a) => (a < 0 ? (k === "ArrowDown" ? firstEnabled() : lastEnabled()) : move(a, k === "ArrowDown" ? 1 : -1)));
      return;
    }
    if (k === "Home" || k === "End") {
      e.preventDefault();
      const i = k === "Home" ? firstEnabled() : lastEnabled();
      if (!open) openList(i);
      else setActive(i);
      return;
    }
    if (k === "Enter" || (k === " " && !typeBuf.current.text)) {
      e.preventDefault();
      if (!open) openList();
      else commit(active);
      return;
    }
    if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      typeAhead(k);
    }
  }

  const labelId = `${fieldId}-label`;
  const dot = (color?: string) =>
    color ? <span className={cn("size-2.5 shrink-0 rounded-full", color)} aria-hidden /> : null;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label id={labelId} onClick={() => triggerRef.current?.focus()} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${fieldId}-opt-${active}` : undefined}
        aria-labelledby={label ? `${labelId} ${fieldId}` : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={fieldClass(
          error,
          cn("flex min-h-11 items-center gap-2 py-2 pr-3 text-left", open && "border-blue-600 ring-2 ring-blue-600/30", className),
        )}
      >
        {dot(selected?.color)}
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-slate-400")}>
          {selected ? selected.label : (placeholder ?? "Chọn…")}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {name && <input type="hidden" name={name} value={value} />}
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : ariaLabel}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              position: "fixed",
              left: pos.left,
              width: pos.width,
              top: pos.top,
              bottom: pos.bottom,
              maxHeight: pos.maxHeight,
            }}
            className="z-70 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
          >
            {opts.map((o, i) => {
              const isSel = i === selectedIndex;
              return (
                <li
                  key={o.value}
                  id={`${fieldId}-opt-${i}`}
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={o.disabled || undefined}
                  onMouseEnter={() => !o.disabled && setActive(i)}
                  onClick={() => commit(i)}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    o.disabled && "cursor-not-allowed opacity-50",
                    isSel ? "bg-blue-50 font-medium text-blue-700" : "text-slate-800",
                    i === active && !isSel && "bg-blue-50/70",
                    i === active && isSel && "bg-blue-100",
                  )}
                >
                  {dot(o.color)}
                  <span className="min-w-0 flex-1 break-words">{o.label}</span>
                  {isSel && <Check className="size-4 shrink-0 text-blue-600" aria-hidden />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
