import {
  PAGE_LIMIT,
  isCompanySort,
  isCompanyStatus,
  isRecord,
  type CompanyListQuery,
  type CompanySort,
  type CompanyStatus,
  type CreateCompanyInput,
  type UpdateCompanyInput,
  type ValidationIssue,
} from "@/lib/api/types";

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

function issue(field: string, msg: string): ValidationIssue {
  return { loc: ["body", field], msg, type: "value_error" };
}

export function parseLimit(value: string | null): number {
  if (!value) return PAGE_LIMIT;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return PAGE_LIMIT;
  return Math.min(parsed, 100);
}

export function parseOffset(value: string | null): number {
  if (!value) return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return parsed;
}

export function parseStatusParam(value: string | null): CompanyStatus | null {
  if (!value) return null;
  return isCompanyStatus(value) ? value : null;
}

export function parseSortParam(value: string | null): CompanySort {
  if (value && isCompanySort(value)) return value;
  return "-created_at";
}

export function parseListQuery(url: URL): CompanyListQuery {
  return {
    limit: parseLimit(url.searchParams.get("limit")),
    offset: parseOffset(url.searchParams.get("offset")),
    q: (url.searchParams.get("q") ?? "").trim(),
    status: parseStatusParam(url.searchParams.get("status")),
    sort: parseSortParam(url.searchParams.get("sort")),
  };
}

function readName(value: unknown, issues: ValidationIssue[]): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(issue("name", "Name must not be empty"));
    return undefined;
  }
  return value.trim();
}

function readDomain(
  value: unknown,
  issues: ValidationIssue[],
  fieldPresent: boolean,
): string | null | undefined {
  if (!fieldPresent) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    issues.push(issue("domain", "Domain must be a string or null"));
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function readStatus(
  value: unknown,
  issues: ValidationIssue[],
  fieldPresent: boolean,
): CompanyStatus | undefined {
  if (!fieldPresent) return undefined;
  if (!isCompanyStatus(value)) {
    issues.push(issue("status", "Status is not a known value"));
    return undefined;
  }
  return value;
}

export function parseCreateBody(body: unknown): ParseResult<CreateCompanyInput> {
  if (!isRecord(body)) {
    return { ok: false, issues: [issue("body", "Request body must be an object")] };
  }
  const issues: ValidationIssue[] = [];
  const name = readName(body.name, issues);
  const domain = readDomain(body.domain, issues, "domain" in body);
  const status = readStatus(body.status, issues, "status" in body);
  if (issues.length > 0 || name === undefined) return { ok: false, issues };
  return { ok: true, value: { name, domain, status } };
}

export function parseUpdateBody(body: unknown): ParseResult<UpdateCompanyInput> {
  if (!isRecord(body)) {
    return { ok: false, issues: [issue("body", "Request body must be an object")] };
  }
  const issues: ValidationIssue[] = [];
  const version = body.if_version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    issues.push(issue("if_version", "if_version must be a positive integer"));
  }
  const name = "name" in body ? readName(body.name, issues) : undefined;
  const domain = readDomain(body.domain, issues, "domain" in body);
  const status = readStatus(body.status, issues, "status" in body);
  if (issues.length > 0 || typeof version !== "number") return { ok: false, issues };
  return { ok: true, value: { if_version: version, name, domain, status } };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
