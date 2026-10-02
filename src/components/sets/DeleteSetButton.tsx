"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { api } from "@/lib/api";

export function DeleteSetButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onDelete() {
    setLoading(true);
    setError("");
    try {
      await api.deleteSet(id);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể xoá nhóm thẻ.");
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" aria-hidden />
        Xoá nhóm thẻ
      </Button>
      <Modal open={open} onClose={() => !loading && setOpen(false)} title="Xoá nhóm thẻ?">
        <p className="text-sm text-slate-600">
          Nhóm thẻ <strong className="break-words text-slate-900">{title}</strong> và toàn bộ thẻ bên trong sẽ bị xoá vĩnh
          viễn. Hành động này không thể hoàn tác.
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
            Huỷ
          </Button>
          <Button variant="danger" onClick={onDelete} loading={loading}>
            Xoá
          </Button>
        </div>
      </Modal>
    </>
  );
}
