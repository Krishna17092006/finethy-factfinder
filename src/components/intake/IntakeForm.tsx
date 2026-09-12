"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { INTAKE_SECTIONS } from '@/lib/types';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Save, WifiOff, Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

import { 
  SectionPersonal, 
  SectionIncome, 
  SectionAssets, 
  SectionLiabilities, 
  SectionInsurance, 
  SectionGoals, 
  SectionRiskTolerance1,
  SectionRiskTolerance2,
  SectionRiskTolerance3, 
  SectionWrapUp 
} from './SectionComponents';

export function IntakeForm({ token, initialData }: { token: string, initialData: any }) {
  const [data, setData] = useState<any>(initialData || {});
  
  // -1 represents the Welcome screen
  const [currentStep, setCurrentStep] = useState(
    initialData?.currentStep !== undefined ? initialData.currentStep : -1
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Prevent double submit
  const submitRef = useRef(false);

  // Active time tracking
  const [activeTimeSeconds, setActiveTimeSeconds] = useState(
    initialData?.activeTimeSeconds || 0
  );

  useEffect(() => {
    // Only track if form is not submitted
    if (initialData?.status === 'submitted' || showCelebration) return;

    const interval = setInterval(() => {
      if (document.hasFocus()) {
        setActiveTimeSeconds(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [initialData?.status, showCelebration]);

  const currentSection = currentStep >= 0 ? INTAKE_SECTIONS[currentStep] : null;
  const progressPercent = currentStep >= 0 ? (currentStep / INTAKE_SECTIONS.length) * 100 : 0;
  
  const getProgressCopy = () => {
    if (currentStep < 0) return "Let's begin!";
    if (progressPercent < 25) return "Great start!";
    if (progressPercent < 50) return "Keep going!";
    if (progressPercent < 75) return "Halfway there!";
    if (progressPercent < 90) return "Almost done!";
    return "Last few questions!";
  };
  
  const getEstimatedTime = () => {
    const remainingSteps = INTAKE_SECTIONS.length - Math.max(0, currentStep);
    return Math.max(1, Math.round((remainingSteps / INTAKE_SECTIONS.length) * 8));
  };

  // Offline grace & Autosave
  const saveStep = async (stepData: any, nextStep: number, retryCount = 0): Promise<boolean> => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/intake/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...stepData, currentStep: nextStep, activeTimeSeconds }),
      });
      if (!res.ok) throw new Error('Save failed');
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return true;
    } catch (e) {
      console.error(e);
      // Offline grace: retry up to 2 times
      if (retryCount < 2) {
        await new Promise(r => setTimeout(r, 1000));
        return saveStep(stepData, nextStep, retryCount + 1);
      } else {
        setSaveStatus('error');
        // We don't block the user, they can still proceed, we'll try saving again next time
        toast.warning('Working offline. Answers saved on your device.', { icon: <WifiOff className="w-4 h-4" /> });
        return false;
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < INTAKE_SECTIONS.length - 1) {
      // Don't wait strictly for save to finish to move UI, but trigger it
      saveStep(data, currentStep + 1);
      setCurrentStep((s: number) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep >= 0) {
      setCurrentStep((s: number) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (submitRef.current) return;
    
    if (!data.fullName || !data.mobile) {
      toast.error('Name and mobile are required (see Personal section)');
      return;
    }
    if (!data.consentGiven) {
      toast.error('Please provide consent (see Wrap Up section)');
      return;
    }

    submitRef.current = true;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/intake/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, activeTimeSeconds }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Submit failed');
      }
      
      // Trigger celebration
      setShowCelebration(true);
      setTimeout(() => {
        window.location.href = `/intake/${token}/success`;
      }, 2000);
      
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to submit form');
      submitRef.current = false;
      setIsSubmitting(false);
    }
  };

  const updateData = (updates: any) => {
    setData((prev: any) => ({ ...prev, ...updates }));
  };

  if (data.status === 'submitted' || showCelebration) {
    return (
      <div className="max-w-md mx-auto text-center py-20 flex flex-col items-center justify-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="h-24 w-24 bg-brand-health-green-bg rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="h-12 w-12 text-brand-health-green" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-brand-darkText"
        >
          {showCelebration ? "Perfect! Sending..." : "Already Submitted"}
        </motion.h2>
      </div>
    );
  }

  const renderSection = () => {
    switch (currentStep) {
      case -1: return (
        <div className="py-8 px-4 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-blue-light mb-4">
            <span className="text-3xl">🙏</span>
          </div>
          <h2 className="text-2xl font-bold text-brand-darkText">Namaste! Welcome to FINETHY.</h2>
          <p className="text-brand-bodyText text-lg leading-relaxed max-w-md mx-auto">
            This short form helps our team understand your financial picture before you meet. 
            Everything you share is strictly confidential.
          </p>
          <div className="p-4 bg-[#f8f9fa] rounded-xl text-sm text-brand-mutedText border border-brand-border inline-block text-left max-w-sm">
            <p>💡 <strong>Tip:</strong> Approximate answers are perfectly fine — no need to dig for exact documents right now.</p>
          </div>
        </div>
      );
      case 0: return <SectionPersonal data={data} updateData={updateData} />;
      case 1: return <SectionIncome data={data} updateData={updateData} />;
      case 2: return <SectionAssets data={data} updateData={updateData} />;
      case 3: return <SectionLiabilities data={data} updateData={updateData} />;
      case 4: return <SectionInsurance data={data} updateData={updateData} />;
      case 5: return <SectionGoals data={data} updateData={updateData} />;
      case 6: return <SectionRiskTolerance1 data={data} updateData={updateData} />;
      case 7: return <SectionRiskTolerance2 data={data} updateData={updateData} />;
      case 8: return <SectionRiskTolerance3 data={data} updateData={updateData} />;
      case 9: return <SectionWrapUp data={data} updateData={updateData} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full relative">
      
      {/* Sticky Header with Stepper */}
      {currentStep >= 0 && (
        <div className="sticky top-[73px] bg-white/90 backdrop-blur-md z-10 pb-4 pt-4 border-b border-slate-100 mb-6 rounded-b-xl px-4 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-brand-blue flex items-center gap-2">
              {currentSection?.icon} {currentSection?.label}
            </div>
            
            <div className="text-right flex items-center gap-2">
              {/* Autosave Indicator */}
              <AnimatePresence mode="wait">
                {saveStatus === 'saving' && (
                  <motion.div key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] flex items-center text-slate-400">
                    <Save className="w-3 h-3 mr-1 animate-pulse" /> saving...
                  </motion.div>
                )}
                {saveStatus === 'saved' && (
                  <motion.div key="saved" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] flex items-center text-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> saved
                  </motion.div>
                )}
                {saveStatus === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] flex items-center text-red-400">
                    <WifiOff className="w-3 h-3 mr-1" /> offline
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Horizontal Stepper */}
          <div className="flex items-center w-full overflow-x-auto py-2 px-1 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {INTAKE_SECTIONS.map((section, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <React.Fragment key={idx}>
                  {/* Node */}
                  <button 
                    onClick={() => {
                      saveStep(data, idx);
                      setCurrentStep(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={isSubmitting}
                    title={section.label}
                    className={cn(
                      "relative flex items-center justify-center shrink-0 w-8 h-8 rounded-full border-2 transition-all duration-300",
                      isCompleted ? "bg-brand-blue border-brand-blue text-white" : 
                      isCurrent ? "border-brand-blue text-brand-blue ring-4 ring-brand-blue/10 bg-white" : 
                      "border-slate-200 text-slate-400 bg-white hover:border-brand-blue/40"
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                  </button>
                  
                  {/* Line connecting nodes */}
                  {idx < INTAKE_SECTIONS.length - 1 && (
                    <div className={cn(
                      "flex-1 min-w-[20px] h-[2px] transition-colors duration-300",
                      isCompleted ? "bg-brand-blue" : "bg-slate-200"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Form Content */}
      <div className="bg-white sm:rounded-2xl sm:shadow-sm sm:border sm:border-brand-border p-6 mb-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="min-h-[40vh]"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col px-2 sm:px-0 mb-8 space-y-6">
        {currentStep === -1 ? (
          <div className="w-full">
            <Button 
              onClick={handleNext}
              className="w-full sm:w-auto h-12 px-8 bg-brand-orange hover:bg-[#d97700] text-white text-base shadow-md"
            >
              Let&apos;s begin
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between w-full">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isSubmitting}
                className="h-12 px-6 border-slate-300 text-slate-600 hover:bg-slate-50 w-[120px]"
              >
                Back
              </Button>
              
              {currentStep < INTAKE_SECTIONS.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="h-12 px-8 bg-brand-blue hover:bg-brand-blue-dark shadow-md w-[120px]"
                >
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !data.consentGiven}
                  className={cn("h-12 px-4 sm:px-8 shadow-md text-white font-medium transition-colors w-[140px] sm:w-auto", 
                    data.consentGiven 
                      ? "bg-health-green hover:bg-green-600" 
                      : "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2 w-full"><Send className="w-4 h-4 animate-bounce" /> Sending</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 w-full">Submit <CheckCircle2 className="w-4 h-4 hidden sm:inline" /></span>
                  )}
                </Button>
              )}
            </div>

          </>
        )}
      </div>
      
      {/* Privacy Reassurance */}
      <div className="text-center py-6 border-t border-slate-200 mt-6 mb-4">
        <p className="text-xs text-brand-mutedText flex items-center justify-center gap-1.5">
          <span className="text-brand-orange">🔒</span> Your information is encrypted and shared only with FINETHY LLP.
        </p>
      </div>
    </div>
  );
}
