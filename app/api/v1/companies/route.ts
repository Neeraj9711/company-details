import { NextResponse } from "next/server";
import { parseCreateBody, parseListQuery, readJson } from "@/lib/companies/parse";
import { createCompany, listCompanies } from "@/lib/companies/store";
import {
  beginApiRequest,
  companyResponse,
  requireBearer,
  validationResponse,
} from "@/lib/companies/http";

export async function GET(request: Request) {
  await beginApiRequest();
  const unauthorized = requireBearer(request);
  if (unauthorized) return unauthorized;

  const page = listCompanies(parseListQuery(new URL(request.url)));
  return NextResponse.json(page, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  await beginApiRequest();
  const unauthorized = requireBearer(request);
  if (unauthorized) return unauthorized;

  const parsed = parseCreateBody(await readJson(request));
  if (!parsed.ok) return validationResponse(parsed.issues);
  return companyResponse(createCompany(parsed.value), 201);
}
