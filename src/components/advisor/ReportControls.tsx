"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NativeSelect, TextArea } from "@/components/intake/fields";
import { ConfirmDialog } from "./Dashboard";

const STATUS_OPTIONS = [
  { value: "submitted", label: "New: not reviewed yet" },
  { value: "reviewed", label: "Reviewed" },
  { value: "met", label: "Meeting done" },
];

export function StatusControl({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(status);
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor="status" className="block text-sm font-semibold text-brand-darkText">
        Status
      </label>
      <div className="flex items-center gap-2">
        <NativeSelect
          id="status"
          value={value}
          options={STATUS_OPTIONS}
          disabled={busy}
          className="h-10 text-[15px]"
          onChange={async (next) => {
            const prev = value;
            setValue(next);
            setBusy(true);
            const res = await fetch(`/api/advisor/submissions/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: next }),
            }).catch(() => null);
            setBusy(false);
            if (!res?.ok) {
              setValue(prev);
              toast.error("Status was not changed. Try again.");
              return;
            }
            toast.success(`Marked as ${STATUS_OPTIONS.find((o) => o.value === next)?.label.split(":")[0].toLowerCase()}`);
            router.refresh();
          }}
        />
        {busy ? <Loader2 className="h-4 w-4 animate-spin text-brand-mutedText" aria-label="Saving" /> : null}
      </div>
    </div>
  );
}

export function ReportActions({ id, emailConfigured }: { id: string; emailConfigured: boolean }) {
  const [sending, setSending] = React.useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <a href={`/api/advisor/submissions/${id}/pdf`} download>
          <Download aria-hidden /> Download PDF
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={`/api/advisor/submissions/${id}/pdf?inline=1`} target="_blank" rel="noopener">
          <FileText aria-hidden /> Open PDF
        </a>
      </Button>
      <Button
        variant="outline"
        disabled={sending}
        title={emailConfigured ? undefined : "Email is not set up yet (see README). The email will be printed in the server log instead."}
        onClick={async () => {
          setSending(true);
          try {
            const res = await fetch(`/api/advisor/submissions/${id}/resend`, { method: "POST" });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error || "Email was not sent");
            toast.success(json.delivered ? "Report emailed to the advisor inbox" : "Email isn't set up yet, so it was written to the server log");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Email was not sent");
          } finally {
            setSending(false);
          }
        }}
      >
        {sending ? <Loader2 className="animate-spin" aria-hidden /> : <Mail aria-hidden />}
        Email report
      </Button>
    </div>
  );
}

export interface NoteView {
  id: string;
  content: string;
  createdAt: string;
}

export function NotesPanel({ id, notes }: { id: string; notes: NoteView[] }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<NoteView | null>(null);
  const [key, setKey] = React.useState(0);

  return (
    <section aria-labelledby="notes-heading" className="rounded-xl border border-brand-border bg-white p-5">
      <h2 id="notes-heading" className="text-lg font-bold">
        Your notes
      </h2>
      <p className="mt-1 text-sm text-brand-mutedText">Private to advisors. Not shown to the client or in the PDF.</p>

      <form
        className="mt-4 space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setBusy(true);
          const res = await fetch(`/api/advisor/submissions/${id}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: draft }),
          }).catch(() => null);
          setBusy(false);
          if (!res?.ok) {
            toast.error("Note was not saved. Try again.");
            return;
          }
          setDraft("");
          setKey((k) => k + 1);
          router.refresh();
        }}
      >
        <label htmlFor="note" className="sr-only">
          New note
        </label>
        <TextArea key={key} id="note" placeholder="Add a note, e.g. what you discussed on the call" value={draft} onChange={setDraft} rows={3} />
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Save note
        </Button>
      </form>

      {notes.length ? (
        <ul className="mt-5 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="group rounded-lg bg-brand-page p-3">
              <p className="whitespace-pre-wrap text-[15px] text-brand-darkText">{n.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <time className="text-sm text-brand-mutedText" dateTime={n.createdAt}>
                  {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                </time>
                <button
                  type="button"
                  onClick={() => setToDelete(n)}
                  className="rounded p-1 text-brand-mutedText hover:bg-white hover:text-health-red"
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this note?"
        description="This cannot be undone."
        confirmLabel="Delete note"
        onConfirm={async () => {
          const res = await fetch(`/api/advisor/submissions/${id}/notes?noteId=${toDelete!.id}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Note was not deleted");
          setToDelete(null);
          router.refresh();
        }}
      />
    </section>
  );
}
