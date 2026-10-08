import { Container } from "@/components/layout/Container";
import { SetEditSkeleton } from "@/components/sets/SetEditSkeleton";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("sets");
  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <SetEditSkeleton label={t("loading")} />
    </Container>
  );
}
