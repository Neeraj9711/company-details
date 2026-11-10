"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getSharedCompaniesClient, type CompaniesClient } from "@/lib/api/client";

const CompaniesApiContext = createContext<CompaniesClient | null>(null);

export function CompaniesApiProvider({
  client,
  children,
}: {
  client?: CompaniesClient;
  children: ReactNode;
}) {
  const value = useMemo(() => client ?? getSharedCompaniesClient(), [client]);
  return <CompaniesApiContext.Provider value={value}>{children}</CompaniesApiContext.Provider>;
}

export function useCompaniesClient(): CompaniesClient {
  const client = useContext(CompaniesApiContext);
  if (!client) throw new Error("CompaniesApiProvider is missing");
  return client;
}
