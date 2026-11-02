"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StartButton({ children = "Start the fact-finder" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta" size="lg" className="w-full sm:w-auto" disabled={pending} aria-busy={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {pending ? "Opening your form" : children}
    </Button>
  );
}
