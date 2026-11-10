"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { CompaniesApiProvider } from "@/components/companies-api-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { clearSession } from "@/lib/auth/session";
import { setUnauthorizedHandler } from "@/lib/auth/unauthorized";
import type { Locale, Messages } from "@/lib/i18n/locale";
import { localeTag } from "@/lib/i18n/locale";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: true,
        staleTime: 0,
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function AppProviders({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const queryClient = getQueryClient();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = localeTag(locale);
  }, [locale]);

  useEffect(() => {
    return setUnauthorizedHandler(() => {
      clearSession();
      queryClient.clear();
      router.replace("/sign-in");
    });
  }, [queryClient, router]);

  return (
    <LocaleProvider locale={locale} messages={messages}>
      <QueryClientProvider client={queryClient}>
        <CompaniesApiProvider>
          <div lang={localeTag(locale)} className="flex min-h-full flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
          </div>
        </CompaniesApiProvider>
      </QueryClientProvider>
    </LocaleProvider>
  );
}
