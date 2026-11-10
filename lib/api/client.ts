import { getAccessToken } from "@/lib/auth/session";
import { handleUnauthorized } from "@/lib/auth/unauthorized";
import {
  isCompany,
  isCompanyListResponse,
  type Company,
  type CompanyListQuery,
  type CompanyListResponse,
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from "@/lib/api/types";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(messageFrom(status, body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function messageFrom(status: number, body: unknown): string {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = body.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail[0];
      if (typeof first === "object" && first !== null && "msg" in first && typeof first.msg === "string") {
        return first.msg;
      }
    }
  }
  return `Request failed with status ${status}`;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export type CompaniesClient = {
  list(params: CompanyListQuery, signal?: AbortSignal): Promise<CompanyListResponse>;
  get(id: string, signal?: AbortSignal): Promise<Company>;
  create(input: CreateCompanyInput): Promise<Company>;
  update(id: string, input: UpdateCompanyInput): Promise<Company>;
};

export type CompaniesClientOptions = {
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
  fetchFn?: typeof fetch;
};

function listPath(params: CompanyListQuery): string {
  const search = new URLSearchParams();
  search.set("limit", String(params.limit));
  search.set("offset", String(params.offset));
  search.set("sort", params.sort);
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  return `/api/v1/companies?${search.toString()}`;
}

export function createCompaniesClient(options: CompaniesClientOptions): CompaniesClient {
  const fetchFn = options.fetchFn ?? fetch;

  async function send(path: string, init: { method: string; body?: unknown; signal?: AbortSignal }) {
    const token = options.getAccessToken();
    if (!token) {
      options.onUnauthorized();
      throw new ApiError(401, { detail: "Not authenticated" });
    }

    const headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body !== undefined) headers.set("Content-Type", "application/json");

    const response = await fetchFn(path, {
      method: init.method,
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init.signal,
      cache: "no-store",
    });
    const body = await readResponseBody(response);
    if (response.status === 401) {
      options.onUnauthorized();
      throw new ApiError(401, body);
    }
    if (!response.ok) throw new ApiError(response.status, body);
    return body;
  }

  return {
    async list(params, signal) {
      const body = await send(listPath(params), { method: "GET", signal });
      if (!isCompanyListResponse(body)) {
        throw new ApiError(500, { detail: "Unexpected list payload" });
      }
      return body;
    },
    async get(id, signal) {
      const body = await send(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: "GET",
        signal,
      });
      if (!isCompany(body)) throw new ApiError(500, { detail: "Unexpected company payload" });
      return body;
    },
    async create(input) {
      const body = await send("/api/v1/companies", { method: "POST", body: input });
      if (!isCompany(body)) throw new ApiError(500, { detail: "Unexpected company payload" });
      return body;
    },
    async update(id, input) {
      const body = await send(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: input,
      });
      if (!isCompany(body)) throw new ApiError(500, { detail: "Unexpected company payload" });
      return body;
    },
  };
}

let sharedClient: CompaniesClient | undefined;

export function getSharedCompaniesClient(): CompaniesClient {
  sharedClient ??= createCompaniesClient({
    getAccessToken,
    onUnauthorized: handleUnauthorized,
  });
  return sharedClient;
}
