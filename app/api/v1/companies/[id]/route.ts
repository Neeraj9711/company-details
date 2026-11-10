import { NextResponse } from "next/server";
import { parseUpdateBody, readJson } from "@/lib/companies/parse";
import { getCompany, updateCompany } from "@/lib/companies/store";
import {
  beginApiRequest,
  companyResponse,
  requireBearer,
  updateResultResponse,
  validationResponse,
} from "@/lib/companies/http";

type CompanyRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: CompanyRouteContext) {
  await beginApiRequest();
  const unauthorized = requireBearer(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const company = getCompany(id);
  if (!company) {
    return NextResponse.json(
      { detail: "Company not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
  return companyResponse(company, 200);
}

export async function PATCH(request: Request, context: CompanyRouteContext) {
  await beginApiRequest();
  const unauthorized = requireBearer(request);
  if (unauthorized) return unauthorized;

  const parsed = parseUpdateBody(await readJson(request));
  if (!parsed.ok) return validationResponse(parsed.issues);

  const { id } = await context.params;
  return updateResultResponse(updateCompany(id, parsed.value));
}
