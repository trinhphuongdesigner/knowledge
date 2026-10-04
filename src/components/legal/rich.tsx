import Link from "next/link";
import type { ReactNode } from "react";

/** Link targets for `[label](key)` in legal strings. */
export const LEGAL_LINKS: Record<string, string> = {
  mail: "mailto:trinhphuong.dev@gmail.com",
  account: "/account",
  privacyRights: "/privacy#rights",
  privacy: "/privacy",
  googleConnections: "https://myaccount.google.com/connections",
  googleApiPolicy: "https://developers.google.com/terms/api-services-user-data-policy",
};

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([\w-]+\)|\{\w+\})/g;

/**
 * Renders a message string with minimal markup (no HTML), see en/legal.ts for the convention.
 */
export function Rich({ text }: { text: string }): ReactNode {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part === "{mail}") return <a key={i} href={LEGAL_LINKS.mail}>{LEGAL_LINKS.mail.slice(7)}</a>;
    const m = /^\[([^\]]+)\]\(([\w-]+)\)$/.exec(part);
    if (m) {
      const href = LEGAL_LINKS[m[2]] ?? "#";
      if (href.startsWith("/")) return <Link key={i} href={href}>{m[1]}</Link>;
      return <a key={i} href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{m[1]}</a>;
    }
    return part;
  });
}
