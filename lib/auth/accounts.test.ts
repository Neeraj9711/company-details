import { beforeEach, describe, expect, it } from "vitest";
import { createAccount, findAccount, parseAccountName, resetAccounts } from "@/lib/auth/accounts";

describe("issued access tokens", () => {
  beforeEach(() => {
    resetAccounts();
  });

  it("issues a token that login can resolve", () => {
    const account = createAccount("  Ada  ");
    expect(account.name).toBe("Ada");
    expect(account.token.startsWith("tok_")).toBe(true);
    expect(findAccount(account.token)).toEqual(account);
    expect(findAccount("tok_missing")).toBeNull();
  });

  it("rejects a blank signup name", () => {
    expect(parseAccountName({ name: "   " }).ok).toBe(false);
    expect(parseAccountName({}).ok).toBe(false);
  });
});
