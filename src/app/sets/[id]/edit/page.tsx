import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { DeleteSetButton } from "@/components/sets/DeleteSetButton";
import { SetForm } from "@/components/sets/SetForm";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { toSetDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sửa bộ học — Knowledge" };

export default async function EditSetPage({ params }: PageProps<"/sets/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const set = await db.studySet.findFirst({ where: { id, userId: user.id }, include: { _count: { select: { cards: true } } } });
  if (!set) notFound();
  const dto = toSetDTO(set, set._count.cards);

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Sửa bộ học</h1>
      <Card>
        <SetForm set={dto} />
      </Card>
      <Card className="mt-6 border-red-200">
        <h2 className="text-base font-semibold text-slate-900">Vùng nguy hiểm</h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">Xoá bộ học sẽ xoá toàn bộ thẻ bên trong.</p>
        <DeleteSetButton id={dto.id} title={dto.title} />
      </Card>
    </Container>
  );
}
