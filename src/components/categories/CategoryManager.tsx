"use client";

import { ArrowDown, ArrowUp, FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, Modal, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/lib/validators";
import { CategoryFormModal, type CategoryFormValues } from "./CategoryFormModal";
import { colorClasses } from "./colors";

/** Danh mục kèm tổng số thẻ (admin). */
export type AdminCategory = CategoryDTO & { cardCount?: number };

async function call<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Yêu cầu thất bại (${res.status})`);
  return data as T;
}

type FormTarget = { mode: "create" } | { mode: "edit"; category: AdminCategory } | null;

export function CategoryManager({ initialCategories }: { initialCategories: AdminCategory[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [seen, setSeen] = useState(initialCategories);
  const [form, setForm] = useState<FormTarget>(null);
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState("");

  // Re-sync when the server component hands us fresh data after router.refresh().
  if (seen !== initialCategories) {
    setSeen(initialCategories);
    setCategories(initialCategories);
  }

  async function save(values: CategoryFormValues) {
    if (form?.mode === "edit") {
      const id = form.category.id;
      const updated = await call<CategoryDTO>(`/api/admin/categories/${id}`, "PATCH", values);
      setCategories((list) => list.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } else {
      const created = await call<CategoryDTO>("/api/admin/categories", "POST", values);
      setCategories((list) => [...list, { ...created, cardCount: 0 }]);
    }
    setForm(null);
    router.refresh();
  }

  async function move(index: number, direction: "up" | "down") {
    const j = direction === "up" ? index - 1 : index + 1;
    if (j < 0 || j >= categories.length || moving) return;
    const id = categories[index].id;
    const previous = categories;
    const next = [...categories];
    [next[index], next[j]] = [next[j], next[index]];
    setCategories(next);
    setMoving(true);
    setMoveError("");
    try {
      await call("/api/admin/categories/reorder", "POST", { id, direction });
      router.refresh();
    } catch (e) {
      setCategories(previous);
      setMoveError(e instanceof Error ? e.message : "Không thể đổi thứ tự.");
    } finally {
      setMoving(false);
    }
  }

  function openDelete(c: AdminCategory) {
    setDeleteError("");
    setReassignTo("");
    setToDelete(c);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await call(`/api/admin/categories/${toDelete.id}`, "DELETE", reassignTo ? { reassignTo } : undefined);
      setToDelete(null);
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Không thể xoá danh mục.");
    } finally {
      setDeleting(false);
    }
  }

  const needsTarget = !!toDelete && toDelete.setCount > 0;
  const targets = toDelete ? categories.filter((c) => c.id !== toDelete.id) : [];

  return (
    <>
      {moveError && (
        <p role="alert" className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {moveError}
        </p>
      )}
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Chưa có danh mục nào"
          description="Tạo danh mục để nhóm các nhóm thẻ."
          action={
            <Button onClick={() => setForm({ mode: "create" })}>
              <Plus className="size-4" aria-hidden />
              Tạo danh mục
            </Button>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {categories.map((c, i) => (
              <li key={c.id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn("size-3.5 shrink-0 rounded-full", colorClasses(c.color).dot)} aria-hidden />
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="break-words text-base font-semibold text-ink-900">{c.name}</h2>
                      {c.isEnglish && <Badge tone="green">Tiếng Anh</Badge>}
                      <span className="text-sm text-ink-500">
                        {c.setCount} bộ{c.cardCount !== undefined && ` · ${c.cardCount} thẻ`}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={i === 0 || moving}
                      onClick={() => move(i, "up")}
                      aria-label={`Chuyển danh mục ${c.name} lên`}
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={i === categories.length - 1 || moving}
                      onClick={() => move(i, "down")}
                      aria-label={`Chuyển danh mục ${c.name} xuống`}
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setForm({ mode: "edit", category: c })}>
                      <Pencil className="size-4" aria-hidden />
                      Sửa<span className="sr-only"> danh mục {c.name}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600" onClick={() => openDelete(c)}>
                      <Trash2 className="size-4" aria-hidden />
                      Xoá<span className="sr-only"> danh mục {c.name}</span>
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button onClick={() => setForm({ mode: "create" })}>
              <Plus className="size-4" aria-hidden />
              Tạo danh mục
            </Button>
          </div>
        </>
      )}

      <CategoryFormModal
        open={form !== null}
        category={form?.mode === "edit" ? form.category : null}
        onClose={() => setForm(null)}
        onSubmit={save}
      />

      <Modal open={!!toDelete} onClose={() => !deleting && setToDelete(null)} title="Xoá danh mục?" centered>
        {toDelete && (
          <>
            <p className="text-sm text-ink-600">
              {needsTarget ? (
                <>
                  Danh mục <strong className="break-words text-ink-900">{toDelete.name}</strong> còn {toDelete.setCount} bộ
                  thẻ. Chọn danh mục đích để chuyển toàn bộ các bộ đó sang, rồi danh mục này sẽ bị xoá.
                </>
              ) : (
                <>
                  Danh mục <strong className="break-words text-ink-900">{toDelete.name}</strong> sẽ bị xoá vĩnh viễn.
                </>
              )}
            </p>
            {needsTarget && (
              <div className="mt-3">
                <Select
                  label="Chuyển các bộ sang"
                  value={reassignTo}
                  onValueChange={setReassignTo}
                  placeholder={targets.length ? "Chọn danh mục đích" : "Không có danh mục khác"}
                  options={targets.map((c) => ({ value: c.id, label: c.name, color: colorClasses(c.color).dot }))}
                />
              </div>
            )}
            {deleteError && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setToDelete(null)} disabled={deleting}>
                Huỷ
              </Button>
              <Button variant="danger" onClick={confirmDelete} loading={deleting} disabled={needsTarget && !reassignTo}>
                {needsTarget ? "Chuyển và xoá" : "Xoá"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
