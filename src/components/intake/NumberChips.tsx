import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface NumberChipsProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  className?: string;
  label?: string; // Optional internal label for screen readers
}

const CHIP_OPTIONS = [0, 1, 2, 3];

export function NumberChips({ value, onChange, className }: NumberChipsProps) {
  const [isFourPlus, setIsFourPlus] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Sync state with incoming value
  useEffect(() => {
    if (value === null || value === undefined) {
      setIsFourPlus(false);
      setInputValue("");
    } else if (value >= 4) {
      setIsFourPlus(true);
      setInputValue(value.toString());
    } else {
      setIsFourPlus(false);
      setInputValue("");
    }
  }, [value]);

  const handleChipClick = (num: number) => {
    setIsFourPlus(false);
    setInputValue("");
    onChange(num);
  };

  const handleFourPlusClick = () => {
    setIsFourPlus(true);
    // If they click 4+ and value isn't already >= 4, default it to 4 to prevent empty state returning null immediately
    if (value === null || value === undefined || value < 4) {
      setInputValue("4");
      onChange(4);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, ""); // strictly digits
    setInputValue(raw);
    
    if (raw === "") {
      onChange(null); // safely propagate null when cleared
    } else {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  return (
    <div className={cn("space-y-3 animate-in fade-in zoom-in-95", className)}>
      <div className="flex flex-wrap gap-2">
        {CHIP_OPTIONS.map((num) => {
          const isSelected = !isFourPlus && value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => handleChipClick(num)}
              className={cn(
                "h-11 min-w-[3rem] px-4 rounded-xl text-sm font-semibold transition-all duration-200 border",
                isSelected 
                  ? "bg-[#2f5aa8] text-white border-[#2f5aa8] shadow-md" 
                  : "bg-white text-brand-bodyText border-brand-border hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              {num}
            </button>
          );
        })}
        
        <button
          type="button"
          onClick={handleFourPlusClick}
          className={cn(
            "h-11 min-w-[3rem] px-4 rounded-xl text-sm font-semibold transition-all duration-200 border",
            isFourPlus
              ? "bg-[#2f5aa8] text-white border-[#2f5aa8] shadow-md" 
              : "bg-white text-brand-bodyText border-brand-border hover:bg-slate-50 hover:border-slate-300"
          )}
        >
          4+
        </button>
      </div>

      {isFourPlus && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <Input 
            type="text" 
            inputMode="numeric" 
            placeholder="Enter number" 
            className="w-32 h-11 focus-visible:ring-[#2f5aa8]"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
      )}
    </div>
  );
}
