import type { Metadata } from "next";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "@/components/advisor/LoginForm";

export const metadata: Metadata = { title: "Advisor sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Only allow returning to advisor pages (no open redirects).
  const safeNext = next && next.startsWith("/advisor") && !next.startsWith("//") ? next : "/advisor";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Logo className="h-10" priority />
        <h1 className="mt-8 font-wide text-3xl font-bold tracking-tight">Advisor sign in</h1>
        <p className="mt-2 text-brand-mutedText">See your clients&apos; fact-finders and reports.</p>
        <LoginForm next={safeNext} />
      </div>
    </main>
  );
}
