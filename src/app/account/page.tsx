import { Download } from "lucide-react";
import type { Metadata } from "next";
import { ACCOUNT_TABS, AccountTabs, type AccountTab } from "@/components/account/AccountTabs";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SoundEffectsToggle } from "@/components/account/SoundEffectsToggle";
import { StudyHistory } from "@/components/account/StudyHistory";
import { StudySettingsForm } from "@/components/account/StudySettingsForm";
import { UiLanguageSelect } from "@/components/account/UiLanguageSelect";
import { Container } from "@/components/layout/Container";
import { UserAvatar } from "@/components/avatar";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { Card, Breadcrumbs } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getLocale, getT } from "@/i18n/server";
import { DEFAULT_NATIVE_LANGUAGE } from "@/lib/languages";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT("account"))("metaTitle") };
}

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const [user, t, tc, locale] = await Promise.all([requireUser(), getT("account"), getT("common"), getLocale()]);
  const { tab } = await searchParams;
  const raw = Array.isArray(tab) ? tab[0] : tab;
  const active: AccountTab = ACCOUNT_TABS.find((t) => t === raw) ?? "history";

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("breadcrumb") }]} />
      <div className="mb-6 flex items-center gap-3">
        <UserAvatar src={user.avatarUrl} gender={user.gender} name={user.name} size={48} />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink-900">{t("title")}</h1>
          <p className="truncate text-sm text-ink-600">{user.name ?? user.email}</p>
        </div>
      </div>
      <AccountTabs active={active} />
      {active === "history" && <StudyHistory userId={user.id} />}
      {active === "stats" && <StatsPanel userId={user.id} />}
      {active === "settings" && <SettingsTab userId={user.id} />}
      {active === "profile" && (
        <div className="space-y-4">
          <Card className="space-y-4">
            <UiLanguageSelect value={locale} />
            <div className="border-t border-ink-200 pt-4">
              <SoundEffectsToggle />
            </div>
          </Card>
          <Card>
            <ProfileTab userId={user.id} email={user.email} />
          </Card>
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-ink-900">{t("export.title")}</h2>
              <p className="text-sm text-ink-600">{t("export.description")}</p>
            </div>
            <a
              href="/api/account/export"
              download
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-surface px-4 text-sm font-semibold text-ink-900 shadow-[0_3px_0_var(--color-ink-200)] hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <Download className="size-4" aria-hidden />
              {t("export.button")}
            </a>
          </Card>
        </div>
      )}
    </Container>
  );
}

async function ProfileTab({ userId, email }: { userId: string; email: string }) {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      fullName: true,
      birthYear: true,
      nativeLanguage: true,
      gender: true,
      avatarUrl: true,
      useGoogleAvatar: true,
    },
  });
  return (
    <ProfileForm
      email={email}
      name={u?.name ?? ""}
      fullName={u?.fullName ?? ""}
      birthYear={u?.birthYear ? String(u.birthYear) : ""}
      nativeLanguage={u?.nativeLanguage ?? DEFAULT_NATIVE_LANGUAGE}
      gender={u?.gender ?? ""}
      useGoogleAvatar={u?.useGoogleAvatar ?? true}
      googleAvatarUrl={u?.avatarUrl ?? null}
    />
  );
}

async function SettingsTab({ userId }: { userId: string }) {
  const u = await db.user.findUnique({ where: { id: userId }, select: { dailyGoal: true, pushReminders: true } });
  return (
    <Card>
      <StudySettingsForm dailyGoal={u?.dailyGoal ?? 20} pushReminders={u?.pushReminders ?? false} />
    </Card>
  );
}
