import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { CompaniesApiProvider } from "@/components/companies-api-provider";
import { LocaleProvider } from "@/components/locale-provider";
import type { CompaniesClient } from "@/lib/api/client";
import { en } from "@/lib/i18n/messages/en";

export function renderWithProviders(ui: ReactNode, client: CompaniesClient): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <LocaleProvider locale="en" messages={en}>
      <QueryClientProvider client={queryClient}>
        <CompaniesApiProvider client={client}>{ui}</CompaniesApiProvider>
      </QueryClientProvider>
    </LocaleProvider>,
  );
}
