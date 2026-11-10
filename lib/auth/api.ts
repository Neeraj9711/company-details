import { isRecord } from "@/lib/api/types";

export class AuthRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Auth request failed");
    this.name = "AuthRequestError";
    this.status = status;
  }
}

export type IssuedToken = {
  name: string;
  token: string;
};

function isIssuedToken(value: unknown): value is IssuedToken {
  return isRecord(value) && typeof value.name === "string" && typeof value.token === "string" && value.token.length > 0;
}

export async function signupAccount(name: string): Promise<IssuedToken> {
  const response = await fetch("/api/v1/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
    cache: "no-store",
  });
  if (!response.ok) throw new AuthRequestError(response.status);
  const body: unknown = await response.json();
  if (!isIssuedToken(body)) throw new AuthRequestError(response.status);
  return body;
}

export async function loginWithToken(token: string): Promise<void> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
    cache: "no-store",
  });
  if (!response.ok) throw new AuthRequestError(response.status);
}
