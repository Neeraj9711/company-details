export const COMPANY_STATUSES = [
  "new",
  "researching",
  "contacted",
  "qualified",
  "rejected",
] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_SORTS = ["name", "-name", "created_at", "-created_at"] as const;

export type CompanySort = (typeof COMPANY_SORTS)[number];

export const PAGE_LIMIT = 20;

export type Company = {
  id: string;
  name: string;
  domain: string | null;
  status: CompanyStatus;
  version: number;
  created_at: string;
  updated_at: string;
};

export type CompanyListQuery = {
  limit: number;
  offset: number;
  q: string;
  status: CompanyStatus | null;
  sort: CompanySort;
};

export type CompanyListResponse = {
  items: Company[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateCompanyInput = {
  name: string;
  domain?: string | null;
  status?: CompanyStatus;
};

export type UpdateCompanyInput = {
  if_version: number;
  name?: string;
  domain?: string | null;
  status?: CompanyStatus;
};

export type ValidationIssue = {
  loc: ["body", string];
  msg: string;
  type: "value_error";
};

export function isCompanyStatus(value: unknown): value is CompanyStatus {
  return (
    typeof value === "string" &&
    COMPANY_STATUSES.some((status) => status === value)
  );
}

export function isCompanySort(value: unknown): value is CompanySort {
  return typeof value === "string" && COMPANY_SORTS.some((sort) => sort === value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isCompany(value: unknown): value is Company {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.domain === null || typeof value.domain === "string") &&
    isCompanyStatus(value.status) &&
    typeof value.version === "number" &&
    Number.isInteger(value.version) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

export function isCompanyListResponse(value: unknown): value is CompanyListResponse {
  if (!isRecord(value) || !Array.isArray(value.items)) return false;
  return (
    value.items.every((item) => isCompany(item)) &&
    typeof value.total === "number" &&
    typeof value.limit === "number" &&
    typeof value.offset === "number"
  );
}
