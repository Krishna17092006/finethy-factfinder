import Link from "next/link";
import { Phone } from "lucide-react";
import { SITE } from "@/config/site";
import { Logo } from "./Logo";

/**
 * Public header. Deliberately minimal: a client filling in a financial form
 * should not be pulled away by navigation. The main site is one link away.
 */
export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-brand-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="shrink-0 rounded-md" aria-label="FINETHY Fact-Finder home">
          <Logo priority className="h-9 sm:h-10" />
        </Link>
        {right ?? (
          <nav aria-label="Contact" className="flex items-center gap-1 text-[15px] sm:gap-5">
            <a
              href={SITE.phoneHref}
              className="flex h-10 items-center gap-2 rounded-md px-2 font-medium text-brand-darkText hover:text-brand-blue"
            >
              <Phone className="h-4 w-4 text-brand-cyan-dark" aria-hidden />
              <span className="hidden sm:inline">{SITE.phoneDisplay}</span>
              <span className="sr-only sm:hidden">Call FINETHY</span>
            </a>
            <a
              href={SITE.website}
              className="hidden h-10 items-center rounded-md px-2 font-medium text-brand-darkText hover:text-brand-blue md:flex"
            >
              finethy.co
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
