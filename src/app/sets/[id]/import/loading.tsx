import { Container } from "@/components/layout/Container";
import { ImportSkeleton } from "@/components/import/ImportSkeleton";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("import");
  return (
    <Container className="py-6 sm:py-8">
      <ImportSkeleton label={t("loading")} />
    </Container>
  );
}
