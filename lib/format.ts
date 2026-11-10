import type { Locale } from "@/lib/i18n/locale";
import { localeTag } from "@/lib/i18n/locale";

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(localeTag(locale), { dateStyle: "medium" }).format(date);
}
