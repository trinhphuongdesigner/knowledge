import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/dal";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { loadMessages } from "./messages";
import type { Messages, Namespace } from "./messages/types";
import { createT, type TFunction } from "./translate";

export type { TFunction } from "./translate";

/** Locale của request: user.uiLanguage → cookie kn_locale → en. Cache theo request. */
export const getLocale = cache(async (): Promise<Locale> => {
  const user = await getCurrentUser();
  if (user?.uiLanguage) return resolveLocale({ user });
  return resolveLocale({ cookie: (await cookies()).get(LOCALE_COOKIE)?.value });
});

export const getMessages = cache(async (): Promise<Messages> => loadMessages(await getLocale()));

/** Dùng trong Server Component / action / route: `const t = await getT("sets")`. */
export async function getT<N extends Namespace>(namespace: N): Promise<TFunction<N>> {
  return createT(await getLocale(), await getMessages(), namespace);
}

/** Dịch cho một locale cụ thể (vd. gửi thông báo cho người khác theo uiLanguage của họ). */
export async function getTFor<N extends Namespace>(locale: Locale, namespace: N): Promise<TFunction<N>> {
  return createT(locale, await loadMessages(locale), namespace);
}

/** Ghi cookie ngôn ngữ (1 năm) — chỉ gọi được trong Server Action / Route Handler. */
export async function setLocaleCookie(locale: Locale): Promise<void> {
  (await cookies()).set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}
