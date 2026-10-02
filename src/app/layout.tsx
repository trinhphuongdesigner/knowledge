import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Lexend } from "next/font/google";
import { Header } from "@/components/layout/Header";
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

export const metadata: Metadata = {
  title: "Knowledge — Học bằng flashcard",
  description: "Ôn tập IT và Tiếng Anh với flashcard.",
  applicationName: "Knowledge",
  appleWebApp: {
    capable: true,
    title: "Knowledge",
    statusBarStyle: "default",
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f7c66",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${lexend.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-ink-900">
        <Header />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
