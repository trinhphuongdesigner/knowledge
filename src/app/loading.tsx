import { Container } from "@/components/layout/Container";
import { PageLoader } from "@/components/ui";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("common");
  return (
    <Container className="py-6 sm:py-8">
      <PageLoader label={t("loading")} />
    </Container>
  );
}
