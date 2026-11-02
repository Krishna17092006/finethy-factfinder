import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { SignOutButton } from "./SignOutButton";

export function AdvisorHeader() {
  return (
    <header className="border-b border-brand-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/advisor" aria-label="Client intakes">
            <Logo className="h-8" />
          </Link>
          <span className="hidden border-l border-brand-border pl-4 font-semibold text-brand-darkText sm:inline">
            Advisor
          </span>
        </div>
        <nav aria-label="Advisor" className="flex items-center gap-1">
          <Link href="/advisor" className="rounded-md px-3 py-2 font-medium text-brand-darkText hover:bg-brand-blue-light hover:text-brand-blue">
            Client intakes
          </Link>
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
