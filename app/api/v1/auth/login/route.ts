import { NextResponse } from "next/server";
import { findAccount } from "@/lib/auth/accounts";
import { beginApiRequest } from "@/lib/companies/http";
import { readJson } from "@/lib/companies/parse";
import { isRecord } from "@/lib/api/types";

export async function POST(request: Request) {
  await beginApiRequest();
  const body = await readJson(request);
  const token = isRecord(body) && typeof body.token === "string" ? body.token.trim() : "";
  const account = token ? findAccount(token) : null;
  if (!account) {
    return NextResponse.json(
      { detail: "Unknown access token" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json({ name: account.name }, { headers: { "Cache-Control": "no-store" } });
}
