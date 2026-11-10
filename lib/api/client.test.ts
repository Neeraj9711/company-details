import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createCompaniesClient } from "@/lib/api/client";
import type { Company, CompanyListQuery, UpdateCompanyInput } from "@/lib/api/types";

const company: Company = {
  id: "cmp_01",
  name: "Acme",
  domain: "acme.example",
  status: "new",
  version: 1,
  created_at: "2024-01-01T09:00:00.000Z",
  updated_at: "2024-01-01T09:00:00.000Z",
};

const listQuery: CompanyListQuery = {
  limit: 20,
  offset: 0,
  q: "acme",
  status: "qualified",
  sort: "name",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("companies client", () => {
  const fetchFn = vi.fn<typeof fetch>();
  let token = "alpha";
  let unauthorized = 0;

  const client = createCompaniesClient({
    getAccessToken: () => token,
    onUnauthorized: () => {
      unauthorized += 1;
    },
    fetchFn,
  });

  beforeEach(() => {
    token = "alpha";
    unauthorized = 0;
    fetchFn.mockReset();
  });

  it("sends the current bearer token and the list query without putting the token in the URL", async () => {
    fetchFn.mockResolvedValueOnce(
      jsonResponse({ items: [company], total: 1, limit: 20, offset: 0 }),
    );

    await client.list(listQuery);

    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(String(url)).toBe("/api/v1/companies?limit=20&offset=0&sort=name&q=acme&status=qualified");
    expect(String(url)).not.toContain("alpha");
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer alpha");

    token = "bravo";
    fetchFn.mockResolvedValueOnce(jsonResponse(company));
    await client.get("cmp_01");
    const secondHeaders = new Headers(fetchFn.mock.calls[1]?.[1]?.headers);
    expect(secondHeaders.get("Authorization")).toBe("Bearer bravo");
  });

  it("sends if_version on update and surfaces a 409 without treating it as a signed-out session", async () => {
    const body: UpdateCompanyInput = { if_version: 1, name: "Typed Name" };
    fetchFn.mockResolvedValueOnce(
      jsonResponse({ detail: "This company was updated by someone else.", current: company }, 409),
    );

    await expect(client.update("cmp_01", body)).rejects.toBeInstanceOf(ApiError);
    expect(unauthorized).toBe(0);

    const init = fetchFn.mock.calls[0]?.[1];
    expect(init?.method).toBe("PATCH");
    expect(init?.body).toBe(JSON.stringify(body));
    expect(String(fetchFn.mock.calls[0]?.[0])).not.toContain("alpha");
  });

  it("clears the session path when the token is rejected", async () => {
    fetchFn.mockResolvedValueOnce(jsonResponse({ detail: "Not authenticated" }, 401));

    await expect(client.list(listQuery)).rejects.toMatchObject({ status: 401 });
    expect(unauthorized).toBe(1);
  });
});
