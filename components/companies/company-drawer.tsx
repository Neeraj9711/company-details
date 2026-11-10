"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useCompaniesClient } from "@/components/companies-api-provider";
import { CompanyForm } from "@/components/companies/company-form";
import { useLocale } from "@/components/locale-provider";
import { isApiError } from "@/lib/api/client";
import { companyOptions } from "@/lib/api/queries";

export function CompanyDrawer({
  companyParam,
  onClose,
  onSaved,
}: {
  companyParam: string;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { messages } = useLocale();
  const isCreate = companyParam === "new";
  const title = isCreate ? messages.createTitle : messages.editTitle;
  const titleId = isCreate ? "company-drawer-create-title" : "company-drawer-edit-title";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="text-zinc-900"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={messages.close}
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
          >
            {messages.close}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isCreate ? (
            <CompanyForm mode="create" company={null} onClose={onClose} onSaved={(saved) => onSaved(saved.id)} />
          ) : (
            <CompanyDetails id={companyParam} onClose={onClose} onSaved={onSaved} />
          )}
        </div>
      </div>
    </dialog>
  );
}

function CompanyDetails({
  id,
  onClose,
  onSaved,
}: {
  id: string;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { messages } = useLocale();
  const client = useCompaniesClient();
  const query = useQuery(companyOptions(id, client));

  if (query.isPending) {
    return <p className="text-sm text-zinc-600">{messages.drawerLoading}</p>;
  }

  if (query.isError) {
    const missing = isApiError(query.error) && query.error.status === 404;
    return (
      <div role="alert" className="text-sm">
        <p className="text-red-700">{missing ? messages.drawerMissing : messages.drawerError}</p>
        {missing ? null : (
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-3 rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white"
          >
            {messages.retry}
          </button>
        )}
      </div>
    );
  }

  return (
    <CompanyForm
      key={query.data.id}
      mode="edit"
      company={query.data}
      onClose={onClose}
      onSaved={(saved) => onSaved(saved.id)}
    />
  );
}
