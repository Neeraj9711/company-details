"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useLocale } from "@/components/locale-provider";
import { AuthRequestError, signupAccount, type IssuedToken } from "@/lib/auth/api";
import { withNext } from "@/lib/auth/paths";

export function SignUpForm() {
  const { messages } = useLocale();
  const searchParams = useSearchParams();
  const nameId = useId();
  const tokenId = useId();
  const errorId = useId();
  const tokenRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [empty, setEmpty] = useState(false);
  const [copied, setCopied] = useState(false);
  const next = searchParams.get("next");

  const signup = useMutation({
    mutationFn: signupAccount,
    onSuccess: () => {
      setCopied(false);
    },
  });
  const issued = signup.data;

  useEffect(() => {
    if (!issued) return;
    tokenRef.current?.focus();
    tokenRef.current?.select();
  }, [issued]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = name.trim();
    if (!value) {
      setEmpty(true);
      return;
    }
    signup.mutate(value);
  }

  async function copyToken(issued: IssuedToken) {
    try {
      await navigator.clipboard.writeText(issued.token);
      setCopied(true);
    } catch {
      tokenRef.current?.focus();
      tokenRef.current?.select();
    }
  }

  const rejected = signup.error instanceof AuthRequestError && signup.error.status === 422;
  const failed = signup.isError && !rejected;
  const showError = empty || rejected || failed;
  const errorMessage = empty || rejected ? messages.nameRequired : messages.authError;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">{messages.signUpTitle}</h1>
      <p className="mt-2 text-sm text-zinc-600">{messages.signUpHelp}</p>
      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-3">
        <label htmlFor={nameId} className="text-sm font-medium">
          {messages.nameLabel}
        </label>
        <input
          id={nameId}
          value={name}
          autoFocus
          autoComplete="name"
          aria-invalid={showError ? true : undefined}
          aria-describedby={showError ? errorId : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setEmpty(false);
            signup.reset();
          }}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
        {showError ? (
          <p id={errorId} role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={signup.isPending}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {signup.isPending ? messages.signingUp : messages.signUpSubmit}
        </button>
      </form>

      {issued ? (
        <section className="mt-8 rounded-md border border-zinc-200 bg-white p-4" aria-live="polite">
          <h2 className="text-sm font-semibold">{messages.tokenIssuedTitle}</h2>
          <p className="mt-1 text-sm text-zinc-600">{messages.tokenIssuedHelp}</p>
          <label htmlFor={tokenId} className="mt-3 block text-sm font-medium">
            {messages.tokenLabel}
          </label>
          <input
            ref={tokenRef}
            id={tokenId}
            readOnly
            value={issued.token}
            spellCheck={false}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyToken(issued)}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              {copied ? messages.copied : messages.copyToken}
            </button>
            <Link
              href={withNext("/sign-in", next)}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
            >
              {messages.goToLogin}
            </Link>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-sm text-zinc-600">
        {messages.hasToken}{" "}
        <Link href={withNext("/sign-in", next)} className="font-medium text-sky-800 underline">
          {messages.goToLogin}
        </Link>
      </p>
    </div>
  );
}
