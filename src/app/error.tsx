"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-wide text-3xl font-bold tracking-tight">Something went wrong on our side</h1>
      <p className="mt-4 text-lg leading-relaxed">
        Your saved answers are safe. Try again; if this keeps happening, call FINETHY on +91 89040 56464.
      </p>
      {error.digest ? <p className="mt-2 text-sm text-brand-mutedText">Reference: {error.digest}</p> : null}
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
