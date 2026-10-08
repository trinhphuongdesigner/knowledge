import { Container } from "@/components/layout/Container";
import { SetDetailSkeleton } from "@/components/sets/SetDetailSkeleton";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("sets");
  return (
    <Container className="py-6 sm:py-8">
      <SetDetailSkeleton label={t("loading")} />
    </Container>
  );
}
