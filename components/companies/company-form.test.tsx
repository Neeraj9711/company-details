import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CompanyForm } from "@/components/companies/company-form";
import { ApiError, type CompaniesClient } from "@/lib/api/client";
import type { Company, UpdateCompanyInput } from "@/lib/api/types";
import { renderWithProviders } from "@/test/render";

const opened: Company = {
  id: "cmp_01",
  name: "Acme",
  domain: "acme.example",
  status: "new",
  version: 1,
  created_at: "2024-01-01T09:00:00.000Z",
  updated_at: "2024-01-01T09:00:00.000Z",
};

const latest: Company = {
  ...opened,
  name: "Acme Server",
  version: 2,
  updated_at: "2024-02-01T09:00:00.000Z",
};

describe("company edit conflicts", () => {
  it("keeps the typed draft on a 409 and retries with the reloaded version", async () => {
    const user = userEvent.setup();
    const update = vi.fn(async (_id: string, body: UpdateCompanyInput) => {
      if (body.if_version !== latest.version) {
        throw new ApiError(409, {
          detail: "This company was updated by someone else.",
          current: latest,
        });
      }
      return { ...latest, name: body.name ?? latest.name, domain: body.domain ?? null, status: body.status ?? latest.status, version: 3 };
    });
    const get = vi.fn(async () => latest);
    const client: CompaniesClient = {
      list: vi.fn(),
      get,
      create: vi.fn(),
      update,
    };

    renderWithProviders(
      <CompanyForm mode="edit" company={opened} onClose={vi.fn()} onSaved={vi.fn()} />,
      client,
    );

    const name = screen.getByLabelText("Name");
    expect(screen.getByText(/Editing version 1/)).toBeInTheDocument();
    await user.clear(name);
    await user.type(name, "Typed Name");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("This company changed");
    expect(name).toHaveValue("Typed Name");
    expect(update).toHaveBeenCalledWith(
      "cmp_01",
      expect.objectContaining({ if_version: 1, name: "Typed Name" }),
    );

    await user.click(screen.getByRole("button", { name: "Reload latest version" }));

    expect(await screen.findByText(/Editing version 2/)).toBeInTheDocument();
    expect(name).toHaveValue("Typed Name");
    expect(get).toHaveBeenCalledWith("cmp_01", expect.anything());

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(update).toHaveBeenLastCalledWith(
        "cmp_01",
        expect.objectContaining({ if_version: 2, name: "Typed Name" }),
      );
    });
  });

  it("announces a client-side name error and does not call the API", async () => {
    const user = userEvent.setup();
    const update = vi.fn();
    const client: CompaniesClient = {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update,
    };

    renderWithProviders(
      <CompanyForm mode="edit" company={opened} onClose={vi.fn()} onSaved={vi.fn()} />,
      client,
    );

    await user.clear(screen.getByLabelText("Name"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });
});
