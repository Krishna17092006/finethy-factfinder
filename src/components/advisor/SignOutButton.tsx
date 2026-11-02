"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
        window.location.href = "/advisor/login";
      }}
      className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-brand-bodyText hover:bg-brand-blue-light hover:text-brand-blue disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">Sign out</span>
      <span className="sr-only sm:hidden">Sign out</span>
    </button>
  );
}
