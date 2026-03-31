import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/acceso"];
const PUBLIC_API_PREFIX = "/api/acceso";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname.startsWith(PUBLIC_API_PREFIX) ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("app_access")?.value;

  if (session !== "ok") {
    const loginUrl = new URL("/acceso", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};