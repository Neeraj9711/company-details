"use client";

import { useEffect, useState } from "react";
import { COMPANY_STATUSES, type CompanySort, type CompanyStatus } from "@/lib/api/types";
import { useLocale } from "@/components/locale-provider";

const SEARCH_DEBOUNCE_MS = 300;

export function CompanyFilters({
  q,
  status,
  onSearch,
  onStatus,
}: {
  q: string;
  status: CompanyStatus | null;
  onSearch: (value: string) => void;
  onStatus: (value: CompanyStatus | null) => void;
}) {
  const { messages } = useLocale();
  const [draft, setDraft] = useState(q);
  const [previousQ, setPreviousQ] = useState(q);
  const [pushedQ, setPushedQ] = useState(q);

  if (q !== previousQ) {
    setPreviousQ(q);
    if (q !== pushedQ) {
      setDraft(q);
      setPushedQ(q);
    }
  }

  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === q) return;
    const timeout = window.setTimeout(() => {
      setPushedQ(trimmed);
      onSearch(trimmed);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [draft, onSearch, q]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="company-search" className="mb-1 block text-sm font-medium text-zinc-700">
          {messages.searchLabel}
        </label>
        <input
          id="company-search"
          type="search"
          value={draft}
          placeholder={messages.searchPlaceholder}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
      </div>
      <div>
        <label htmlFor="company-status" className="mb-1 block text-sm font-medium text-zinc-700">
          {messages.statusLabel}
        </label>
        <select
          id="company-status"
          value={status ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onStatus(COMPANY_STATUSES.find((item) => item === value) ?? null);
          }}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:w-52"
        >
          <option value="">{messages.statusAll}</option>
          {COMPANY_STATUSES.map((item) => (
            <option key={item} value={item}>
              {messages.status[item]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function sortDirection(current: CompanySort, column: "name" | "created_at") {
  if (column === "name") {
    if (current === "name") return "ascending" as const;
    if (current === "-name") return "descending" as const;
  }
  if (current === "created_at") return "ascending" as const;
  if (current === "-created_at") return "descending" as const;
  return "none" as const;
}
