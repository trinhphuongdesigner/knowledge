import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Be_Vietnam_Pro, Lexend } from "next/font/google";
import { I18nProvider } from "@/i18n/client";
import { OG_LOCALES } from "@/i18n/format";
import { getLocale, getMessages, getT } from "@/i18n/server";
import { BoardMount } from "@/components/board/BoardMount";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getT("layout")]);
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    applicationName: "Knowledge",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    openGraph: { type: "website", siteName: "Knowledge", locale: OG_LOCALES[locale], title, description },
    twitter: { card: "summary_large_image", title, description },
    appleWebApp: {
      capable: true,
      title: "Knowledge",
      statusBarStyle: "default",
    },
    icons: { apple: "/icons/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f7c66" },
    { media: "(prefers-color-scheme: dark)", color: "#14110d" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Chạy đồng bộ trước khi vẽ: áp theme đã lưu (localStorage, rồi cookie); "system" thì để CSS theo prefers-color-scheme. */
const THEME_SCRIPT = `(function(){try{var d=document.documentElement,t=null;try{t=localStorage.getItem("knowledge:theme")}catch(e){}if(t!=="light"&&t!=="dark"&&t!=="system"){var m=document.cookie.match(/(?:^|; )kn_theme=([^;]*)/);t=m?decodeURIComponent(m[1]):"system"}var k=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(t==="light"||t==="dark")d.setAttribute("data-theme",t);else d.removeAttribute("data-theme");d.classList.toggle("dark",k);d.style.colorScheme=k?"dark":"light"}catch(e){}})()`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  const saved = (await cookies()).get("kn_theme")?.value;
  const theme = saved === "light" || saved === "dark" ? saved : undefined;
  return (
    <html
      lang={locale}
      data-theme={theme}
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${lexend.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans text-ink-900">
        <I18nProvider locale={locale} messages={messages}>
          <OfflineBanner />
          <Header />
          {children}
          <Footer />
          <BoardMount />
          <ServiceWorkerRegister />
        </I18nProvider>
      </body>
    </html>
  );
}
