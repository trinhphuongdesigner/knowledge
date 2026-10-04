"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Messages, Namespace } from "./messages/types";
import { createT, type TFunction } from "./translate";

type Ctx = { locale: Locale; messages: Messages };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useCtx(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("I18nProvider is missing");
  return ctx;
}

export function useLocale(): Locale {
  return useCtx().locale;
}

/** Trong Client Component: `const t = useT("sets"); t("title")`. */
export function useT<N extends Namespace>(namespace: N): TFunction<N> {
  const { locale, messages } = useCtx();
  return useMemo(() => createT(locale, messages, namespace), [locale, messages, namespace]);
}
