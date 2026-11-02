import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SITE } from "@/config/site";

/** Full-page message for dead ends (invalid link, expired link, 404). */
export function MessagePage({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="font-wide text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {action ?? (
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-lg bg-brand-blue px-5 font-semibold text-white hover:bg-brand-blue-dark"
            >
              Go to the home page
            </Link>
          )}
          <a
            href={SITE.phoneHref}
            className="inline-flex h-11 items-center rounded-lg border border-brand-border bg-white px-5 font-semibold text-brand-darkText hover:border-brand-blue"
          >
            Call {SITE.phoneDisplay}
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
