import { cookies } from "next/headers";
import { Suspense } from "react";
import { AppProviders } from "@/components/app-providers";
import { CompaniesFallback } from "@/components/companies/companies-fallback";
import { getMessages } from "@/lib/i18n/dictionaries";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/locale";

export function LocalizedApp({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<CompaniesFallback />}>
      <LocalizedContent>{children}</LocalizedContent>
    </Suspense>
  );
}

async function LocalizedContent({ children }: { children: React.ReactNode }) {
  const locale = resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return (
    <AppProviders locale={locale} messages={getMessages(locale)}>
      {children}
    </AppProviders>
  );
}
