"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { useLocale } from "@/components/locale-provider";
import { AuthRequestError, loginWithToken } from "@/lib/auth/api";
import { safeNextPath, withNext } from "@/lib/auth/paths";
import { setSession } from "@/lib/auth/session";

export function SignInForm() {
  const { messages } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenId = useId();
  const errorId = useId();
  const [token, setToken] = useState("");
  const [empty, setEmpty] = useState(false);
  const next = searchParams.get("next");

  const login = useMutation({
    mutationFn: loginWithToken,
    onSuccess: (_result, accessToken) => {
      setSession(accessToken);
      router.push(safeNextPath(next));
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = token.trim();
    if (!value) {
      setEmpty(true);
      return;
    }
    login.mutate(value);
  }

  const invalidToken = login.error instanceof AuthRequestError && login.error.status === 401;
  const failed = login.error instanceof AuthRequestError && !invalidToken;
  const showError = empty || invalidToken || failed;
  const errorMessage = empty
    ? messages.tokenRequired
    : invalidToken
      ? messages.tokenInvalid
      : messages.authError;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{messages.signInTitle}</h1>
      <p className="mt-2 text-sm text-zinc-600">{messages.signInHelp}</p>
      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-3">
        <label htmlFor={tokenId} className="text-sm font-medium">
          {messages.tokenLabel}
        </label>
        <input
          id={tokenId}
          value={token}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          aria-invalid={showError ? true : undefined}
          aria-describedby={showError ? errorId : undefined}
          onChange={(event) => {
            setToken(event.target.value);
            setEmpty(false);
            login.reset();
          }}
          className="rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
        {showError ? (
          <p id={errorId} role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={login.isPending}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {login.isPending ? messages.loggingIn : messages.loginSubmit}
        </button>
      </form>
      <p className="mt-6 text-sm text-zinc-600">
        {messages.noAccount}{" "}
        <Link href={withNext("/sign-up", next)} className="font-medium text-sky-800 underline">
          {messages.goToSignUp}
        </Link>
      </p>
    </div>
  );
}
