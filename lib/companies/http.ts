import { connection } from "next/server";
import { NextResponse } from "next/server";
import type { Company, ValidationIssue } from "@/lib/api/types";
import type { UpdateResult } from "@/lib/companies/store";

const NO_STORE = { "Cache-Control": "no-store" };

export async function beginApiRequest(): Promise<void> {
  // Cache Components prerender route handlers. Wait for a real request before
  // the random delay or any clock/id generation in the handlers below.
  await connection();
  const delayMs = 300 + Math.floor(Math.random() * 501);
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export function requireBearer(request: Request): NextResponse | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401, headers: NO_STORE });
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401, headers: NO_STORE });
  }
  return null;
}

export function validationResponse(issues: ValidationIssue[]): NextResponse {
  return NextResponse.json({ detail: issues }, { status: 422, headers: NO_STORE });
}

export function companyResponse(company: Company, status: number): NextResponse {
  return NextResponse.json(company, { status, headers: NO_STORE });
}

export function updateResultResponse(result: UpdateResult): NextResponse {
  if (result.ok) return companyResponse(result.value, 200);
  if (result.error.type === "not_found") {
    return NextResponse.json({ detail: "Company not found" }, { status: 404, headers: NO_STORE });
  }
  return NextResponse.json(
    {
      detail: "This company was updated by someone else.",
      current: result.error.current,
    },
    { status: 409, headers: NO_STORE },
  );
}
