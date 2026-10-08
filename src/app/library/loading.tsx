import { LibraryPageSkeleton } from "@/components/library/LibrarySkeleton";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("library");
  return <LibraryPageSkeleton label={t("loading")} />;
}
