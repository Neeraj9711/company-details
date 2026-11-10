"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useCompaniesClient } from "@/components/companies-api-provider";
import { CompanyDrawer } from "@/components/companies/company-drawer";
import { CompanyFilters } from "@/components/companies/company-filters";
import { CompanyPagination } from "@/components/companies/company-pagination";
import { CompanyTable } from "@/components/companies/company-table";
import { CompaniesFallback } from "@/components/companies/companies-fallback";
import { useCompanyUrlState } from "@/components/companies/use-company-url-state";
import { useLocale } from "@/components/locale-provider";
import { listCompaniesOptions } from "@/lib/api/queries";
import type { CompanyStatus } from "@/lib/api/types";
import { getAccessToken } from "@/lib/auth/session";

function subscribeToSession() {
  return () => undefined;
}

function useSessionState(): "server" | "guest" | "signed-in" {
  return useSyncExternalStore(
    subscribeToSession,
    () => (getAccessToken() ? "signed-in" : "guest"),
    () => "server",
  );
}

export function CompaniesScreen() {
  const router = useRouter();
  const { messages } = useLocale();
  const client = useCompaniesClient();
  const { list, company, updateList, openCompany, closeCompany, setSort } = useCompanyUrlState();
  const session = useSessionState();

  useEffect(() => {
    if (session === "guest") router.replace("/sign-in");
  }, [router, session]);

  const listQuery = useQuery({
    ...listCompaniesOptions(list, client),
    enabled: session === "signed-in",
  });
  const onSearch = useCallback(
    (value: string) => updateList({ q: value }, { resetOffset: true }),
    [updateList],
  );
  const onStatus = useCallback(
    (value: CompanyStatus | null) => updateList({ status: value }, { resetOffset: true }),
    [updateList],
  );

  if (session !== "signed-in") return <CompaniesFallback />;

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const hasActiveFilters = list.q.length > 0 || list.status !== null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{messages.companiesTitle}</h1>
          <p className="mt-1 text-sm text-zinc-600">{messages.companiesIntro}</p>
        </div>
        <button
          type="button"
          onClick={() => openCompany("new")}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          {messages.newCompany}
        </button>
      </div>

      <CompanyFilters
        q={list.q}
        status={list.status}
        onSearch={onSearch}
        onStatus={onStatus}
      />

      {listQuery.isError && listQuery.data ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <p>{messages.listError}</p>
          <button type="button" onClick={() => void listQuery.refetch()} className="font-medium underline">
            {messages.retry}
          </button>
        </div>
      ) : null}

      <CompanyTable
        companies={items}
        selectedId={company}
        sort={list.sort}
        isPending={listQuery.isPending}
        isError={listQuery.isError}
        isFetching={listQuery.isFetching}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => void listQuery.refetch()}
        onOpen={openCompany}
        onSort={setSort}
      />

      <CompanyPagination
        offset={list.offset}
        limit={list.limit}
        total={total}
        onPage={(offset) => updateList({ offset })}
      />

      {company ? (
        <CompanyDrawer
          key={company}
          companyParam={company}
          onClose={closeCompany}
          onSaved={openCompany}
        />
      ) : null}
    </div>
  );
}
