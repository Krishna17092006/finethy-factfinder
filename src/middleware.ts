import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Guards everything under /advisor and /api/advisor.
 *  - Pages redirect to /advisor/login when there is no valid session.
 *  - API routes answer 401 JSON (never HTML).
 *  - State-changing API calls must come from this site (CSRF defence on top of SameSite cookies).
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isLoginPage = pathname === "/advisor/login";

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (isLoginPage) {
    if (session) return NextResponse.redirect(new URL("/advisor", request.url));
    return withPrivateHeaders(NextResponse.next());
  }

  if (!session) {
    if (isApi) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const login = new URL("/advisor/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  if (isApi && !["GET", "HEAD", "OPTIONS"].includes(request.method) && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
  }

  return withPrivateHeaders(NextResponse.next());
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients that still carry a valid session cookie
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

function withPrivateHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/advisor/:path*", "/api/advisor/:path*"],
};
