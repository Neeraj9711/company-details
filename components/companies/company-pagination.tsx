"use client";

import { useLocale } from "@/components/locale-provider";
import { fill } from "@/lib/i18n/fill";

export function CompanyPagination({
  offset,
  limit,
  total,
  onPage,
}: {
  offset: number;
  limit: number;
  total: number;
  onPage: (offset: number) => void;
}) {
  const { messages } = useLocale();
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  const previous = Math.max(0, offset - limit);
  const next = offset + limit;

  return (
    <nav aria-label={messages.paginationLabel} className="flex items-center justify-between gap-3">
      <p className="text-sm text-zinc-600">{fill(messages.pagination, { from, to, total })}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPage(previous)}
          disabled={offset === 0}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {messages.previousPage}
        </button>
        <button
          type="button"
          onClick={() => onPage(next)}
          disabled={next >= total}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {messages.nextPage}
        </button>
      </div>
    </nav>
  );
}
