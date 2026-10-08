import { AccountPageSkeleton } from "@/components/account/AccountSkeleton";
import { getT } from "@/i18n/server";

export default async function Loading() {
  const t = await getT("account");
  return <AccountPageSkeleton label={t("loading")} />;
}
