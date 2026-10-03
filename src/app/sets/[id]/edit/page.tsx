import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { DeleteSetButton } from "@/components/sets/DeleteSetButton";
import { SetForm } from "@/components/sets/SetForm";
import { Card, Breadcrumbs } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { listCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { toSetDTO } from "@/lib/dto";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sửa nhóm thẻ — Knowledge" };

export default async function EditSetPage({ params }: PageProps<"/sets/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [set, categories] = await Promise.all([
    db.studySet.findFirst({
      where: { id, userId: user.id },
      include: { category: true, _count: { select: { cards: true } } },
    }),
    listCategories(),
  ]);
  if (!set) notFound();
  const dto = toSetDTO(set, set._count.cards);

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: set.title, href: `/sets/${set.id}` }, { label: "Chỉnh sửa" }]} />
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Sửa nhóm thẻ</h1>
      <Card>
        <SetForm set={dto} categories={categories} canManageCategories={user.role === "ADMIN"} />
      </Card>
      <Card className="mt-6 border-red-200">
        <h2 className="text-base font-semibold text-ink-900">Vùng nguy hiểm</h2>
        <p className="mb-4 mt-1 text-sm text-ink-600">Xoá nhóm thẻ sẽ xoá toàn bộ thẻ bên trong.</p>
        <DeleteSetButton id={dto.id} title={dto.title} />
      </Card>
    </Container>
  );
}
