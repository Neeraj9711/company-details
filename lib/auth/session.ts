export const TOKEN_STORAGE_KEY = "crm.access_token";
export const SESSION_COOKIE = "crm_signed_in";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  return token && token.trim().length > 0 ? token : null;
}

export function setSession(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  document.cookie = `${SESSION_COOKIE}=1; Path=/; SameSite=Lax`;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
