import {
  BookOpen,
  CalendarCheck,
  Copy,
  FileUp,
  Gamepad2,
  Languages,
  Library,
  Share2,
  Sparkles,
  WifiOff,
} from "lucide-react";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Container } from "@/components/layout/Container";
import { ButtonLink, Card, Breadcrumbs } from "@/components/ui";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/dal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("layout");
  return { title: t("about.metaTitle"), description: t("about.metaDescription") };
}

const FEATURES = [
  { icon: BookOpen, id: "cards" },
  { icon: CalendarCheck, id: "srs" },
  { icon: Gamepad2, id: "modes" },
  { icon: Languages, id: "vocab" },
  { icon: FileUp, id: "importExport" },
  { icon: Library, id: "library" },
  { icon: Copy, id: "saveCopy" },
  { icon: Share2, id: "share" },
  { icon: WifiOff, id: "offline" },
] as const;

const STEPS = ["create", "study", "review"] as const;

export default async function AboutPage() {
  const [user, t, tc] = await Promise.all([getCurrentUser(), getT("layout"), getT("common")]);
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: tc("home"), href: "/" }, { label: t("about.badge") }]} />
      <section className="mb-10 max-w-2xl sm:mb-14">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-accent-strong">
          <Sparkles className="size-3.5" aria-hidden />
          {t("about.badge")}
        </p>
        <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">{t("about.heroTitle")}</h1>
        <p className="mt-3 text-base text-ink-600">
          {t("about.heroBody")}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {user ? (
            <>
              <ButtonLink href="/">{t("about.ctaHome")}</ButtonLink>
              <ButtonLink href="/library" variant="secondary">
                {t("about.ctaLibrary")}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/login">{t("about.ctaStart")}</ButtonLink>
              <ButtonLink href="/login" variant="secondary">
                {t("about.ctaLogin")}
              </ButtonLink>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="features-title" className="mb-12">
        <h2 id="features-title" className="mb-5 text-xl font-semibold text-ink-900">
          {t("about.featuresTitle")}
        </h2>
        <ul className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, id }, i) => (
            <li key={id} style={{ "--i": i } as CSSProperties}>
              <Card className="h-full">
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-accent-strong">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-base font-semibold text-ink-900">{t(`about.features.${id}.title`)}</h3>
                <p className="mt-1 text-sm text-ink-600">{t(`about.features.${id}.body`)}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-title">
        <h2 id="steps-title" className="mb-5 text-xl font-semibold text-ink-900">
          {t("about.stepsTitle")}
        </h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((id, i) => (
            <li key={id}>
              <Card className="h-full">
                <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-ink-900">{t(`about.steps.${id}.title`)}</h3>
                <p className="mt-1 text-sm text-ink-600">{t(`about.steps.${id}.body`)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}
