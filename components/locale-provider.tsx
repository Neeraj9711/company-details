"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale, Messages } from "@/lib/i18n/locale";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={{ locale, messages }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}
