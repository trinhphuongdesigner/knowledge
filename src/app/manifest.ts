import type { MetadataRoute } from "next";
import { getLocale, getT } from "@/i18n/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [t, locale] = await Promise.all([getT("layout"), getLocale()]);
  return {
    name: t("title"),
    short_name: "Knowledge",
    description: t("description"),
    lang: locale,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fdfbf6",
    theme_color: "#0f7c66",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
