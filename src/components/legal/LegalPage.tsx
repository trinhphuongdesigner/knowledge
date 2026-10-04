import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui";
import { Container } from "@/components/layout/Container";
import type { Locale } from "@/i18n/config";
import { formatDate } from "@/i18n/format";
import type { TFunction } from "@/i18n/server";
import { Rich } from "./rich";

/** Ngày hiệu lực của bản hiện tại — cập nhật mỗi khi sửa nội dung. */
export const LEGAL_UPDATED = "2026-10-03";

/** Mục nội dung: `title` + các khoá còn lại theo thứ tự — chuỗi = đoạn văn, object = danh sách gạch đầu dòng. */
export type LegalSectionMessages = { title: string } & Record<string, string | Record<string, string>>;

function SectionBody({ section }: { section: LegalSectionMessages }): ReactNode {
  return Object.entries(section)
    .filter(([k]) => k !== "title")
    .map(([k, v]) =>
      typeof v === "string" ? (
        <p key={k}>
          <Rich text={v} />
        </p>
      ) : (
        <ul key={k}>
          {Object.entries(v).map(([ik, iv]) => (
            <li key={ik}>
              <Rich text={iv} />
            </li>
          ))}
        </ul>
      ),
    );
}

/** Khung chung cho /privacy và /terms: tiêu đề, ngày cập nhật, mục lục, các mục nội dung. */
export function LegalPage({
  locale,
  t,
  title,
  intro,
  sections,
}: {
  locale: Locale;
  t: TFunction<"legal">;
  title: string;
  /** Các đoạn mở đầu, cách nhau bằng "\n". */
  intro: string;
  sections: Record<string, LegalSectionMessages>;
}) {
  const list = Object.entries(sections);
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Breadcrumbs items={[{ label: t("common.home"), href: "/" }, { label: title }]} />
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">
          {t("common.updated", { date: formatDate(locale, LEGAL_UPDATED, { dateStyle: "long", timeZone: "UTC" }) })}
        </p>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-700">
          {intro.split("\n").map((p) => (
            <p key={p}>
              <Rich text={p} />
            </p>
          ))}
        </div>
      </header>

      <nav aria-label={t("common.toc")} className="mb-10 rounded-2xl border border-ink-200 bg-paper p-4 sm:p-5">
        <p className="mb-2 text-sm font-semibold text-ink-900">{t("common.toc")}</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-600">
          {list.map(([id, s]) => (
            <li key={id}>
              <a href={`#${id}`} className="hover:text-accent">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {list.map(([id, s], i) => (
          <section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
            <h2 id={`${id}-title`} className="mb-3 text-xl font-semibold text-ink-900">
              {i + 1}. {s.title}
            </h2>
            <div className="space-y-3 text-[15px] leading-relaxed text-ink-700 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-ink-900 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
              <SectionBody section={s} />
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 border-t border-ink-200 pt-6 text-sm text-ink-600">
        <p>
          {t("common.seeAlso")}{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            {t("common.privacy")}
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="text-accent hover:underline">
            {t("common.terms")}
          </Link>{" "}
          ·{" "}
          <Link href="/about" className="text-accent hover:underline">
            {t("common.about")}
          </Link>
        </p>
      </footer>
    </Container>
  );
}
