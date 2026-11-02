"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block font-semibold text-brand-darkText">
        {label}
        {required ? <span className="text-brand-mutedText font-normal"> (required)</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-[15px] text-brand-mutedText">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-[15px] font-medium text-health-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A group of related controls with a visible legend (radio lists, chips, yes/no). */
export function Group({
  legend,
  hint,
  children,
  className,
}: {
  legend: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="mb-3 font-semibold text-brand-darkText">{legend}</legend>
      {hint ? <p className="-mt-1 text-[15px] text-brand-mutedText">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

export function SectionIntro({ children }: { children: React.ReactNode }) {
  return <p className="text-brand-bodyText">{children}</p>;
}

/** A bordered sub-panel that appears when the client answers "Yes" to something. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("animate-in fade-in-0 slide-in-from-top-1 space-y-4 border-l-2 border-brand-blue/30 pl-4 duration-200", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

export const inputClass =
  "block h-12 w-full rounded-lg border border-input bg-white px-3.5 text-[17px] text-brand-darkText placeholder:text-[#8a91a0] focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25 disabled:bg-brand-page sm:text-base";

/** Native select: the phone's own picker is faster and easier than a custom dropdown. */
export function NativeSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Choose one",
  className,
  ...rest
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  options: ReadonlyArray<string | { value: string; label: string }>;
  placeholder?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">) {
  return (
    <div className="relative">
      <select
        {...rest}
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "appearance-none pr-10", !value && "text-[#8a91a0]", className)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value} className="text-brand-darkText">
              {opt.label}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-mutedText" aria-hidden />
    </div>
  );
}

/** Text input that keeps its own state while typing and reports on blur / after a pause. */
export function TextInput({
  value,
  onChange,
  filter,
  className,
  ...props
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  filter?: (v: string) => string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [local, setLocal] = React.useState(value ?? "");
  const focused = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!focused.current) setLocal(value ?? "");
  }, [value]);
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <input
      {...props}
      value={local}
      className={cn(inputClass, className)}
      onFocus={() => (focused.current = true)}
      onChange={(e) => {
        const next = filter ? filter(e.target.value) : e.target.value;
        setLocal(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(next), 500);
      }}
      onBlur={() => {
        focused.current = false;
        if (timer.current) clearTimeout(timer.current);
        if (local !== (value ?? "")) onChange(local);
      }}
    />
  );
}

/** Multi-line version for open questions. */
export function TextArea({
  value,
  onChange,
  className,
  ...props
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const [local, setLocal] = React.useState(value ?? "");
  const focused = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!focused.current) setLocal(value ?? "");
  }, [value]);
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return (
    <textarea
      {...props}
      value={local}
      rows={props.rows ?? 3}
      className={cn(inputClass, "h-auto min-h-[6rem] py-3 leading-relaxed", className)}
      onFocus={() => (focused.current = true)}
      onChange={(e) => {
        setLocal(e.target.value);
        if (timer.current) clearTimeout(timer.current);
        const v = e.target.value;
        timer.current = setTimeout(() => onChange(v), 600);
      }}
      onBlur={() => {
        focused.current = false;
        if (timer.current) clearTimeout(timer.current);
        if (local !== (value ?? "")) onChange(local);
      }}
    />
  );
}

/** DD/MM/YYYY with the slashes typed for you. */
export function formatDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DateOfBirthInput({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <TextInput
      id={id}
      value={value}
      onChange={onChange}
      filter={formatDobInput}
      inputMode="numeric"
      autoComplete="bday"
      placeholder="DD/MM/YYYY"
      maxLength={10}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Choice controls                                                     */
/* ------------------------------------------------------------------ */

/** Yes / No as a real radio pair (keyboard and screen-reader friendly). */
export function YesNo({
  name,
  value,
  onChange,
  legend,
  hint,
}: {
  name: string;
  value: boolean | null | undefined;
  onChange: (v: boolean) => void;
  legend: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <legend className="font-semibold text-brand-darkText">{legend}</legend>
        {hint ? <p className="text-[15px] text-brand-mutedText">{hint}</p> : null}
      </div>
      <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:w-52">
        {[
          { v: true, label: "Yes" },
          { v: false, label: "No" },
        ].map((opt) => {
          const checked = value === opt.v;
          return (
            <label
              key={opt.label}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-lg border text-[15px] font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-blue has-[:focus-visible]:ring-offset-2",
                checked
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-brand-border bg-white text-brand-darkText hover:border-brand-blue",
              )}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(opt.v)}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export interface ChoiceOption {
  id: string;
  label: string;
}

/** Single-choice list of answer cards (native radios underneath). */
export function ChoiceList({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: ChoiceOption[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const checked = value === opt.id;
        return (
          <label
            key={opt.id}
            className={cn(
              "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-blue has-[:focus-visible]:ring-offset-2",
              checked
                ? "border-brand-blue bg-brand-blue-light text-brand-darkText"
                : "border-brand-border bg-white text-brand-bodyText hover:border-brand-blue/60",
            )}
          >
            <input type="radio" name={name} className="sr-only" checked={checked} onChange={() => onChange(opt.id)} />
            <span
              aria-hidden
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                checked ? "border-brand-blue bg-brand-blue" : "border-[#aab1bf] bg-white",
              )}
            >
              {checked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>
            <span className={cn("leading-snug", checked && "font-medium")}>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

/** Multi-select chips (toggle buttons). */
export function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: ReadonlyArray<string>;
  selected: string[];
  onToggle: (opt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(opt)}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[15px] font-medium transition-colors",
              on
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-brand-border bg-white text-brand-darkText hover:border-brand-blue",
            )}
          >
            {on ? <Check className="h-4 w-4" aria-hidden /> : null}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** 0 / 1 / 2 / 3 / 4+ number picker. */
export function CountPicker({
  value,
  onChange,
  label,
}: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  label: string;
}) {
  const [custom, setCustom] = React.useState<boolean>(typeof value === "number" && value >= 4);
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((n) => {
          const on = !custom && value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setCustom(false);
                onChange(n);
              }}
              className={cn(
                "h-11 min-w-12 rounded-lg border px-4 text-[15px] font-semibold tabular transition-colors",
                on ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-brand-darkText hover:border-brand-blue",
              )}
            >
              {n}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={custom}
          onClick={() => {
            setCustom(true);
            if (typeof value !== "number" || value < 4) onChange(4);
          }}
          className={cn(
            "h-11 min-w-12 rounded-lg border px-4 text-[15px] font-semibold transition-colors",
            custom ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-brand-darkText hover:border-brand-blue",
          )}
        >
          4 or more
        </button>
      </div>
      {custom ? (
        <input
          type="text"
          inputMode="numeric"
          aria-label={`${label}: exact number`}
          className={cn(inputClass, "w-28")}
          value={typeof value === "number" ? String(value) : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
            onChange(raw === "" ? null : parseInt(raw, 10));
          }}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* JSON-array helpers for fields stored as JSON strings                */
/* ------------------------------------------------------------------ */

export function readList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function readObject<T extends object>(value: unknown): T {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as T;
  if (typeof value !== "string" || !value) return {} as T;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as T) : ({} as T);
  } catch {
    return {} as T;
  }
}
