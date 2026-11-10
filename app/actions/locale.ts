"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/locale";

export async function setLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
  });
}
