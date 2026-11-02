"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, CloudOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { cn } from "@/lib/utils";
import { isValidMobile } from "@/lib/validators";
import { parseDateOfBirth } from "@/lib/utils";
import { STEPS, type FormData } from "./steps";
import {
  SectionAssets,
  SectionGoals,
  SectionIncome,
  SectionInsurance,
  SectionLiabilities,
  SectionPersonal,
  SectionRisk,
  SectionWrapUp,
} from "./sections";

type SaveState = "idle" | "saving" | "saved" | "offline";

const LAST = STEPS.length - 1;
const storageKey = (token: string) => `ff-intake:${token}`;

function readBackup(token: string): FormData | null {
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    return raw ? (JSON.parse(raw) as FormData) : null;
  } catch {
    return null;
  }
}
function writeBackup(token: string, pending: FormData) {
  try {
    if (Object.keys(pending).length) window.localStorage.setItem(storageKey(token), JSON.stringify(pending));
    else window.localStorage.removeItem(storageKey(token));
  } catch {
    // storage unavailable (private mode): autosave to the server still works
  }
}

export function IntakeForm({ token, initial }: { token: string; initial: FormData }) {
  const router = useRouter();
  const [data, setData] = React.useState<FormData>(initial);
  const [step, setStep] = React.useState<number>(() => {
    const s = typeof initial.currentStep === "number" ? initial.currentStep : -1;
    // Drafts created before the welcome screen existed start at 0 with no activity.
    if (s === 0 && !initial.activeTimeSeconds) return -1;
    return Math.min(Math.max(s, -1), LAST);
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [submitting, setSubmitting] = React.useState(false);

  const pending = React.useRef<FormData>({});
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = React.useRef(false);
  const activeSeconds = React.useRef<number>(initial.activeTimeSeconds || 0);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const stepperRef = React.useRef<HTMLOListElement>(null);

  /* ---------------- saving ---------------- */

  const flush = React.useCallback(async (): Promise<boolean> => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (inflight.current) {
      saveTimer.current = setTimeout(() => void flush(), 400);
      return false;
    }
    const body = { ...pending.current, activeTimeSeconds: activeSeconds.current };
    if (Object.keys(pending.current).length === 0) return true;
    pending.current = {};
    inflight.current = true;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/intake/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        router.replace(`/intake/${token}/success`);
        return false;
      }
      if (!res.ok) throw new Error(String(res.status));
      writeBackup(token, pending.current);
      setSaveState("saved");
      return true;
    } catch {
      // Put the unsaved answers back and keep them on the device until the next try.
      pending.current = { ...body, ...pending.current };
      delete pending.current.activeTimeSeconds;
      writeBackup(token, pending.current);
      setSaveState("offline");
      saveTimer.current = setTimeout(() => void flush(), 8000);
      return false;
    } finally {
      inflight.current = false;
    }
  }, [router, token]);

  const update = React.useCallback(
    (patch: FormData) => {
      setData((prev) => ({ ...prev, ...patch }));
      Object.assign(pending.current, patch);
      writeBackup(token, pending.current);
      setErrors((prev) => {
        const keys = Object.keys(patch).filter((k) => k in prev);
        if (!keys.length) return prev;
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flush(), 1200);
    },
    [flush, token],
  );

  // Restore answers that never reached the server (closed tab, lost signal).
  React.useEffect(() => {
    const backup = readBackup(token);
    if (backup && Object.keys(backup).length) {
      setData((prev) => ({ ...prev, ...backup }));
      pending.current = { ...backup, ...pending.current };
      void flush();
    }
  }, [flush, token]);

  // Save when the client switches app or closes the tab.
  React.useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== "hidden" || !Object.keys(pending.current).length) return;
      const body = JSON.stringify({ ...pending.current, activeTimeSeconds: activeSeconds.current });
      fetch(`/api/intake/${token}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body, keepalive: true })
        .then((r) => {
          if (r.ok) {
            pending.current = {};
            writeBackup(token, {});
          }
        })
        .catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [token]);

  // Count active time (tab visible and focused) without re-rendering every second.
  React.useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && document.hasFocus()) activeSeconds.current += 1;
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ---------------- navigation ---------------- */

  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 0), LAST);
    pending.current.currentStep = next;
    void flush();
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  };

  React.useEffect(() => {
    stepperRef.current
      ?.querySelector<HTMLElement>('[aria-current="step"]')
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [step]);

  const personalErrors = (d: FormData) => {
    const e: Record<string, string> = {};
    if (!d.fullName || String(d.fullName).trim().length < 2) e.fullName = "Enter your full name.";
    if (!isValidMobile(d.mobile)) e.mobile = "Enter a 10-digit mobile number, for example 98450 12345.";
    if (d.dateOfBirth && !parseDateOfBirth(d.dateOfBirth)) e.dateOfBirth = "Use the format DD/MM/YYYY, for example 22/08/1982.";
    return e;
  };

  const onNext = () => {
    if (step === 0) {
      const e = personalErrors(data);
      if (Object.keys(e).length) {
        setErrors(e);
        document.getElementById(Object.keys(e)[0])?.focus();
        return;
      }
    }
    goTo(step + 1);
  };

  const onSubmit = async () => {
    const e = personalErrors(data);
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error("Please check your name and mobile number on step 1.");
      goTo(0);
      return;
    }
    if (data.consentGiven !== true) {
      setErrors({ consentGiven: "Tick this box so we can prepare your review." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/intake/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pending.current, consentGiven: true, activeTimeSeconds: activeSeconds.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "We could not send your answers. Check your connection and try again.");
      pending.current = {};
      writeBackup(token, {});
      router.replace(`/intake/${token}/success`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We could not send your answers.");
      setSubmitting(false);
    }
  };

  /* ---------------- render ---------------- */

  const header = <SiteHeader right={<SaveIndicator state={saveState} />} />;

  if (step === -1) {
    return (
      <>
        {header}
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
          <h1 className="font-wide text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {data.fullName ? `Namaste, ${String(data.fullName).split(/\s+/)[0]}.` : "Namaste."}
          </h1>
          <p className="mt-5 text-lg leading-relaxed">
            This form helps your FINETHY advisor understand your financial picture before you meet. There are 10 short
            steps. Most people finish in about 10 minutes.
          </p>
          <ul className="mt-6 space-y-2 text-brand-bodyText">
            <li>Approximate answers are perfectly fine. You don&apos;t need any documents.</li>
            <li>Your answers save as you go. You can close this page and continue later on this device.</li>
            <li>Only the FINETHY team sees what you share.</li>
          </ul>
          <Button variant="cta" size="lg" className="mt-9 w-full sm:w-auto" onClick={() => goTo(0)}>
            Let&apos;s begin
          </Button>
        </main>
      </>
    );
  }

  const current = STEPS[step];

  return (
    <>
      {header}

      <nav aria-label="Form steps" className="sticky top-0 z-30 border-b border-brand-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto max-w-3xl px-2 sm:px-6">
          <ol ref={stepperRef} className="hide-scrollbar flex gap-1 overflow-x-auto py-3">
            {STEPS.map((s, i) => {
              const done = s.isComplete(data);
              const isCurrent = i === step;
              return (
                <li key={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={submitting}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${s.title}${done ? " (answered)" : ""}`}
                    title={s.title}
                    className={cn(
                      "tabular flex h-10 w-10 items-center justify-center rounded-full border-2 text-[15px] font-bold transition-colors",
                      isCurrent
                        ? "border-brand-blue bg-brand-blue text-white"
                        : done
                          ? "border-brand-blue/40 bg-brand-blue-light text-brand-blue"
                          : "border-brand-border bg-white text-brand-mutedText hover:border-brand-blue/60",
                    )}
                  >
                    {done && !isCurrent ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : i + 1}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        <p className="tabular text-[15px] font-semibold text-brand-orange-deep">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-1 font-wide text-3xl font-bold tracking-tight outline-none sm:text-4xl">
          {current.title}
        </h1>

        <div className="mt-6 rounded-xl border border-brand-border bg-white p-4 shadow-[0_1px_2px_rgba(27,36,51,0.06)] sm:p-7">
          {step === 0 && <SectionPersonal data={data} update={update} errors={errors} />}
          {step === 1 && <SectionIncome data={data} update={update} />}
          {step === 2 && <SectionAssets data={data} update={update} />}
          {step === 3 && <SectionLiabilities data={data} update={update} />}
          {step === 4 && <SectionInsurance data={data} update={update} />}
          {step === 5 && <SectionGoals data={data} update={update} />}
          {step === 6 && <SectionRisk part={0} data={data} update={update} />}
          {step === 7 && <SectionRisk part={1} data={data} update={update} />}
          {step === 8 && <SectionRisk part={2} data={data} update={update} />}
          {step === 9 && <SectionWrapUp data={data} update={update} errors={errors} />}
        </div>

        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-brand-border bg-white px-4 pt-3 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <Button variant="outline" size="lg" onClick={() => (step === 0 ? setStep(-1) : goTo(step - 1))} disabled={submitting}>
              Back
            </Button>
            {step < LAST ? (
              <Button size="lg" onClick={onNext} className="min-w-[9rem]">
                Next<span className="hidden sm:inline">: {STEPS[step + 1].title.replace(/ \(\d of \d\)$/, "")}</span>
              </Button>
            ) : (
              <Button variant="cta" size="lg" onClick={onSubmit} disabled={submitting} aria-busy={submitting}>
                {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {submitting ? "Sending" : "Submit my answers"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  return (
    <p role="status" aria-live="polite" className="flex min-w-[6rem] items-center justify-end gap-1.5 text-sm text-brand-mutedText">
      {state === "saving" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Saving
        </>
      ) : state === "saved" ? (
        <>
          <Check className="h-4 w-4 text-health-green" aria-hidden /> Saved
        </>
      ) : state === "offline" ? (
        <span className="flex items-center gap-1.5 text-health-yellow">
          <CloudOff className="h-4 w-4" aria-hidden /> Saved on this device
        </span>
      ) : null}
    </p>
  );
}
