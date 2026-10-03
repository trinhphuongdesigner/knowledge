import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui";
import { Container } from "@/components/layout/Container";

/** Email liên hệ về quyền riêng tư / điều khoản (cũng là tài khoản quản trị). */
export const LEGAL_CONTACT_EMAIL = "trinhphuong.dev@gmail.com";
/** Ngày hiệu lực của bản hiện tại — cập nhật mỗi khi sửa nội dung. */
export const LEGAL_UPDATED = "03/10/2026";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Khung chung cho /privacy và /terms: tiêu đề, ngày cập nhật, mục lục, các mục nội dung. */
export function LegalPage({ title, intro, sections }: { title: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: title }]} />
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">Cập nhật lần cuối: {LEGAL_UPDATED}</p>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-ink-700">{intro}</div>
      </header>

      <nav aria-label="Mục lục" className="mb-10 rounded-2xl border border-ink-200 bg-paper p-4 sm:p-5">
        <p className="mb-2 text-sm font-semibold text-ink-900">Mục lục</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-600">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="hover:text-accent">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24">
            <h2 id={`${s.id}-title`} className="mb-3 text-xl font-semibold text-ink-900">
              {i + 1}. {s.title}
            </h2>
            <div className="space-y-3 text-[15px] leading-relaxed text-ink-700 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-ink-900 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 border-t border-ink-200 pt-6 text-sm text-ink-600">
        <p>
          Xem thêm:{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Chính sách quyền riêng tư
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="text-accent hover:underline">
            Điều khoản sử dụng
          </Link>{" "}
          ·{" "}
          <Link href="/about" className="text-accent hover:underline">
            Giới thiệu
          </Link>
        </p>
      </footer>
    </Container>
  );
}
