import Link from "next/link";
import { FinethyHeader } from "@/components/brand/FinethyHeader";
import { Lock, Clock, Target } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <FinethyHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-[65vh]">
        <div className="max-w-4xl w-full text-center flex flex-col items-center pt-8 sm:pt-12">
          <h1 className="text-[28px] sm:text-[32px] lg:text-[44px] font-semibold text-brand-darkText tracking-tight leading-tight mb-6 sm:mb-8">
            Your Financial Review Starts Here
          </h1>
          
          <p className="text-[17px] sm:text-[18px] text-brand-bodyText max-w-[620px] mx-auto leading-relaxed mb-8 sm:mb-10">
            Share a few details about your finances so our team can prepare a personalised review ahead of your consultation. It takes about 5–7 minutes, and your information stays completely confidential.
          </p>
          
          <Link
            href="/intake"
            className="inline-flex items-center justify-center rounded-lg bg-brand-orange text-white px-8 py-3.5 text-base font-medium hover:bg-[#d97700] transition-colors shadow-sm mb-16 sm:mb-24"
          >
            Begin
          </Link>
          
          {/* Trust Row */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 mb-12 sm:mb-16 pt-10 border-t border-slate-100 max-w-4xl">
            <div className="flex flex-col items-center text-center space-y-3">
              <Lock className="w-5 h-5 text-brand-cyan" strokeWidth={2.5} />
              <h3 className="font-semibold text-brand-darkText text-[15px]">Confidential</h3>
              <p className="text-[14px] text-brand-bodyText leading-relaxed">Your information is encrypted and shared only with FINETHY.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <Clock className="w-5 h-5 text-brand-cyan" strokeWidth={2.5} />
              <h3 className="font-semibold text-brand-darkText text-[15px]">5–7 minutes</h3>
              <p className="text-[14px] text-brand-bodyText leading-relaxed">Short, simple questions. Approximate answers are fine.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <Target className="w-5 h-5 text-brand-cyan" strokeWidth={2.5} />
              <h3 className="font-semibold text-brand-darkText text-[15px]">Better prepared</h3>
              <p className="text-[14px] text-brand-bodyText leading-relaxed">Your consultation goes straight to what matters.</p>
            </div>
          </div>
          
          <div className="text-[13px] text-brand-mutedText">
            FINETHY LLP · AMFI-registered Mutual Fund Distributor · ARN-28883
          </div>
        </div>
      </main>
    </div>
  );
}
