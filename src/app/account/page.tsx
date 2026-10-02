import type { Metadata } from "next";
import { AccountTabs, type AccountTab } from "@/components/account/AccountTabs";
import { PasswordForm } from "@/components/account/PasswordForm";
import { StudyHistory } from "@/components/account/StudyHistory";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/auth/dal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản lý tài khoản — Knowledge" };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await requireUser();
  const { tab } = await searchParams;
  const raw = Array.isArray(tab) ? tab[0] : tab;
  const active: AccountTab = raw === "password" || raw === "profile" ? raw : "history";

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Quản lý tài khoản</h1>
      <AccountTabs active={active} />
      {active === "history" ? (
        <StudyHistory userId={user.id} />
      ) : (
        <Card>{active === "profile" ? <ProfileForm name={user.name} email={user.email} /> : <PasswordForm />}</Card>
      )}
    </Container>
  );
}
