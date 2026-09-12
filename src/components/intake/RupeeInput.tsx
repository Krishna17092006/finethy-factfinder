"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RupeeInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function RupeeInput({
  value,
  onChange,
  placeholder = "e.g. 25,00,000",
  className,
  id,
  disabled,
}: RupeeInputProps) {
  // Store the raw numeric string locally, never undefined
  const [localRaw, setLocalRaw] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync incoming value only if not focused
  useEffect(() => {
    if (!isFocused) {
      if (value !== null && value !== undefined && !isNaN(value)) {
        setLocalRaw(value.toString());
      } else {
        setLocalRaw("");
      }
    }
  }, [value, isFocused]);

  // Clean up debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function formatIndian(num: number): string {
    const str = Math.round(Math.abs(num)).toString();
    if (str.length <= 3) return str;
    const last3 = str.slice(-3);
    const remaining = str.slice(0, -3);
    const pairs: string[] = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      pairs.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    return (num < 0 ? "-" : "") + pairs.join(",") + "," + last3;
  }

  function getHelperText(raw: string): string {
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < 1000) return "";
    if (num >= 10000000) {
      const cr = num / 10000000;
      return `${cr % 1 === 0 ? cr : cr.toFixed(2)} Crore${cr > 1 ? 's' : ''}`;
    }
    if (num >= 100000) {
      const lk = num / 100000;
      return `${lk % 1 === 0 ? lk : lk.toFixed(2)} Lakh${lk > 1 ? 's' : ''}`;
    }
    return "";
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip everything except digits and minus sign
    const raw = e.target.value.replace(/[^0-9-]/g, "");
    setLocalRaw(raw);

    // Debounce push up
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushUpward(raw);
    }, 800);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushUpward(localRaw);
  }

  function pushUpward(rawStr: string) {
    if (rawStr === "" || rawStr === "-") {
      onChange(null);
    } else {
      const parsed = parseInt(rawStr, 10);
      if (!isNaN(parsed)) {
        onChange(parsed);
      } else {
        onChange(null);
      }
    }
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Allow navigation, deletion, copy/paste
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
      (e.keyCode >= 35 && e.keyCode <= 40)) {
        return;
    }
    // Block non-numeric keys (except on mobile virtual keyboards where keyCode is 229)
    if (e.keyCode !== 229 && (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  }

  const helperText = getHelperText(localRaw);
  
  // Format only when not focused
  let displayValue = localRaw;
  if (!isFocused && localRaw && localRaw !== "-") {
    const parsed = parseInt(localRaw, 10);
    if (!isNaN(parsed)) displayValue = formatIndian(parsed);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
          ₹
        </span>
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pl-7 text-lg h-12 focus-visible:ring-brand-cyan transition-all", helperText ? "border-brand-cyan/40 pr-24" : "")}
          disabled={disabled}
        />
        {helperText && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs font-semibold bg-brand-cyan-light text-brand-cyan-dark px-2 py-1 rounded-md">
              {helperText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
