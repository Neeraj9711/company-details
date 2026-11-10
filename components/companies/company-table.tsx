"use client";

import type { Company, CompanySort } from "@/lib/api/types";
import { sortDirection } from "@/components/companies/company-filters";
import { StatusBadge } from "@/components/companies/status-badge";
import { useLocale } from "@/components/locale-provider";
import { formatDate } from "@/lib/format";

export function CompanyTable({
  companies,
  selectedId,
  sort,
  isPending,
  isError,
  isFetching,
  hasActiveFilters,
  onRetry,
  onOpen,
  onSort,
}: {
  companies: Company[];
  selectedId: string | null;
  sort: CompanySort;
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onOpen: (id: string) => void;
  onSort: (column: "name" | "created_at") => void;
}) {
  const { locale, messages } = useLocale();
  const showEmpty = !isPending && !isError && companies.length === 0;

  return (
    <div className={`overflow-hidden rounded-lg border border-zinc-200 bg-white ${isFetching ? "opacity-80" : ""}`}>
      <table className="w-full border-collapse text-left text-sm" aria-busy={isFetching}>
        <caption className="sr-only">{messages.companiesTitle}</caption>
        <thead className="bg-zinc-50 text-zinc-600">
          <tr>
            <SortHeader
              label={messages.columnName}
              direction={sortDirection(sort, "name")}
              onClick={() => onSort("name")}
            />
            <th scope="col" className="px-3 py-2 font-medium">
              {messages.columnDomain}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {messages.columnStatus}
            </th>
            <SortHeader
              label={messages.columnCreated}
              direction={sortDirection(sort, "created_at")}
              onClick={() => onSort("created_at")}
            />
          </tr>
        </thead>
        <tbody>
          {isPending ? <SkeletonRows label={messages.loading} /> : null}
          {!isPending && isError && companies.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-10 text-center">
                <p role="alert" className="text-sm text-red-700">
                  {messages.listError}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-3 rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white"
                >
                  {messages.retry}
                </button>
              </td>
            </tr>
          ) : null}
          {showEmpty ? (
            <tr>
              <td colSpan={4} className="px-3 py-10 text-center">
                <p className="font-medium text-zinc-900">
                  {hasActiveFilters ? messages.emptyFilteredTitle : messages.emptyTitle}
                </p>
                <p className="mt-1 text-zinc-600">
                  {hasActiveFilters ? messages.emptyFilteredBody : messages.emptyBody}
                </p>
              </td>
            </tr>
          ) : null}
          {!isPending && companies.length > 0
            ? companies.map((company) => {
                const selected = company.id === selectedId;
                return (
                  <tr
                    key={company.id}
                    tabIndex={0}
                    aria-selected={selected}
                    onClick={() => onOpen(company.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpen(company.id);
                      }
                    }}
                    className={`cursor-pointer border-t border-zinc-100 outline-none hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 ${
                      selected ? "bg-sky-50" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-zinc-900">{company.name}</td>
                    <td className="px-3 py-2 text-zinc-700">
                      {company.domain ?? <span className="text-zinc-400">{messages.emptyDomain}</span>}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-3 py-2 text-zinc-700">{formatDate(company.created_at, locale)}</td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "ascending" | "descending" | "none";
  onClick: () => void;
}) {
  return (
    <th scope="col" aria-sort={direction} className="px-3 py-2 font-medium">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        {label}
        <span aria-hidden="true" className="text-xs text-zinc-400">
          {direction === "ascending" ? "↑" : direction === "descending" ? "↓" : "↕"}
        </span>
      </button>
    </th>
  );
}

function SkeletonRows({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={4} className="px-3 py-6">
        <p className="sr-only">{label}</p>
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-8 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      </td>
    </tr>
  );
}
