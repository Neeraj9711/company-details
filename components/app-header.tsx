"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { useLocale } from "@/components/locale-provider";
import { clearSession } from "@/lib/auth/session";

export function AppHeader() {
  const { messages } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const onAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  function signOut() {
    clearSession();
    queryClient.clear();
    router.replace("/sign-in");
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <p className="text-sm font-semibold tracking-tight">{messages.appTitle}</p>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {onAuthPage ? null : (
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50"
            >
              {messages.signOut}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
