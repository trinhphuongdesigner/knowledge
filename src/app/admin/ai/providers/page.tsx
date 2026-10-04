import type { Metadata } from "next";
import { AiProviderManager } from "@/components/admin/ai/AiProviderManager";
import { AiTabs } from "@/components/admin/ai/AiTabs";
import { Breadcrumbs } from "@/components/ui";
import { getT } from "@/i18n/server";
import { listAiProviders } from "@/lib/admin/ai-providers";
import { aiEncryptionReady } from "@/lib/ai";
import { requireAdmin } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("admin");
  return { title: `${t("aiProviders.title")} — ${t("meta.suffix")}` };
}

export default async function AdminAiProvidersPage() {
  await requireAdmin();
  const [providers, t] = await Promise.all([listAiProviders(), getT("admin")]);
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: t("home"), href: "/" },
          { label: t("admin"), href: "/admin" },
          { label: t("ai.title"), href: "/admin/ai" },
          { label: t("aiProviders.title") },
        ]}
        className="mb-0"
      />
      <div>
        <h1 className="text-2xl font-bold text-ink-900">{t("ai.title")}</h1>
        <p className="mt-1 text-sm text-ink-600">{t("aiProviders.desc")}</p>
      </div>
      <AiTabs active="/admin/ai/providers" t={t} />
      <AiProviderManager
        providers={providers}
        encryptionReady={aiEncryptionReady()}
        envFallback={!!process.env.ANTHROPIC_API_KEY?.trim()}
      />
    </div>
  );
}
