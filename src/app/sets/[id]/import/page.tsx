import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImportWizard } from "@/components/import/ImportWizard";
import { Container } from "@/components/layout/Container";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Import thẻ — Knowledge" };

export default async function ImportPage({ params }: PageProps<"/sets/[id]/import">) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const set = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true, title: true, category: true } });
  if (!set) notFound();

  return (
    <Container className="py-6 sm:py-8">
      <Link
        href={`/sets/${set.id}`}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> Quay lại bộ học
      </Link>
      <h1 className="mb-6 mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Import thẻ vào: {set.title}</h1>
      <ImportWizard setId={set.id} english={set.category === "ENGLISH"} />
    </Container>
  );
}
