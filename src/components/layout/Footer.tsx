import Link from "next/link";
import { Container } from "./Container";
import { HideOnAuthRoutes } from "./HideOnAuthRoutes";

const SITE_LINKS = [
  { label: "Giới thiệu", href: "/about" },
  { label: "Điều khoản", href: "/terms" },
  { label: "Quyền riêng tư", href: "/privacy" },
];

const ECOSYSTEM_LINKS = [
  { label: "Resume", href: "https://lancer-trinh.vercel.app/" },
  { label: "Gutan Embroidery", href: "https://gutanembroidery.com/" },
  { label: "Gutan Novels", href: "https://novels.gutanembroidery.com/" },
  { label: "Bóng Đá Tú Nhi", href: "http://bongdatunhi.vn/" },
];

export function Footer() {
  return (
    <HideOnAuthRoutes>
      <footer className="mt-auto border-t border-ink-200/80 bg-paper/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <Container className="flex min-h-16 flex-wrap items-center justify-center gap-x-5 py-1 text-xs text-ink-600 sm:justify-between sm:text-sm">
          <p className="hidden sm:block">© {new Date().getFullYear()} Knowledge · Trinh Phuong</p>
          <nav aria-label="Hệ sinh thái của Trinh Phuong">
            <ul className="flex flex-wrap items-center justify-center gap-x-4">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-9 items-center rounded-lg hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {ECOSYSTEM_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-9 items-center rounded-lg hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </footer>
    </HideOnAuthRoutes>
  );
}
