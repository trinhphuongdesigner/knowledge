"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import type { CategoryDTO } from "@/lib/validators";
import { SetForm } from "./SetForm";

export function CreateSetButton({
  className,
  categories,
  canManageCategories,
}: {
  className?: string;
  categories: CategoryDTO[];
  canManageCategories?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Tạo nhóm thẻ
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Tạo nhóm thẻ mới">
        <SetForm categories={categories} canManageCategories={canManageCategories} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
