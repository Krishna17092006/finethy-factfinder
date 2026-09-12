import React from 'react';

export function RiskSpectrumBar({ profile }: { profile: any }) {
  if (!profile) return null;

  const { capacityScore, toleranceScore, finalScore, capacityConstraint, gapInsight } = profile;

  const getBand = (score: number) => {
    if (score < 20) return "Conservative";
    if (score < 40) return "Moderately Conservative";
    if (score < 60) return "Balanced";
    if (score < 80) return "Moderately Aggressive";
    return "Aggressive";
  };

  const finalBand = getBand(finalScore);

  return (
    <div className="w-full space-y-6">
      {/* Primary Visual */}
      <div className="relative pt-6 pb-8">
        <div className="absolute top-0 w-full flex justify-between text-xs font-semibold text-brand-darkText px-1">
          <span className="opacity-0">.</span>
          <div 
            className="absolute -top-1 flex flex-col items-center transition-all duration-500 z-10"
            style={{ left: `${finalScore}%`, transform: 'translateX(-50%)' }}
          >
            <span className="font-bold whitespace-nowrap bg-white px-2 rounded text-brand-darkText border shadow-sm print:shadow-none print:border-gray-400">
              {finalScore} — {finalBand}
            </span>
            <div className="w-0.5 h-6 bg-slate-800 print:bg-black mt-1 shadow-[0_0_2px_rgba(255,255,255,0.8)]"></div>
          </div>
        </div>

        <div className="w-full h-7 rounded-full bg-gradient-to-r from-[#2f5aa8] via-[#00bbee] to-[#f08a0c] overflow-hidden mt-6 relative border border-slate-200 print:border-gray-500 print:shadow-none shadow-sm">
          {/* Print fallback logic isn't easily done with just gradients in all browsers, but the dark border on the marker helps */}
        </div>

        <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-brand-mutedText font-medium px-2">
          <span>Conservative</span>
          <span>Mod. Conservative</span>
          <span>Balanced</span>
          <span>Mod. Aggressive</span>
          <span>Aggressive</span>
        </div>

        <p className="text-center text-sm font-medium text-brand-darkText mt-4">
          {finalScore}% toward the aggressive end of the spectrum, {100 - finalScore}% toward the conservative end.
        </p>
      </div>

      {/* Secondary Bars */}
      <div className="space-y-4 max-w-2xl mx-auto bg-slate-50 p-5 rounded-xl border border-slate-200 print:bg-transparent print:border-gray-300">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-brand-darkText">Ability to take risk (Capacity): {capacityScore}</span>
          </div>
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300 print:border-gray-400">
            <div className="h-full bg-gradient-to-r from-[#2f5aa8] via-[#00bbee] to-[#f08a0c]" style={{ width: `${capacityScore}%` }}></div>
          </div>
          <p className="text-xs text-brand-mutedText mt-1.5">{capacityConstraint}</p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-brand-darkText">Willingness to take risk (Tolerance): {toleranceScore}</span>
          </div>
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300 print:border-gray-400">
            <div className="h-full bg-gradient-to-r from-[#2f5aa8] via-[#00bbee] to-[#f08a0c]" style={{ width: `${toleranceScore}%` }}></div>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-200 print:border-gray-300">
          <p className="text-sm font-bold text-brand-darkText">
            Allocation is set to the lower of the two: {finalScore} — {finalBand}.
          </p>
          <p className="text-sm text-brand-bodyText mt-2">
            {gapInsight}
          </p>
        </div>
      </div>
    </div>
  );
}
