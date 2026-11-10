import { isRecord, type ValidationIssue } from "@/lib/api/types";

export type Account = {
  name: string;
  token: string;
};

const accounts = new Map<string, Account>();

export function resetAccounts(): void {
  accounts.clear();
}

export function createAccount(name: string): Account {
  const account = {
    name: name.trim(),
    token: `tok_${crypto.randomUUID()}`,
  };
  accounts.set(account.token, account);
  return account;
}

export function findAccount(token: string): Account | null {
  return accounts.get(token) ?? null;
}

export function parseAccountName(body: unknown): { ok: true; name: string } | { ok: false; issues: ValidationIssue[] } {
  if (!isRecord(body) || typeof body.name !== "string" || body.name.trim().length === 0) {
    return {
      ok: false,
      issues: [{ loc: ["body", "name"], msg: "Name must not be empty", type: "value_error" }],
    };
  }
  return { ok: true, name: body.name.trim() };
}
