import "server-only";
import type { Locale, Messages } from "@/lib/i18n/locale";
import { en } from "@/lib/i18n/messages/en";
import { nl } from "@/lib/i18n/messages/nl";

const dictionaries: Record<Locale, Messages> = { en, nl };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}
