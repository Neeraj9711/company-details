"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { CompanyListQuery, CompanySort } from "@/lib/api/types";
import { parseCompanyUrl, serializeCompanyUrl, type CompanyUrlState } from "@/lib/companies/url-state";

export function useCompanyUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const state = useMemo(() => parseCompanyUrl(searchParams), [searchParams]);

  const replace = useCallback(
    (next: CompanyUrlState) => {
      const href = `${pathname}${serializeCompanyUrl(next)}`;
      router.replace(href, { scroll: false });
    },
    [pathname, router],
  );

  const updateList = useCallback(
    (patch: Partial<CompanyListQuery>, options?: { resetOffset?: boolean }) => {
      const list: CompanyListQuery = {
        ...state.list,
        ...patch,
        offset: options?.resetOffset ? 0 : (patch.offset ?? state.list.offset),
      };
      replace({ list, company: state.company });
    },
    [replace, state],
  );

  const openCompany = useCallback(
    (companyId: string) => replace({ list: state.list, company: companyId }),
    [replace, state.list],
  );

  const closeCompany = useCallback(
    () => replace({ list: state.list, company: null }),
    [replace, state.list],
  );

  const setSort = useCallback(
    (column: "name" | "created_at") => {
      const sort = nextSort(state.list.sort, column);
      updateList({ sort }, { resetOffset: true });
    },
    [state.list.sort, updateList],
  );

  return { ...state, updateList, openCompany, closeCompany, setSort };
}

function nextSort(current: CompanySort, column: "name" | "created_at"): CompanySort {
  if (column === "name") return current === "name" ? "-name" : "name";
  return current === "created_at" ? "-created_at" : "created_at";
}
