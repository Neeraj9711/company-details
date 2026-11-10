import { PAGE_LIMIT, type CompanyListQuery } from "@/lib/api/types";
import {
  parseOffset,
  parseSortParam,
  parseStatusParam,
} from "@/lib/companies/parse";

export type CompanyUrlState = {
  list: CompanyListQuery;
  company: string | null;
};

type SearchParamReader = {
  get(name: string): string | null;
};

export function parseCompanyUrl(searchParams: SearchParamReader): CompanyUrlState {
  const company = searchParams.get("company");
  return {
    list: {
      limit: PAGE_LIMIT,
      offset: parseOffset(searchParams.get("offset")),
      q: (searchParams.get("q") ?? "").trim(),
      status: parseStatusParam(searchParams.get("status")),
      sort: parseSortParam(searchParams.get("sort")),
    },
    company: company && company.length > 0 ? company : null,
  };
}

export function serializeCompanyUrl(state: CompanyUrlState): string {
  const params = new URLSearchParams();
  if (state.list.q) params.set("q", state.list.q);
  if (state.list.status) params.set("status", state.list.status);
  if (state.list.sort !== "-created_at") params.set("sort", state.list.sort);
  if (state.list.offset > 0) params.set("offset", String(state.list.offset));
  if (state.company) params.set("company", state.company);
  const query = params.toString();
  return query ? `?${query}` : "";
}
