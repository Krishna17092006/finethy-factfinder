"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/intake/fields";

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-8 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.error || "Sign in failed");
          window.location.href = next;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Sign in failed");
          setBusy(false);
        }
      }}
    >
      <div className="space-y-2">
        <label htmlFor="username" className="block font-semibold text-brand-darkText">
          Username
        </label>
        <input id="username" name="username" autoComplete="username" required className={inputClass} autoFocus />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block font-semibold text-brand-darkText">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      {error ? (
        <p role="alert" className="rounded-lg border border-health-red-line bg-health-red-bg px-3 py-2 text-[15px] text-health-red">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Sign in
      </Button>
    </form>
  );
}
