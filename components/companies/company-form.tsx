"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState, type FormEvent } from "react";
import { useCompaniesClient } from "@/components/companies-api-provider";
import { useLocale } from "@/components/locale-provider";
import { isApiError } from "@/lib/api/client";
import { companyKeys, companyOptions, replaceCompanyInListCache } from "@/lib/api/queries";
import {
  COMPANY_STATUSES,
  isCompany,
  isRecord,
  type Company,
  type CompanyStatus,
} from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { fill } from "@/lib/i18n/fill";

type FieldErrors = {
  name?: string;
  form?: string;
};

export function CompanyForm({
  mode,
  company,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  company: Company | null;
  onClose: () => void;
  onSaved: (company: Company) => void;
}) {
  const { locale, messages } = useLocale();
  const client = useCompaniesClient();
  const queryClient = useQueryClient();
  const nameId = useId();
  const domainId = useId();
  const statusId = useId();
  const nameErrorId = useId();

  const [name, setName] = useState(company?.name ?? "");
  const [domain, setDomain] = useState(company?.domain ?? "");
  const [status, setStatus] = useState<CompanyStatus>(company?.status ?? "new");
  const [baseVersion, setBaseVersion] = useState(company?.version ?? 1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [conflict, setConflict] = useState<Company | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [reloading, setReloading] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: name.trim(),
        domain: domain.trim() || null,
        status,
      };
      if (mode === "create") return client.create(payload);
      if (!company) throw new Error("Missing company");
      return client.update(company.id, { if_version: baseVersion, ...payload });
    },
    onSuccess: (saved) => {
      setName(saved.name);
      setDomain(saved.domain ?? "");
      setStatus(saved.status);
      setBaseVersion(saved.version);
      setConflict(null);
      setConflictOpen(false);
      setErrors({});
      queryClient.setQueryData(companyKeys.detail(saved.id), saved);
      replaceCompanyInListCache(queryClient, saved);
      void queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      onSaved(saved);
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409 && mode === "edit") {
        const current = readConflictCompany(error.body);
        setConflictOpen(true);
        setConflict(current);
        if (current) {
          queryClient.setQueryData(companyKeys.detail(current.id), current);
          replaceCompanyInListCache(queryClient, current);
        }
        return;
      }
      if (isApiError(error) && error.status === 422) {
        setErrors(errorsFromValidation(error.body, messages.nameRequired, messages.validationSummary));
        return;
      }
      setErrors({ form: messages.saveError });
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (name.trim().length === 0) nextErrors.name = messages.nameRequired;
    setErrors(nextErrors);
    if (nextErrors.name) return;
    mutation.mutate();
  }

  async function reloadLatest() {
    if (!company) return;
    setReloading(true);
    try {
      const latest = await queryClient.fetchQuery({
        ...companyOptions(company.id, client),
        staleTime: 0,
      });
      setBaseVersion(latest.version);
      setConflict(null);
      setConflictOpen(false);
    } catch {
      setErrors({ form: messages.drawerError });
    } finally {
      setReloading(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {mode === "edit" && company ? (
        <p className="text-sm text-zinc-600">
          {messages.columnCreated}: {formatDate(company.created_at, locale)}
          <span className="mx-2 text-zinc-300">/</span>
          {fill(messages.editingVersion, { version: baseVersion })}
        </p>
      ) : null}

      {conflictOpen ? (
        <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <p className="font-medium">{messages.conflictTitle}</p>
          <p className="mt-1">{messages.conflictBody}</p>
          {conflict ? (
            <p className="mt-2">{fill(messages.serverNow, { name: conflict.name, version: conflict.version })}</p>
          ) : null}
          <button
            type="button"
            onClick={() => void reloadLatest()}
            disabled={reloading}
            className="mt-3 rounded-md bg-amber-900 px-3 py-1.5 text-sm text-white disabled:opacity-60"
          >
            {reloading ? messages.reloading : messages.reloadLatest}
          </button>
        </div>
      ) : null}

      {errors.form ? (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errors.form}
        </p>
      ) : null}

      <div>
        <label htmlFor={nameId} className="mb-1 block text-sm font-medium">
          {messages.nameLabel}
        </label>
        <input
          id={nameId}
          value={name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrorId : undefined}
          autoFocus
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
        {errors.name ? (
          <p id={nameErrorId} role="alert" className="mt-1 text-sm text-red-700">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={domainId} className="mb-1 block text-sm font-medium">
          {messages.domainLabel}
          <span className="ml-2 font-normal text-zinc-500">{messages.domainHint}</span>
        </label>
        <input
          id={domainId}
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        />
      </div>

      <div>
        <label htmlFor={statusId} className="mb-1 block text-sm font-medium">
          {messages.statusLabel}
        </label>
        <select
          id={statusId}
          value={status}
          onChange={(event) => {
            const next = COMPANY_STATUSES.find((item) => item === event.target.value);
            if (next) setStatus(next);
          }}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {COMPANY_STATUSES.map((item) => (
            <option key={item} value={item}>
              {messages.status[item]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          {messages.cancel}
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {mutation.isPending ? messages.saving : messages.save}
        </button>
      </div>
    </form>
  );
}

function readConflictCompany(body: unknown): Company | null {
  if (!isRecord(body)) return null;
  return isCompany(body.current) ? body.current : null;
}

function errorsFromValidation(body: unknown, nameMessage: string, summary: string): FieldErrors {
  if (!isRecord(body) || !Array.isArray(body.detail)) return { form: summary };
  const errors: FieldErrors = {};
  for (const item of body.detail) {
    if (!isRecord(item) || !Array.isArray(item.loc)) continue;
    if (item.loc[1] === "name") errors.name = nameMessage;
  }
  if (!errors.name) errors.form = summary;
  return errors;
}
