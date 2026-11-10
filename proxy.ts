import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = request.cookies.get(SESSION_COOKIE)?.value === "1";
  const isCompanies = pathname === "/companies" || pathname.startsWith("/companies/");

  if (isCompanies && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/companies", "/companies/:path*", "/sign-in"],
};
