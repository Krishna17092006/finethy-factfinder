"use client";

import * as React from "react";
import { cn, formatIndianNumber } from "@/lib/utils";
import { inputClass } from "./fields";

/** "12 Lakh", "1.5 Crore": shown beside the amount so clients can sanity-check zeros. */
export function amountInWords(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n) || n < 1000) return "";
  const fmt = (x: number) => (x % 1 === 0 ? String(x) : x.toFixed(2).replace(/\.?0+$/, ""));
  if (n >= 1e7) return `${fmt(n / 1e7)} Crore`;
  if (n >= 1e5) return `${fmt(n / 1e5)} Lakh`;
  return `${fmt(n / 1e3)} Thousand`;
}

interface RupeeInputProps {
  id?: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  suffix?: string;
}

/**
 * Rupee amount field. Indian digit grouping (12,50,000) when not editing,
 * plain digits while editing, and the amount in words beside it.
 */
export function RupeeInput({
  id,
  value,
  onChange,
  placeholder = "e.g. 5,00,000",
  className,
  disabled,
  suffix,
  ...aria
}: RupeeInputProps) {
  const [raw, setRaw] = React.useState<string>(typeof value === "number" ? String(value) : "");
  const [focused, setFocused] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!focused) setRaw(typeof value === "number" && Number.isFinite(value) ? String(Math.round(value)) : "");
  }, [value, focused]);
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const push = (s: string) => onChange(s === "" ? null : Math.min(Number(s), 1e13));

  const numeric = raw === "" ? null : Number(raw);
  const words = amountInWords(numeric);
  const display = !focused && numeric !== null ? formatIndianNumber(numeric) : raw;

  return (
    <div className={cn("relative", className)}>
      <span aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-mutedText">
        ₹
      </span>
      <input
        id={id}
        name={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        placeholder={placeholder}
        disabled={disabled}
        {...aria}
        className={cn(inputClass, "tabular pl-8", (words || suffix) && "pr-28")}
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 13);
          setRaw(digits);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => push(digits), 500);
        }}
        onBlur={() => {
          setFocused(false);
          if (timer.current) clearTimeout(timer.current);
          push(raw);
        }}
      />
      {words || suffix ? (
        <span
          aria-live="polite"
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-brand-cyan-light px-2 py-1 text-[13px] font-semibold text-brand-cyan-dark"
        >
          {words}
          {words && suffix ? " " : ""}
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
