"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Link2, Loader2, MessageCircle, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { inputClass } from "@/components/intake/fields";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, type Category } from "@/lib/dashboard";

export interface DashboardRow {
  id: string;
  token: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  category: Category;
  currentStep: number;
  submittedAt: string | null;
  updatedAt: string;
  createdAt: string;
  red: number;
  yellow: number;
  disposable: boolean;
  fromWebsite: boolean;
}

const TABS: Category[] = ["new", "reviewed", "met", "in_progress", "not_started"];

export function Dashboard({ rows, baseUrl }: { rows: DashboardRow[]; baseUrl: string }) {
  const router = useRouter();
  const counts = React.useMemo(() => {
    const c = Object.fromEntries(TABS.map((t) => [t, 0])) as Record<Category, number>;
    rows.forEach((r) => (c[r.category] += 1));
    return c;
  }, [rows]);

  const [tab, setTab] = React.useState<Category>(() => (["new", "reviewed", "in_progress", "met"] as Category[]).find((t) => counts[t] > 0) ?? "new");
  const [query, setQuery] = React.useState("");
  const [newLinkOpen, setNewLinkOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<DashboardRow | null>(null);
  const [cleanupOpen, setCleanupOpen] = React.useState(false);

  const q = query.trim().toLowerCase();
  const visible = rows.filter((r) =>
    q ? [r.name, r.phone, r.city].some((v) => v?.toLowerCase().includes(q)) : r.category === tab,
  );
  const disposable = rows.filter((r) => r.disposable).length;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-wide text-3xl font-bold tracking-tight">Client intakes</h1>
          <p className="mt-1 text-brand-mutedText">
            {counts.new ? `${counts.new} new ${counts.new === 1 ? "report is" : "reports are"} waiting for review.` : "No new reports waiting."}
          </p>
        </div>
        <Button variant="cta" onClick={() => setNewLinkOpen(true)}>
          <Plus aria-hidden /> New client link
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter intakes" className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={!q && tab === t}
              onClick={() => {
                setTab(t);
                setQuery("");
              }}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-lg px-3.5 text-[15px] font-medium transition-colors",
                !q && tab === t ? "bg-brand-blue text-white" : "text-brand-bodyText hover:bg-white hover:text-brand-darkText",
              )}
            >
              {CATEGORY_LABEL[t]}
              <span className={cn("tabular rounded-md px-1.5 text-sm", !q && tab === t ? "bg-white/20" : "bg-brand-border/70")}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-mutedText" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone or city"
            aria-label="Search all intakes"
            className={cn(inputClass, "h-10 pl-9 text-[15px]")}
          />
        </div>
      </div>

      {!q && tab === "not_started" && disposable > 0 ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-brand-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px]">
            <strong className="text-brand-darkText">{disposable} blank forms</strong> were opened from the website and never filled in.
          </p>
          <Button variant="outline" size="sm" onClick={() => setCleanupOpen(true)}>
            <Trash2 aria-hidden /> Remove blank forms
          </Button>
        </div>
      ) : null}

      <section aria-label={q ? "Search results" : CATEGORY_LABEL[tab]} className="mt-6 overflow-hidden rounded-xl border border-brand-border bg-white">
        {visible.length === 0 ? (
          <EmptyState searching={!!q} tab={tab} onNew={() => setNewLinkOpen(true)} />
        ) : (
          <ul className="divide-y divide-brand-border">
            <li aria-hidden className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 bg-brand-page px-5 py-3 text-sm font-semibold text-brand-mutedText md:grid">
              <span>Client</span>
              <span>Status</span>
              <span>Flags</span>
              <span>{tab === "in_progress" || tab === "not_started" ? "Last activity" : "Submitted"}</span>
              <span className="w-44 text-right">Action</span>
            </li>
            {visible.map((r) => (
              <Row key={r.id} row={r} baseUrl={baseUrl} onDelete={() => setToDelete(r)} />
            ))}
          </ul>
        )}
      </section>

      <NewLinkDialog
        open={newLinkOpen}
        onOpenChange={(o) => {
          setNewLinkOpen(o);
          if (!o) router.refresh();
        }}
      />

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this unfinished form?"
        description={`${toDelete?.name || "This client"}'s link will stop working and anything they typed will be deleted.`}
        confirmLabel="Delete form"
        onConfirm={async () => {
          const res = await fetch(`/api/advisor/submissions/${toDelete!.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not delete");
          toast.success("Form deleted");
          setToDelete(null);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={cleanupOpen}
        onOpenChange={setCleanupOpen}
        title={`Remove ${disposable} blank forms?`}
        description="These were opened from the website but nobody typed anything. Links you created for named clients are not touched."
        confirmLabel="Remove blank forms"
        onConfirm={async () => {
          const res = await fetch("/api/advisor/links/cleanup", { method: "POST" });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.error || "Could not remove forms");
          toast.success(`Removed ${json.removed} blank forms`);
          setCleanupOpen(false);
          router.refresh();
        }}
      />
    </main>
  );
}

function Row({ row: r, baseUrl, onDelete }: { row: DashboardRow; baseUrl: string; onDelete: () => void }) {
  const submitted = r.category === "new" || r.category === "reviewed" || r.category === "met";
  const url = `${baseUrl}/intake/${r.token}`;
  return (
    <li className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4">
      <div className="min-w-0">
        {submitted ? (
          <Link href={`/advisor/submissions/${r.id}`} className="block truncate font-semibold capitalize text-brand-darkText hover:text-brand-blue">
            {r.name || "Unnamed client"}
          </Link>
        ) : (
          <p className={cn("truncate font-semibold text-brand-darkText", r.name ? "capitalize" : "italic text-brand-mutedText")}>
            {r.name || (r.fromWebsite ? "Started from the website" : "Unnamed client")}
          </p>
        )}
        <p className="tabular truncate text-sm text-brand-mutedText">
          {[r.phone, r.city].filter(Boolean).join(", ") || "No contact details yet"}
        </p>
      </div>

      <div>
        <StatusPill category={r.category} />
        {r.category === "in_progress" ? (
          <p className="mt-1 text-sm text-brand-mutedText">Reached step {Math.min(Math.max(r.currentStep, 0) + 1, 10)} of 10</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 text-sm">
        {submitted ? (
          r.red || r.yellow ? (
            <>
              {r.red ? <FlagCount tone="red" n={r.red} /> : null}
              {r.yellow ? <FlagCount tone="yellow" n={r.yellow} /> : null}
            </>
          ) : (
            <span className="text-health-green">No flags</span>
          )
        ) : (
          <span className="text-brand-muted md:hidden" />
        )}
      </div>

      <p className="text-sm text-brand-mutedText">
        <time suppressHydrationWarning dateTime={submitted ? r.submittedAt ?? r.updatedAt : r.updatedAt}>
          {relative(submitted ? r.submittedAt ?? r.updatedAt : r.updatedAt)}
        </time>
      </p>

      <div className="flex flex-wrap gap-2 md:w-44 md:justify-end">
        {submitted ? (
          <Button asChild size="sm">
            <Link href={`/advisor/submissions/${r.id}`}>Open report</Link>
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              aria-label={`Copy link for ${r.name || "this client"}`}
              onClick={async () => {
                await copy(url);
                toast.success("Link copied");
              }}
            >
              <Copy aria-hidden /> Copy link
            </Button>
            <Button size="sm" variant="ghost" aria-label={`Delete form for ${r.name || "this client"}`} onClick={onDelete}>
              <Trash2 aria-hidden />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export function StatusPill({ category }: { category: Category }) {
  const styles: Record<Category, string> = {
    new: "bg-brand-orange-light text-brand-orange-deep border-[#fcd9a8]",
    reviewed: "bg-brand-blue-light text-brand-blue border-[#c9d7f0]",
    met: "bg-health-green-bg text-health-green border-health-green-line",
    in_progress: "bg-white text-brand-bodyText border-brand-border",
    not_started: "bg-brand-page text-brand-mutedText border-brand-border",
  };
  return (
    <span className={cn("inline-flex h-7 items-center rounded-full border px-2.5 text-sm font-semibold", styles[category])}>
      {CATEGORY_LABEL[category]}
    </span>
  );
}

function FlagCount({ tone, n }: { tone: "red" | "yellow"; n: number }) {
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold",
        tone === "red" ? "bg-health-red-bg text-health-red" : "bg-health-yellow-bg text-health-yellow",
      )}
    >
      <span aria-hidden className={cn("h-2 w-2 rounded-full", tone === "red" ? "bg-health-red" : "bg-[#ca8a04]")} />
      {n} {tone}
    </span>
  );
}

function EmptyState({ searching, tab, onNew }: { searching: boolean; tab: Category; onNew: () => void }) {
  if (searching) return <p className="px-5 py-12 text-center text-brand-mutedText">No client matches that search.</p>;
  const copy: Record<Category, string> = {
    new: "New reports appear here as soon as a client submits their form.",
    reviewed: "Reports you mark as reviewed appear here.",
    met: "Clients you have met appear here once you mark the meeting as done.",
    in_progress: "Forms that clients have started but not submitted appear here.",
    not_started: "Links that nobody has opened yet appear here.",
  };
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-14 text-center">
      <p className="max-w-sm text-brand-mutedText">{copy[tab]}</p>
      {tab === "new" ? (
        <Button variant="outline" onClick={onNew}>
          <Plus aria-hidden /> Send a client a link
        </Button>
      ) : null}
    </div>
  );
}

function NewLinkDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<{ url: string; whatsappUrl: string; name: string | null } | null>(null);

  React.useEffect(() => {
    if (!open) {
      setCreated(null);
      setError(null);
      setBusy(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={created ? "Link ready to share" : "New client link"}
        description={created ? "Send this link to your client. It opens their own private form." : "Their name and number are filled in for them when they open the form."}
      >
        {created ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-page px-3 py-2.5">
              <Link2 className="h-4 w-4 shrink-0 text-brand-mutedText" aria-hidden />
              <input readOnly value={created.url} aria-label="Client link" className="w-full bg-transparent text-[15px] text-brand-darkText outline-none" onFocus={(e) => e.target.select()} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                onClick={async () => {
                  await copy(created.url);
                  toast.success("Link copied");
                }}
              >
                <Copy aria-hidden /> Copy link
              </Button>
              <Button asChild variant="outline">
                <a href={created.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden /> Send on WhatsApp
                </a>
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setBusy(true);
              setError(null);
              try {
                const res = await fetch("/api/advisor/links", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ clientName: f.get("clientName") || null, clientPhone: f.get("clientPhone") || null }),
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(json.error || "Could not create the link");
                setCreated({ url: json.link.url, whatsappUrl: json.link.whatsappUrl, name: json.link.clientName });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not create the link");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-2">
              <label htmlFor="clientName" className="block font-semibold text-brand-darkText">
                Client name <span className="font-normal text-brand-mutedText">(optional)</span>
              </label>
              <input id="clientName" name="clientName" maxLength={120} autoComplete="off" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="clientPhone" className="block font-semibold text-brand-darkText">
                Mobile number <span className="font-normal text-brand-mutedText">(optional, for WhatsApp)</span>
              </label>
              <input id="clientPhone" name="clientPhone" type="tel" inputMode="numeric" maxLength={14} autoComplete="off" className={inputClass} />
            </div>
            {error ? (
              <p role="alert" className="text-[15px] font-medium text-health-red">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
              Create link
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title} description={description}>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

const rtf = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
function relative(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
