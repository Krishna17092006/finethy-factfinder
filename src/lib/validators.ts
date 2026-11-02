/** Small, dependency-free validators shared by the browser form and the server. */

/** Indian mobile: 10 digits starting 6-9 (an optional 91 prefix is tolerated). */
export function isValidMobile(mobile: unknown): boolean {
  if (typeof mobile !== "string") return false;
  const digits = mobile.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return /^[6-9]\d{9}$/.test(local);
}

export function isValidEmail(email: unknown): boolean {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
