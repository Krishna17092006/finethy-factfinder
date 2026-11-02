export function pdfFileName(fullName: string | null | undefined, date?: string): string {
  const safe = (fullName || "Client").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "Client";
  const suffix = date ? `_${date.replace(/[^a-zA-Z0-9]+/g, "_")}` : "";
  return `FINETHY_FactFinder_${safe}${suffix}.pdf`;
}
