import type { Metadata } from "next";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("auth");
  return { title: t("login.metaTitle") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, expired } = await searchParams;
  const t = await getT("auth");
  const linkClass = "underline underline-offset-2 hover:text-accent";
  // "{terms}" và "{privacy}" trong câu được thay bằng liên kết, giữ đúng thứ tự của từng ngôn ngữ.
  const agree = t("login.agree")
    .split(/(\{terms\}|\{privacy\})/)
    .map((part, i) =>
      part === "{terms}" ? (
        <Link key={i} href="/terms" className={linkClass}>
          {t("login.terms")}
        </Link>
      ) : part === "{privacy}" ? (
        <Link key={i} href="/privacy" className={linkClass}>
          {t("login.privacy")}
        </Link>
      ) : (
        part
      ),
    );
  return (
    <>
      <h1 className="mb-1 text-xl font-bold">{t("login.title")}</h1>
      <p className="mb-6 text-sm text-ink-600">{t("login.subtitle")}</p>
      {expired === "1" && (
        <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          {t("login.expired")}
        </p>
      )}
      <GoogleSignInButton next={typeof next === "string" ? next : undefined} />
      <p className="mt-5 text-center text-sm text-ink-600">{t("login.firstTime")}</p>
      <p className="mt-3 text-center text-xs text-ink-500">{agree}</p>
    </>
  );
}
