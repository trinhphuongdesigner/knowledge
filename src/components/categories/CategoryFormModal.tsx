"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button, Input, Modal } from "@/components/ui";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, type CategoryColor, type CategoryDTO } from "@/lib/validators";
import { CATEGORY_COLOR_CLASSES } from "./colors";

export type CategoryFormValues = { name: string; color: CategoryColor; isEnglish: boolean };

type Props = {
  open: boolean;
  category?: CategoryDTO | null;
  onClose: () => void;
  /** Throw an Error with a user-facing message to show it in the form. */
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

/** Create / edit modal. The inner form is keyed so its state resets whenever the target changes. */
export function CategoryFormModal({ open, category, onClose, onSubmit }: Props) {
  const t = useT("categories");
  return (
    <Modal open={open} onClose={onClose} title={category ? t("form.editTitle") : t("form.createTitle")}>
      <CategoryForm key={category?.id ?? "new"} category={category} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

function CategoryForm({ category, onClose, onSubmit }: Omit<Props, "open">) {
  const t = useT("categories");
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState<CategoryColor>(category?.color ?? "BLUE");
  const [isEnglish, setIsEnglish] = useState(category?.isEnglish ?? false);
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 40) {
      setNameError(t("form.nameError"));
      return;
    }
    setNameError("");
    setSubmitError("");
    setLoading(true);
    try {
      await onSubmit({ name: trimmed, color, isEnglish });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("form.genericError");
      if (/tr\u00f9ng|\u0111\u00e3 t\u1ed3n t\u1ea1i|\u0111\u00e3 c\u00f3|exist|already|duplicate/i.test(msg)) setNameError(msg);
      else setSubmitError(msg);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input
        label={t("form.name")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={nameError}
        placeholder={t("form.namePlaceholder")}
        maxLength={40}
        autoFocus
      />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink-700">{t("form.color")}</legend>
        <div role="radiogroup" aria-label={t("form.color")} className="flex flex-wrap gap-1">
          {CATEGORY_COLORS.map((c) => {
            const cls = CATEGORY_COLOR_CLASSES[c];
            const checked = color === c;
            return (
              <label
                key={c}
                title={t(`colors.${c}`)}
                className="relative flex size-11 cursor-pointer items-center justify-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-brand-600"
              >
                <input
                  type="radio"
                  name="category-color"
                  value={c}
                  checked={checked}
                  onChange={() => setColor(c)}
                  className="sr-only"
                  aria-label={t(`colors.${c}`)}
                />
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full ring-offset-2 transition-shadow",
                    cls.swatch,
                    checked && cn("ring-2", cls.ring),
                  )}
                >
                  {checked && <Check className="size-4 text-white" aria-hidden />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-ink-200 p-3 hover:bg-ink-50">
        <input
          type="checkbox"
          role="switch"
          checked={isEnglish}
          onChange={(e) => setIsEnglish(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-ink-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand-600 peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600"
        />
        <span className="text-sm">
          <span className="block font-medium text-ink-900">{t("form.english")}</span>
          <span className="block text-ink-600">{t("form.englishHint")}</span>
        </span>
      </label>

      {submitError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {t("form.cancel")}
        </Button>
        <Button type="submit" loading={loading}>
          {category ? t("form.saveChanges") : t("form.create")}
        </Button>
      </div>
    </form>
  );
}
