import React from 'react';
import { cn } from '@/lib/utils';

interface SegmentedToggleProps {
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  className?: string;
}

export function SegmentedToggle({ value, onChange, className }: SegmentedToggleProps) {
  return (
    <div className={cn("flex w-full sm:w-[240px] gap-2 p-1 rounded-xl bg-brand-card border border-brand-border", className)}>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "flex-1 h-11 rounded-lg text-sm font-semibold transition-all duration-200",
          value === true 
            ? "bg-brand-blue text-white shadow-md" 
            : "text-brand-muted hover:text-brand-darkText hover:bg-black/5"
        )}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "flex-1 h-11 rounded-lg text-sm font-semibold transition-all duration-200",
          value === false 
            ? "bg-brand-blue text-white shadow-md" 
            : "text-brand-muted hover:text-brand-darkText hover:bg-black/5"
        )}
      >
        No
      </button>
    </div>
  );
}
