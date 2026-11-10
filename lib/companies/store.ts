import type {
  Company,
  CompanyListQuery,
  CompanyListResponse,
  CreateCompanyInput,
  UpdateCompanyInput,
} from "@/lib/api/types";
import { createSeedCompanies } from "@/lib/companies/seed";

export type UpdateFailure =
  | { type: "not_found" }
  | { type: "conflict"; current: Company };

export type UpdateResult =
  | { ok: true; value: Company }
  | { ok: false; error: UpdateFailure };

let companies = createSeedCompanies();

export function resetCompanyStore(): void {
  companies = createSeedCompanies();
}

export function listCompanies(query: CompanyListQuery): CompanyListResponse {
  const needle = query.q.toLowerCase();
  const filtered = companies.filter((company) => {
    const matchesQuery =
      needle.length === 0 ||
      company.name.toLowerCase().includes(needle) ||
      (company.domain?.toLowerCase().includes(needle) ?? false);
    const matchesStatus = query.status === null || company.status === query.status;
    return matchesQuery && matchesStatus;
  });

  const sorted = [...filtered].sort((left, right) => {
    const direction = query.sort.startsWith("-") ? -1 : 1;
    const field = query.sort.replace(/^-/, "");
    const primary =
      field === "name"
        ? left.name.localeCompare(right.name, "en", { sensitivity: "base" })
        : left.created_at.localeCompare(right.created_at);
    if (primary !== 0) return primary * direction;
    return left.id.localeCompare(right.id);
  });

  return {
    items: sorted.slice(query.offset, query.offset + query.limit),
    total: sorted.length,
    limit: query.limit,
    offset: query.offset,
  };
}

export function getCompany(id: string): Company | null {
  return companies.find((company) => company.id === id) ?? null;
}

export function createCompany(input: CreateCompanyInput): Company {
  const timestamp = new Date().toISOString();
  const company: Company = {
    id: `cmp_${crypto.randomUUID()}`,
    name: input.name,
    domain: input.domain ?? null,
    status: input.status ?? "new",
    version: 1,
    created_at: timestamp,
    updated_at: timestamp,
  };
  companies = [company, ...companies];
  return company;
}

export function updateCompany(id: string, input: UpdateCompanyInput): UpdateResult {
  const index = companies.findIndex((company) => company.id === id);
  const current = index === -1 ? undefined : companies[index];
  if (!current) return { ok: false, error: { type: "not_found" } };
  if (current.version !== input.if_version) {
    return { ok: false, error: { type: "conflict", current } };
  }

  const next: Company = {
    ...current,
    name: input.name ?? current.name,
    domain: input.domain === undefined ? current.domain : input.domain,
    status: input.status ?? current.status,
    version: current.version + 1,
    updated_at: new Date().toISOString(),
  };
  companies = companies.map((company) => (company.id === id ? next : company));
  return { ok: true, value: next };
}
