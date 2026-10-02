import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Lexend } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Knowledge",
    locale: "vi_VN",
    title: "Knowledge — Học bằng flashcard",
    description: "Ôn tập IT và Tiếng Anh với flashcard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Knowledge — Học bằng flashcard",
    description: "Ôn tập IT và Tiếng Anh với flashcard.",
  },
  appleWebApp: {
    capable: true,
    title: "Knowledge",
    statusBarStyle: "default",
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0f7c66",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${lexend.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-ink-900">
        <Header />
        {children}
        <Footer />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
