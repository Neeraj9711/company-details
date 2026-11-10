export function safeNextPath(value: string | null): string {
  if (!value) return "/companies";
  const withoutHash = value.split("#")[0] ?? "";
  if (withoutHash === "/companies" || withoutHash.startsWith("/companies?")) {
    return withoutHash;
  }
  return "/companies";
}

export function withNext(path: "/sign-in" | "/sign-up", next: string | null): string {
  if (!next) return path;
  const raw = next.split("#")[0] ?? "";
  if (safeNextPath(next) !== raw) return path;
  return `${path}?next=${encodeURIComponent(raw)}`;
}
