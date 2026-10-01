"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { SetForm } from "./SetForm";

export function CreateSetButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Tạo bộ học
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Tạo bộ học mới">
        <SetForm onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
