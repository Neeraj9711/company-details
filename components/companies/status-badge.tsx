"use client";

import type { CompanyStatus } from "@/lib/api/types";
import { useLocale } from "@/components/locale-provider";

const STYLES: Record<CompanyStatus, string> = {
  new: "bg-sky-50 text-sky-800 ring-sky-200",
  researching: "bg-amber-50 text-amber-900 ring-amber-200",
  contacted: "bg-violet-50 text-violet-800 ring-violet-200",
  qualified: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export function StatusBadge({ status }: { status: CompanyStatus }) {
  const { messages } = useLocale();
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}>
      {messages.status[status]}
    </span>
  );
}
