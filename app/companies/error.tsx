"use client";

import { useLocale } from "@/components/locale-provider";

export default function CompaniesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { messages } = useLocale();

  return (
    <div role="alert" className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-xl font-semibold">{messages.routeErrorTitle}</h1>
      <p className="mt-2 text-sm text-zinc-600">{messages.routeErrorBody}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
      >
        {messages.tryAgain}
      </button>
    </div>
  );
}
