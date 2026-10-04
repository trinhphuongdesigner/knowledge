"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { useT } from "@/i18n/client";
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
  const t = useT("sets");
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        {t("create.button")}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("create.title")}>
        <SetForm categories={categories} canManageCategories={canManageCategories} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
