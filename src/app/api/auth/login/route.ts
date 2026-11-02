import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  authConfigured,
  checkCredentials,
  createSessionToken,
} from "@/lib/auth/session";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: "Advisor login is not configured. Set ADVISOR_USERNAME and ADVISOR_PASSWORD in .env." },
      { status: 503 },
    );
  }

  const ip = clientIp(request.headers);
  const limit = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!(await checkCredentials(username, password))) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  resetRateLimit(`login:${ip}`);
  const token = await createSessionToken(username);
  if (!token) return NextResponse.json({ error: "Could not start a session" }, { status: 500 });

  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !request.nextUrl.hostname.match(/^(localhost|127\.0\.0\.1)$/),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
