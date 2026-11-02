import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number in Indian comma style (₹ format)
 * e.g. 2500000 → "25,00,000"
 */
export function formatIndianNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";
  if (num === 0) return "0";

  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const str = absNum.toString();

  if (str.length <= 3) return (isNegative ? "-" : "") + str;

  // Last 3 digits
  const last3 = str.slice(-3);
  const remaining = str.slice(0, -3);

  // Group remaining digits in pairs from right
  const pairs: string[] = [];
  for (let i = remaining.length; i > 0; i -= 2) {
    pairs.unshift(remaining.slice(Math.max(0, i - 2), i));
  }

  return (isNegative ? "-" : "") + pairs.join(",") + "," + last3;
}

/**
 * Format rupees with Rs. symbol to avoid missing glyphs in PDF
 */
export function formatRupees(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";
  return "Rs. " + formatIndianNumber(num);
}

/**
 * Format rupees in lakhs/crores for readability
 * e.g. 2500000 → "Rs. 25L", 10000000 → "Rs. 1Cr"
 */
export function formatRupeesShort(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";
  if (num === 0) return "Rs. 0";

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 10000000) {
    const cr = abs / 10000000;
    return sign + "Rs. " + (cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)) + "Cr";
  }
  if (abs >= 100000) {
    const l = abs / 100000;
    return sign + "Rs. " + (l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)) + "L";
  }
  if (abs >= 1000) {
    const k = abs / 1000;
    return sign + "Rs. " + (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + "K";
  }
  return sign + "Rs. " + abs.toString();
}

/**
 * Parse an Indian-formatted number string back to a number
 * e.g. "25,00,000" → 2500000
 */
export function parseIndianNumber(str: string): number | null {
  if (!str) return null;
  const cleaned = str.replace(/[Rs.₹,\s]/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Format percentage
 */
export function formatPercent(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";
  return num.toFixed(1) + "%";
}

/**
 * Parse a date of birth. The form stores DD/MM/YYYY; ISO strings are accepted too.
 * Returns null for anything that is not a real calendar date.
 */
export function parseDateOfBirth(dob: unknown): Date | null {
  if (typeof dob !== "string" || !dob.trim()) return null;
  const s = dob.trim();
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  let birth: Date;
  if (dmy) {
    const [d, m, y] = [Number(dmy[1]), Number(dmy[2]), Number(dmy[3])];
    birth = new Date(y, m - 1, d);
    // Reject rollovers such as 31/02/1990
    if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;
  } else {
    birth = new Date(s);
  }
  return isNaN(birth.getTime()) ? null : birth;
}

/**
 * Calculate age from date of birth string
 */
export function calculateAge(dob: string | null | undefined): number | null {
  const birth = parseDateOfBirth(dob);
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Clean a string by trimming whitespace and capitalizing the first letter of each word
 */
export function cleanString(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Clean text for PDF rendering.
 * Breaks 'fi', 'fl', 'ff' ligatures which often cause missing glyph errors in react-pdf.
 */
export function cleanPdfText(str: string | null | undefined): string {
  if (!str) return "";
  return str
    // Mojibake sequences (UTF-8 bytes read as Windows-1252)
    .replace(/\u00e2\u20ac\u00a2/g, "-")     // â€¢ → bullet mojibake
    .replace(/\u00e2\u20ac\u201c/g, " - ")   // â€" → en-dash mojibake
    .replace(/\u00e2\u20ac\u201d/g, " - ")   // â€" → em-dash mojibake
    .replace(/\u00e2\u20ac\u2122/g, "'")      // â€™ → right single quote mojibake
    .replace(/\u00e2\u20ac\u0153/g, '"')      // â€œ → left double quote mojibake
    .replace(/\u00e2\u20ac\u009d/g, '"')      // â€ → right double quote mojibake
    .replace(/\u00e2\u201a\u00b9/g, "Rs.")    // â‚¹ → rupee sign mojibake
    // Literal mojibake ASCII strings (fallback)
    .replace(/â€¢/g, "-")
    .replace(/â€"/g, " - ")
    .replace(/â€"/g, " - ")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€\u009d/g, '"')
    .replace(/â‚¹/g, "Rs.")
    // Actual Unicode characters
    .replace(/[\u2018\u2019]/g, "'")          // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"')          // Smart double quotes
    .replace(/\u2022/g, "-")                  // Bullet •
    .replace(/[\u2013\u2014]/g, " - ")        // En-dash – / Em-dash —
    .replace(/\u20B9/g, "Rs.");               // Rupee sign ₹
}

/** Web formatting with the ₹ sign (the PDF uses "Rs." via formatRupees). */
export function formatINR(num: number | null | undefined): string {
  if (num === null || num === undefined || !Number.isFinite(num)) return "—";
  return (num < 0 ? "−₹" : "₹") + formatIndianNumber(Math.abs(num));
}

/** ₹25L, ₹1.2Cr, ₹45K */
export function formatINRShort(num: number | null | undefined): string {
  if (num === null || num === undefined || !Number.isFinite(num)) return "—";
  const abs = Math.abs(num);
  const sign = num < 0 ? "−" : "";
  const fmt = (x: number) => (x >= 100 || x % 1 === 0 ? x.toFixed(0) : x.toFixed(1).replace(/\.0$/, ""));
  if (abs >= 1e7) return `${sign}₹${fmt(abs / 1e7)}Cr`;
  if (abs >= 1e5) return `${sign}₹${fmt(abs / 1e5)}L`;
  if (abs >= 1e3) return `${sign}₹${fmt(abs / 1e3)}K`;
  return `${sign}₹${Math.round(abs)}`;
}
