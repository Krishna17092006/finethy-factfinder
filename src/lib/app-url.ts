/**
 * Public base URL of the app (used in client links and emails).
 * APP_URL is read at runtime. NEXT_PUBLIC_APP_URL is still honoured for older
 * .env files, but Next.js fixes NEXT_PUBLIC_* values at build time.
 */
export function configuredAppUrl(): string | null {
  const url = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  return url ? url.replace(/\/+$/, "") : null;
}
