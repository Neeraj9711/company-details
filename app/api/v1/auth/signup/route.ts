import { NextResponse } from "next/server";
import { createAccount, parseAccountName } from "@/lib/auth/accounts";
import { beginApiRequest, validationResponse } from "@/lib/companies/http";
import { readJson } from "@/lib/companies/parse";

export async function POST(request: Request) {
  await beginApiRequest();
  const parsed = parseAccountName(await readJson(request));
  if (!parsed.ok) return validationResponse(parsed.issues);
  const account = createAccount(parsed.name);
  return NextResponse.json(account, { status: 201, headers: { "Cache-Control": "no-store" } });
}
