"use client";

import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Card, EmptyState, Modal } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/lib/validators";
import { CategoryFormModal, type CategoryFormValues } from "./CategoryFormModal";
import { colorClasses } from "./colors";

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

type FormTarget = { mode: "create" } | { mode: "edit"; category: CategoryDTO } | null;

export function CategoryManager({ initialCategories }: { initialCategories: CategoryDTO[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [seen, setSeen] = useState(initialCategories);
  const [form, setForm] = useState<FormTarget>(null);
  const [toDelete, setToDelete] = useState<CategoryDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Re-sync when the server component hands us fresh data after router.refresh().
  if (seen !== initialCategories) {
    setSeen(initialCategories);
    setCategories(initialCategories);
  }

  async function save(values: CategoryFormValues) {
    if (form?.mode === "edit") {
      const id = form.category.id;
      const updated = await call<CategoryDTO>(`/api/categories/${id}`, "PATCH", values);
      setCategories((list) => list.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } else {
      const created = await call<CategoryDTO>("/api/categories", "POST", values);
      setCategories((list) => [...list, created]);
    }
    setForm(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await call(`/api/categories/${toDelete.id}`, "DELETE");
      const id = toDelete.id;
      setCategories((list) => list.filter((c) => c.id !== id));
      setToDelete(null);
      router.refresh();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Không thể xoá danh mục.");
    } finally {
      setDeleting(false);
    }
  }

  const blocked = !!toDelete && toDelete.setCount > 0;

  return (
    <>
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Chưa có danh mục nào"
          description="Tạo danh mục để nhóm các nhóm thẻ của bạn."
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
            {categories.map((c) => (
              <li key={c.id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={cn("size-3.5 shrink-0 rounded-full", colorClasses(c.color).dot)} aria-hidden />
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="break-words text-base font-semibold text-ink-900">{c.name}</h2>
                      {c.isEnglish && <Badge tone="green">Tiếng Anh</Badge>}
                      <span className="text-sm text-ink-500">{c.setCount} nhóm thẻ</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" className="min-h-11" onClick={() => setForm({ mode: "edit", category: c })}>
                      <Pencil className="size-4" aria-hidden />
                      Sửa<span className="sr-only"> danh mục {c.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11 hover:bg-red-50 hover:text-red-600"
                      onClick={() => {
                        setDeleteError("");
                        setToDelete(c);
                      }}
                    >
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

      <Modal open={!!toDelete} onClose={() => !deleting && setToDelete(null)} title="Xoá danh mục?">
        {toDelete && (
          <>
            <p className="text-sm text-ink-600">
              {blocked ? (
                <>
                  Danh mục <strong className="break-words text-ink-900">{toDelete.name}</strong> còn {toDelete.setCount}{" "}
                  nhóm thẻ nên chưa thể xoá. Hãy chuyển hoặc xoá các nhóm thẻ đó trước.
                </>
              ) : (
                <>
                  Danh mục <strong className="break-words text-ink-900">{toDelete.name}</strong> sẽ bị xoá vĩnh viễn.
                </>
              )}
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setToDelete(null)} disabled={deleting}>
                {blocked ? "Đóng" : "Huỷ"}
              </Button>
              <Button variant="danger" onClick={confirmDelete} loading={deleting} disabled={blocked}>
                Xoá
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
