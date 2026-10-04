import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ImportWizard } from "@/components/import/ImportWizard";
import { Container } from "@/components/layout/Container";
import { requireUser } from "@/lib/auth/dal";
import { getT } from "@/i18n/server";
import { db } from "@/lib/db";
import { isUuid } from "@/lib/ids";
import { Breadcrumbs } from "@/components/ui";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("import");
  return { title: t("page.metaTitle") };
}

export default async function ImportPage({ params }: PageProps<"/sets/[id]/import">) {
  const user = await requireUser();
  const t = await getT("import");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const set = await db.studySet.findFirst({ where: { id, userId: user.id }, select: { id: true, title: true, category: { select: { isEnglish: true } } } });
  if (!set) notFound();

  return (
    <Container className="py-6 sm:py-8">
      <Breadcrumbs items={[{ label: t("page.home"), href: "/" }, { label: set.title, href: `/sets/${set.id}` }, { label: t("page.breadcrumb") }]} />
      <h1 className="mb-6 text-2xl font-bold text-ink-900 sm:text-3xl">{t("page.title", { title: set.title })}</h1>
      <ImportWizard setId={set.id} english={set.category.isEnglish} />
    </Container>
  );
}
