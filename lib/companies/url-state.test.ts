import { describe, expect, it } from "vitest";
import { PAGE_LIMIT } from "@/lib/api/types";
import { companyKeys } from "@/lib/api/queries";
import { parseCompanyUrl, serializeCompanyUrl } from "@/lib/companies/url-state";

describe("company list URL state and query keys", () => {
  it("normalizes the same filters to one query key regardless of param order", () => {
    const first = parseCompanyUrl(new URLSearchParams("q=acme&status=new&sort=name&offset=20"));
    const second = parseCompanyUrl(new URLSearchParams("offset=20&status=new&sort=name&q=acme"));

    expect(first.list).toEqual({
      limit: PAGE_LIMIT,
      offset: 20,
      q: "acme",
      status: "new",
      sort: "name",
    });
    expect(companyKeys.list(first.list)).toEqual(companyKeys.list(second.list));
  });

  it("changes the list query key when the search changes", () => {
    const base = parseCompanyUrl(new URLSearchParams());
    const searched = parseCompanyUrl(new URLSearchParams("q=acme"));

    expect(base.list.sort).toBe("-created_at");
    expect(base.list.limit).toBe(20);
    expect(companyKeys.list(base.list)).not.toEqual(companyKeys.list(searched.list));
  });

  it("keeps the open company out of the list query key", () => {
    const closed = parseCompanyUrl(new URLSearchParams("q=acme"));
    const open = parseCompanyUrl(new URLSearchParams("q=acme&company=cmp_01"));

    expect(open.company).toBe("cmp_01");
    expect(companyKeys.list(closed.list)).toEqual(companyKeys.list(open.list));
    expect(serializeCompanyUrl(open)).toBe("?q=acme&company=cmp_01");
  });

  it("drops unknown status and sort values", () => {
    const parsed = parseCompanyUrl(new URLSearchParams("status=nope&sort=revenue&offset=-4"));
    expect(parsed.list.status).toBeNull();
    expect(parsed.list.sort).toBe("-created_at");
    expect(parsed.list.offset).toBe(0);
    expect(serializeCompanyUrl(parsed)).toBe("");
  });
});
