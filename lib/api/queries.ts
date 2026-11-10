import {
  keepPreviousData,
  queryOptions,
  type QueryClient,
} from "@tanstack/react-query";
import {
  getSharedCompaniesClient,
  type CompaniesClient,
} from "@/lib/api/client";
import type { Company, CompanyListQuery, CompanyListResponse } from "@/lib/api/types";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (params: CompanyListQuery) => [...companyKeys.lists(), params] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

export function listCompaniesOptions(
  params: CompanyListQuery,
  client: CompaniesClient = getSharedCompaniesClient(),
) {
  return queryOptions({
    queryKey: companyKeys.list(params),
    queryFn: ({ signal }) => client.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function companyOptions(id: string, client: CompaniesClient = getSharedCompaniesClient()) {
  return queryOptions({
    queryKey: companyKeys.detail(id),
    queryFn: ({ signal }) => client.get(id, signal),
  });
}

export function replaceCompanyInListCache(queryClient: QueryClient, company: Company): void {
  queryClient.setQueriesData<CompanyListResponse>({ queryKey: companyKeys.lists() }, (current) => {
    if (!current) return current;
    return {
      ...current,
      items: current.items.map((item) => (item.id === company.id ? company : item)),
    };
  });
}
