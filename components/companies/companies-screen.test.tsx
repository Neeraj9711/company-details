import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CompaniesScreen } from "@/components/companies/companies-screen";
import type { CompaniesClient } from "@/lib/api/client";
import type { Company, CompanyListQuery } from "@/lib/api/types";
import { TOKEN_STORAGE_KEY } from "@/lib/auth/session";
import { renderWithProviders } from "@/test/render";

const navigation = vi.hoisted(() => {
  const state: {
    params: URLSearchParams;
    listeners: Set<() => void>;
    hrefs: string[];
    replace: (href: string) => void;
  } = {
    params: new URLSearchParams(),
    listeners: new Set(),
    hrefs: [],
    replace: () => undefined,
  };

  state.replace = (href: string) => {
    const query = href.includes("?") ? href.slice(href.indexOf("?") + 1) : "";
    state.hrefs.push(href);
    state.params = new URLSearchParams(query);
    state.listeners.forEach((listener) => listener());
  };

  return state;
});

vi.mock("next/navigation", async () => {
  const React = await import("react");
  return {
    useRouter: () => ({
      replace: (href: string) => navigation.replace(href),
      push: vi.fn(),
      refresh: vi.fn(),
    }),
    usePathname: () => "/companies",
    useSearchParams: () =>
      React.useSyncExternalStore(
        (listener: () => void) => {
          navigation.listeners.add(listener);
          return () => navigation.listeners.delete(listener);
        },
        () => navigation.params,
        () => navigation.params,
      ),
  };
});

const acme: Company = {
  id: "cmp_acme",
  name: "Acme BV",
  domain: "acme.example",
  status: "qualified",
  version: 1,
  created_at: "2024-06-01T09:00:00.000Z",
  updated_at: "2024-06-01T09:00:00.000Z",
};

const northwind: Company = {
  id: "cmp_north",
  name: "Northwind Traders",
  domain: "northwind.example",
  status: "new",
  version: 1,
  created_at: "2024-05-01T09:00:00.000Z",
  updated_at: "2024-05-01T09:00:00.000Z",
};

function matches(company: Company, params: CompanyListQuery): boolean {
  const needle = params.q.toLowerCase();
  const matchesQuery =
    needle.length === 0 ||
    company.name.toLowerCase().includes(needle) ||
    (company.domain?.toLowerCase().includes(needle) ?? false);
  return matchesQuery && (params.status === null || company.status === params.status);
}

describe("company list filtering", () => {
  const list = vi.fn(async (params: CompanyListQuery) => {
    const items = [acme, northwind].filter((company) => matches(company, params));
    return { items, total: items.length, limit: params.limit, offset: params.offset };
  });

  const client: CompaniesClient = {
    list,
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(() => {
    navigation.params = new URLSearchParams();
    navigation.hrefs = [];
    navigation.listeners.clear();
    list.mockClear();
    sessionStorage.setItem(TOKEN_STORAGE_KEY, "test-token");
  });

  it("keeps the table mounted while search and status move into the URL and the query key", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompaniesScreen />, client);

    expect(await screen.findByText("Northwind Traders")).toBeInTheDocument();
    const table = screen.getByRole("table");

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "acme");

    await waitFor(() => {
      expect(list).toHaveBeenCalledWith(
        expect.objectContaining({ q: "acme", offset: 0 }),
        expect.anything(),
      );
    });

    expect(await screen.findByText("Acme BV")).toBeInTheDocument();
    expect(screen.queryByText("Northwind Traders")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBe(table);
    expect(navigation.hrefs.at(-1)).toContain("q=acme");
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();

    await user.selectOptions(screen.getByLabelText("Status"), "qualified");

    await waitFor(() => {
      expect(list).toHaveBeenCalledWith(
        expect.objectContaining({ q: "acme", status: "qualified", offset: 0 }),
        expect.anything(),
      );
    });
    expect(screen.getByRole("table")).toBe(table);
    expect(navigation.hrefs.at(-1)).toContain("status=qualified");
  });
});
