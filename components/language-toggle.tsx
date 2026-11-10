"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/actions/locale";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n/locale";

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "nl", label: "NL" },
  { locale: "en", label: "EN" },
];

export function LanguageToggle() {
  const { locale, messages } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div role="group" aria-label={messages.languageLabel} className="flex rounded-md border border-zinc-300">
      {OPTIONS.map((option) => {
        const selected = option.locale === locale;
        return (
          <button
            key={option.locale}
            type="button"
            aria-pressed={selected}
            disabled={pending}
            onClick={() => choose(option.locale)}
            className={`px-2.5 py-1 text-sm font-medium ${
              selected ? "bg-zinc-900 text-white" : "bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
