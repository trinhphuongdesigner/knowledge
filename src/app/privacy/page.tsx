import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { getLocale, getMessages, getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("legal");
  return {
    title: t("privacy.metaTitle"),
    description: t("privacy.metaDescription"),
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const [locale, t, messages] = await Promise.all([getLocale(), getT("legal"), getMessages()]);
  const { title, intro, sections } = messages.legal.privacy;
  return <LegalPage locale={locale} t={t} title={title} intro={intro} sections={sections} />;
}
