"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/api";
import { colorClasses } from "@/components/categories/colors";
import {
  LEVELS,
  LEVEL_LABELS,
  setInputSchema,
  type CategoryDTO,
  type Level,
  type StudySetDTO,
} from "@/lib/validators";

type Errors = Partial<Record<"title" | "description" | "categoryId" | "level", string>>;

const MESSAGES: Record<string, string> = {
  title: "Vui lòng nhập tên nhóm thẻ (tối đa 200 ký tự).",
  description: "Mô tả tối đa 2000 ký tự.",
  categoryId: "Vui lòng chọn danh mục.",
  level: "Cấp độ không hợp lệ.",
};

export function SetForm({
  categories,
  set,
  onCancel,
}: {
  categories: CategoryDTO[];
  set?: StudySetDTO;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(set?.title ?? "");
  const [description, setDescription] = useState(set?.description ?? "");
  const [categoryId, setCategoryId] = useState<string>(set?.category.id ?? categories[0]?.id ?? "");
  const [level, setLevel] = useState<Level | "">(set?.level ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const parsed = setInputSchema.safeParse({ title, description, categoryId, level: level || null });
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
        label="Tên nhóm thẻ"
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
        placeholder="Nhóm thẻ này nói về điều gì?"
      />
      <div className="flex flex-col gap-1.5">
        <Select
          label="Danh mục"
          value={categoryId}
          onValueChange={setCategoryId}
          error={errors.categoryId}
          placeholder="Chọn danh mục"
          options={categories.map((c) => ({ value: c.id, label: c.name, color: colorClasses(c.color).dot }))}
        />
        <Link
          href="/categories"
          className="self-start text-sm font-medium text-accent hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Quản lý danh mục
        </Link>
      </div>
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
          {set ? "Lưu thay đổi" : "Tạo nhóm thẻ"}
        </Button>
      </div>
    </form>
  );
}
