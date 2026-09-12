"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface LocalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (val: string) => void;
  filter?: (val: string) => string;
  formatOnBlur?: (val: string) => string;
}

export function LocalInput({ 
  value, 
  onChange, 
  filter, 
  formatOnBlur,
  onBlur,
  onFocus,
  className,
  ...props 
}: LocalInputProps) {
  // Initialize strictly to "" never undefined
  const [localValue, setLocalValue] = useState<string>(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync incoming value only if we aren't focused
  // This prevents autosave re-renders from clobbering mid-typing
  useEffect(() => {
    if (!isFocused && value !== undefined && value !== null) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let nextVal = e.target.value;
    if (filter) {
      nextVal = filter(nextVal);
    }
    
    setLocalValue(nextVal);

    // Debounce pushing up to parent
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(nextVal);
    }, 800);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    // Clear debounce since we are doing an immediate update on blur
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    let finalVal = localValue;
    if (formatOnBlur) {
      finalVal = formatOnBlur(finalVal);
      setLocalValue(finalVal);
    }
    
    onChange(finalVal);
    
    if (onBlur) onBlur(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  return (
    <Input
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={cn("h-12 focus-visible:ring-brand-cyan transition-all", className)}
    />
  );
}
