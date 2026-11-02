/**
 * Advisor session: a signed, expiring cookie (HMAC-SHA256).
 *
 * Uses only Web Crypto so the same code runs in middleware (edge runtime)
 * and in route handlers (Node). No session table is needed.
 */

export const SESSION_COOKIE = "ff_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

interface SessionPayload {
  u: string; // username
  exp: number; // unix seconds
}

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function authConfigured(): boolean {
  return Boolean(process.env.ADVISOR_USERNAME && process.env.ADVISOR_PASSWORD);
}

async function signingKey(): Promise<CryptoKey | null> {
  const explicit = process.env.SESSION_SECRET;
  const password = process.env.ADVISOR_PASSWORD;
  const secret = explicit && explicit.length >= 16 ? explicit : password ? `ff-session:${password}` : null;
  if (!secret) return null;
  const raw = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(username: string, now = Date.now()): Promise<string | null> {
  const key = await signingKey();
  if (!key) return null;
  const payload: SessionPayload = { u: username, exp: Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS };
  const body = b64url(encoder.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySessionToken(token: string | undefined | null, now = Date.now()): Promise<SessionPayload | null> {
  if (!token || token.length > 1024) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const key = await signingKey();
  if (!key) return null;
  try {
    // crypto.subtle.verify compares in constant time
    const ok = await crypto.subtle.verify("HMAC", key, fromB64url(sig), encoder.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < now) return null;
    if (payload.u !== process.env.ADVISOR_USERNAME) return null;
    return payload;
  } catch {
    return null;
  }
}

async function sha256(s: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(s)));
}

/** Constant-time credential check (hashing first equalises length). */
export async function checkCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADVISOR_USERNAME;
  const expectedPass = process.env.ADVISOR_PASSWORD;
  if (!expectedUser || !expectedPass) return false;
  const [a, b, c, d] = await Promise.all([sha256(username), sha256(expectedUser), sha256(password), sha256(expectedPass)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ^ b[i]) | (c[i] ^ d[i]);
  return diff === 0;
}
