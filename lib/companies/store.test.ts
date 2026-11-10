import { beforeEach, describe, expect, it } from "vitest";
import { parseCreateBody } from "@/lib/companies/parse";
import { createCompany, listCompanies, resetCompanyStore, updateCompany } from "@/lib/companies/store";

const all = {
  limit: 20,
  offset: 0,
  q: "",
  status: null,
  sort: "-created_at" as const,
};

describe("company store", () => {
  beforeEach(() => {
    resetCompanyStore();
  });

  it("seeds 40 companies and filters by name or domain", () => {
    expect(listCompanies(all).total).toBe(40);
    const byName = listCompanies({ ...all, q: "noordzee" });
    expect(byName.total).toBe(1);
    expect(byName.items[0]?.name).toBe("Noordzee Energy");

    const byDomain = listCompanies({ ...all, q: "noordzee-energy.example" });
    expect(byDomain.items.map((company) => company.id)).toEqual(["cmp_12"]);
  });

  it("rejects a stale version and keeps the stored company", () => {
    const original = listCompanies(all).items[0];
    expect(original).toBeDefined();
    if (!original) return;

    const saved = updateCompany(original.id, { if_version: original.version, name: "Renamed" });
    expect(saved.ok).toBe(true);

    const conflict = updateCompany(original.id, { if_version: original.version, name: "Other" });
    expect(conflict.ok).toBe(false);
    if (conflict.ok) return;
    expect(conflict.error.type).toBe("conflict");
    if (conflict.error.type !== "conflict") return;
    expect(conflict.error.current.name).toBe("Renamed");
    expect(conflict.error.current.version).toBe(original.version + 1);
    expect(listCompanies({ ...all, q: "Renamed" }).total).toBe(1);
  });

  it("creates version 1 and rejects an empty name before it is stored", () => {
    expect(parseCreateBody({ name: "  " }).ok).toBe(false);
    const created = createCompany({ name: "Fresh Company", domain: null, status: "new" });
    expect(created.version).toBe(1);
    expect(listCompanies({ ...all, q: "Fresh Company" }).items[0]?.id).toBe(created.id);
  });
});
