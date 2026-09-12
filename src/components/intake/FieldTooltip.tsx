import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FieldTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger type="button" tabIndex={-1} className="ml-1.5 text-brand-mutedText hover:text-brand-blue transition-colors focus:outline-none">
          <Info className="w-4 h-4 inline" />
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-brand-blue-dark text-white border-none shadow-lg">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
