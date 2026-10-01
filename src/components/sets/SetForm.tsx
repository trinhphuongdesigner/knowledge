"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  LEVELS,
  LEVEL_LABELS,
  setInputSchema,
  type Category,
  type Level,
  type StudySetDTO,
} from "@/lib/validators";

type Errors = Partial<Record<"title" | "description" | "category" | "level", string>>;

const MESSAGES: Record<string, string> = {
  title: "Vui lòng nhập tên bộ học (tối đa 200 ký tự).",
  description: "Mô tả tối đa 2000 ký tự.",
  category: "Vui lòng chọn lĩnh vực.",
  level: "Cấp độ không hợp lệ.",
};

export function SetForm({ set, onCancel }: { set?: StudySetDTO; onCancel?: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(set?.title ?? "");
  const [description, setDescription] = useState(set?.description ?? "");
  const [category, setCategory] = useState<Category>(set?.category ?? "IT");
  const [level, setLevel] = useState<Level | "">(set?.level ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const parsed = setInputSchema.safeParse({ title, description, category, level: level || null });
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        if (!errs[key]) errs[key] = MESSAGES[key] ?? issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      if (set) {
        await api.updateSet(set.id, parsed.data);
        router.push(`/sets/${set.id}`);
      } else {
        const created = await api.createSet(parsed.data);
        router.push(`/sets/${created.id}`);
      }
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Tên bộ học"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Ví dụ: JavaScript cơ bản"
        maxLength={250}
        autoFocus={!set}
      />
      <Textarea
        label="Mô tả (tuỳ chọn)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        rows={4}
        placeholder="Bộ học này nói về điều gì?"
      />
      <Select
        label="Lĩnh vực"
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
        error={errors.category}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABELS[c]}
          </option>
        ))}
      </Select>
      <Select
        label="Cấp độ (tuỳ chọn)"
        value={level}
        onChange={(e) => setLevel(e.target.value as Level | "")}
        error={errors.level}
      >
        <option value="">Không chọn</option>
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {LEVEL_LABELS[l]}
          </option>
        ))}
      </Select>
      {submitError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => (onCancel ? onCancel() : router.back())} disabled={loading}>
          Huỷ
        </Button>
        <Button type="submit" loading={loading}>
          {set ? "Lưu thay đổi" : "Tạo bộ học"}
        </Button>
      </div>
    </form>
  );
}
