/* eslint-disable react/no-unescaped-entities */
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { LocalInput } from './LocalInput';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RupeeInput } from './RupeeInput';
import { FieldTooltip } from './FieldTooltip';
import { SegmentedToggle } from './SegmentedToggle';
import { NumberChips } from './NumberChips';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Plus, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { 
  MARITAL_STATUS_OPTIONS, DEPENDENT_TYPE_OPTIONS, OCCUPATION_TYPES,
  OTHER_INCOME_TYPES, HEALTH_INSURANCE_TYPES,
  GOAL_TYPES
} from '@/lib/types';

interface SectionProps {
  data: any;
  updateData: (updates: any) => void;
}

// Part 1: SectionPersonal
export function SectionPersonal({ data, updateData }: SectionProps) {
  const [hasChildren, setHasChildren] = React.useState(data.childrenCount > 0);
  const [showDependentsAdjust, setShowDependentsAdjust] = React.useState(data.totalDependents !== undefined && data.totalDependents !== null);

  // Derive dependents on the fly for the confirmation chip
  const derivedDependents = React.useMemo(() => {
    let count = 0;
    if (data.maritalStatus === 'Married' && !data.spouseEarning) count += 1;
    count += (data.childrenCount || 0);
    if (data.dependentTypes) {
      try {
        const types = JSON.parse(data.dependentTypes);
        if (Array.isArray(types)) {
          const validTypes = types.filter((t: string) => t !== 'None');
          count += validTypes.length;
        }
      } catch (e) {}
    }
    return count;
  }, [data.maritalStatus, data.spouseEarning, data.childrenCount, data.dependentTypes]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">Let's start with the basics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 relative">
          <Label htmlFor="fullName">Full Name *</Label>
          <LocalInput id="fullName" className="h-12 focus-visible:ring-brand-cyan" value={data.fullName || ''} onChange={val => updateData({ fullName: val })} />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="mobile">Mobile Number *</Label>
          <LocalInput id="mobile" type="tel" inputMode="numeric" maxLength={10} placeholder="10 digits" className="h-12 focus-visible:ring-brand-cyan" value={data.mobile || ''} onChange={val => updateData({ mobile: val })} filter={val => val.replace(/[^0-9]/g, '')} />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="email">Email</Label>
          <LocalInput id="email" type="email" inputMode="email" className="h-12 focus-visible:ring-brand-cyan" value={data.email || ''} onChange={val => updateData({ email: val })} />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="city">City</Label>
          <LocalInput id="city" className="h-12 focus-visible:ring-brand-cyan" value={data.city || ''} onChange={val => updateData({ city: val })} />
        </div>
        <div className="space-y-2 relative">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <IMaskInput
            id="dateOfBirth"
            mask="00/00/0000"
            placeholder="DD/MM/YYYY"
            overwrite={true}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 transition-all"
            value={data.dateOfBirth || ''}
            onAccept={(value) => updateData({ dateOfBirth: value })}
          />
        </div>
        
        <div className="space-y-2 relative">
          <Label htmlFor="maritalStatus">Marital Status</Label>
          <Select value={data.maritalStatus || ''} onValueChange={v => updateData({ maritalStatus: v })}>
            <SelectTrigger className="h-12 focus-visible:ring-brand-cyan"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.maritalStatus === 'Married' && (
        <div className="p-5 bg-slate-50/50 rounded-xl space-y-4 border border-brand-border">
          <h4 className="font-semibold text-brand-darkText">Spouse Details</h4>
          <div className="space-y-2">
            <Label className="text-brand-darkText">My spouse is also earning</Label>
            <SegmentedToggle 
              value={data.spouseEarning} 
              onChange={c => {
                updateData({ spouseEarning: c });
                if (!c) updateData({ spouseIncome: null });
              }} 
            />
          </div>
          {data.spouseEarning && (
            <div className="space-y-2 relative">
              <Label>Spouse Annual Income</Label>
              <RupeeInput value={data.spouseIncome} onChange={v => updateData({ spouseIncome: v })} />
            </div>
          )}
        </div>
      )}

      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <Label className="text-brand-darkText">I have children</Label>
          <SegmentedToggle 
            value={hasChildren} 
            onChange={(c) => {
              setHasChildren(c);
              if (!c) updateData({ childrenCount: 0 });
            }} 
          />
          {hasChildren && (
            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
              <Label>How many?</Label>
              <NumberChips 
                value={data.childrenCount} 
                onChange={v => updateData({ childrenCount: v || 0 })} 
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Other Dependents (e.g. parents, relatives)</Label>
          <div className="flex flex-wrap gap-2">
            {DEPENDENT_TYPE_OPTIONS.map(opt => {
              const types = data.dependentTypes ? JSON.parse(data.dependentTypes) : [];
              const isSelected = types.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${isSelected ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-brand-bodyText border-brand-border hover:bg-slate-50'}`}
                  onClick={() => {
                    let newTypes = isSelected ? types.filter((t: string) => t !== opt) : [...types, opt];
                    if (opt === 'None' && !isSelected) {
                      newTypes = ['None'];
                    } else if (opt !== 'None') {
                      newTypes = newTypes.filter((t: string) => t !== 'None');
                    }
                    updateData({ dependentTypes: JSON.stringify(newTypes) });
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Derived Dependents Chip */}
        {derivedDependents > 0 && !showDependentsAdjust && (
          <div className="p-4 bg-brand-cyan-light/30 border border-brand-cyan/20 rounded-xl flex items-center justify-between">
            <p className="text-sm text-brand-darkText">
              Based on what you've shared, you have <strong>{derivedDependents} dependent{derivedDependents > 1 ? 's' : ''}</strong>. Sound right?
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateData({ totalDependents: derivedDependents })}>Yes</Button>
              <Button size="sm" variant="outline" onClick={() => setShowDependentsAdjust(true)}>Adjust</Button>
            </div>
          </div>
        )}

        {showDependentsAdjust && (
          <div className="space-y-2 relative animate-in fade-in zoom-in-95">
            <Label>Total Dependents</Label>
            <NumberChips 
              value={data.totalDependents} 
              onChange={v => updateData({ totalDependents: v || 0 })} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Part 2: SectionIncome
export function SectionIncome({ data, updateData }: SectionProps) {
  const name = data.fullName?.split(' ')[0] || 'there';

  const monthlyIncome = (data.grossAnnualIncome || 0) / 12;
  // EMIs are derived from the liability grid, but on this screen we just use the raw variables or wait till the next screen.
  // Wait, the new flow says: Liabilities grid is AFTER Assets grid. And the Surplus follow-up is in the Liabilities grid.
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">Thanks, {name}! Let's talk income.</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 relative">
          <Label>Primary Occupation</Label>
          <Select value={data.occupationType || ''} onValueChange={v => {
            updateData({ occupationType: v });
            if (v !== 'Other') updateData({ occupationOther: null });
          }}>
            <SelectTrigger className="h-12 focus-visible:ring-brand-cyan"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {OCCUPATION_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        {data.occupationType === 'Other' && (
          <div className="space-y-2 relative animate-in fade-in slide-in-from-top-2">
            <Label>Please specify your occupation</Label>
            <LocalInput 
              value={data.occupationOther || ''} 
              onChange={val => updateData({ occupationOther: val })}
              placeholder="e.g. Freelance Designer" 
              className="h-12 focus-visible:ring-brand-cyan" 
            />
          </div>
        )}
        
        <div className="space-y-2 relative">
          <div className="flex justify-between relative">
            <Label>Gross Annual Income (before taxes)</Label>
          </div>
          <RupeeInput value={data.grossAnnualIncome} onChange={v => updateData({ grossAnnualIncome: v })} />
        </div>
      </div>

      <div className="p-6 bg-brand-cyan-light/30 rounded-xl space-y-6 border border-brand-cyan/20">
        <h4 className="font-semibold text-brand-darkText flex items-center gap-2">
          <span>🔄</span> Monthly Expenses
        </h4>
        <div className="space-y-2 relative">
          <div className="flex justify-between relative">
            <Label>Average Monthly Household Expenses</Label>
          </div>
          <RupeeInput value={data.monthlyExpenses} onChange={v => updateData({ monthlyExpenses: v })} placeholder="e.g. 30,000" />
          <p className="text-xs text-brand-mutedText mt-1">Groceries, utilities, fuel, lifestyle (excluding EMIs)</p>
        </div>
      </div>
    </div>
  );
}

// Part 3: SectionAssets (Single Grid)
export function SectionAssets({ data, updateData }: SectionProps) {
  const categories = [
    { id: 'bankSavingsFD', label: 'Bank Savings & FDs', valueKey: 'bankSavingsFDValue', hasKey: 'hasBankSavingsFD' },
    { id: 'mutualFunds', label: 'Mutual Funds', valueKey: 'mutualFundsValue', hasKey: 'hasMutualFunds' },
    { id: 'stocks', label: 'Stocks (Direct Equity)', valueKey: 'stocksValue', hasKey: 'hasStocks' },
    { id: 'retirementAccounts', label: 'EPF / PPF / NPS', valueKey: 'retirementAccountsValue', hasKey: 'hasRetirementAccounts' },
    { id: 'investmentProperty', label: 'Real Estate (other than home)', valueKey: 'investmentPropertyValue', hasKey: 'hasInvestmentProperty' },
    { id: 'ownHouse', label: 'Your Home (if owned)', valueKey: 'ownHouseValue', hasKey: 'hasOwnHouse_temp' }, // We use a temp toggle, but set ownHouseValue directly
    { id: 'gold', label: 'Gold & Jewellery', valueKey: 'goldValue', hasKey: 'hasGold' },
    { id: 'otherAssets', label: 'Anything else (business, crypto, etc.)', valueKey: 'otherAssetsValue', hasKey: 'hasOtherAssets', descKey: 'otherAssetsDescription' }
  ];

  const totalAssets = categories.reduce((sum, cat) => {
    if (cat.id === 'retirementAccounts' && data.hasRetirementAccounts) {
      return sum + (data.epfValue || 0) + (data.ppfValue || 0) + (data.npsValue || 0);
    }
    return sum + (data[cat.valueKey] || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">Your Assets</h3>
        <p className="text-sm text-brand-mutedText">Select what you own and provide a rough value.</p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isToggled = data[cat.hasKey];
          return (
            <div key={cat.id} className={`border rounded-xl p-4 transition-all ${isToggled === true ? 'border-brand-cyan bg-brand-cyan-light/10 shadow-sm' : 'border-brand-border bg-white'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Label className="font-semibold text-brand-darkText">{cat.label}</Label>
                <SegmentedToggle 
                  value={isToggled} 
                  onChange={(c: boolean) => {
                    updateData({ [cat.hasKey]: c });
                    if (!c) {
                      updateData({ [cat.valueKey]: null });
                      if (cat.descKey) updateData({ [cat.descKey]: '' });
                      if (cat.id === 'retirementAccounts') {
                        updateData({ epfValue: null, ppfValue: null, npsValue: null });
                      }
                    }
                  }} 
                />
              </div>
              
              {isToggled && (
                <div className="mt-4 pl-7 space-y-4 animate-in fade-in zoom-in-95">
                  {cat.id === 'retirementAccounts' ? (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="hasEpf" 
                              checked={data.epfValue !== undefined && data.epfValue !== null} 
                              onCheckedChange={c => {
                                if (c) updateData({ epfValue: 0 });
                                else updateData({ epfValue: null });
                              }}
                            />
                            <Label htmlFor="hasEpf">EPF</Label>
                          </div>
                          {(data.epfValue !== undefined && data.epfValue !== null) && (
                            <RupeeInput value={data.epfValue} onChange={v => updateData({ epfValue: v })} placeholder="e.g. 5,00,000" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="hasPpf" 
                              checked={data.ppfValue !== undefined && data.ppfValue !== null} 
                              onCheckedChange={c => {
                                if (c) updateData({ ppfValue: 0 });
                                else updateData({ ppfValue: null });
                              }}
                            />
                            <Label htmlFor="hasPpf">PPF</Label>
                          </div>
                          {(data.ppfValue !== undefined && data.ppfValue !== null) && (
                            <RupeeInput value={data.ppfValue} onChange={v => updateData({ ppfValue: v })} placeholder="e.g. 2,00,000" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox 
                              id="hasNps" 
                              checked={data.npsValue !== undefined && data.npsValue !== null} 
                              onCheckedChange={c => {
                                if (c) updateData({ npsValue: 0 });
                                else updateData({ npsValue: null });
                              }}
                            />
                            <Label htmlFor="hasNps">NPS</Label>
                          </div>
                          {(data.npsValue !== undefined && data.npsValue !== null) && (
                            <RupeeInput value={data.npsValue} onChange={v => updateData({ npsValue: v })} placeholder="e.g. 3,00,000" />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs text-brand-mutedText">Approximate Value</Label>
                      <RupeeInput value={data[cat.valueKey]} onChange={v => updateData({ [cat.valueKey]: v })} />
                    </div>
                  )}
                  {cat.descKey && (
                    <div className="space-y-2">
                      <Label className="text-xs text-brand-mutedText">Description</Label>
                      <LocalInput className="h-10 focus-visible:ring-brand-cyan" value={data[cat.descKey] || ''} onChange={val => updateData({ [cat.descKey]: val })} placeholder="e.g. 30% share in business" />
                    </div>
                  )}
                  {cat.id === 'mutualFunds' && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                      <Label className="text-sm">Roughly what % of this is in Equity (Stock Market) vs Debt?</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-brand-mutedText w-16">Equity</span>
                        <input type="range" min="0" max="100" step="10" className="flex-1 accent-brand-orange" value={data.mfEquityPercent || 50} onChange={e => updateData({ mfEquityPercent: parseInt(e.target.value) })} />
                        <span className="text-sm font-semibold w-12 text-right">{data.mfEquityPercent || 50}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 p-4 bg-[#2d3340] text-white rounded-xl shadow-lg flex justify-between items-center">
        <span className="font-medium">Total Assets</span>
        <span className="text-xl font-bold">₹{totalAssets.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

// Part 4: SectionLiabilities
export function SectionLiabilities({ data, updateData }: SectionProps) {
  const categories = [
    { id: 'homeLoan', label: 'Home Loan', valueKey: 'homeLoanOutstanding', emiKey: 'homeLoanEMI', hasKey: 'hasHomeLoan' },
    { id: 'carLoan', label: 'Vehicle Loan', valueKey: 'carLoanOutstanding', emiKey: 'carLoanEMI', hasKey: 'hasCarLoan' },
    { id: 'personalLoan', label: 'Personal Loan', valueKey: 'personalLoanOutstanding', emiKey: 'personalLoanEMI', hasKey: 'hasPersonalLoan' },
    { id: 'creditCard', label: 'Credit Card Outstanding', valueKey: 'creditCardOutstanding', hasKey: 'hasCreditCardDebt', noEmi: true },
    { id: 'otherLoans', label: 'Education / Gold / Other', valueKey: 'otherLoansOutstanding', emiKey: 'otherLoansEMI', hasKey: 'hasOtherLoans', descKey: 'otherLoansDescription' }
  ];

  const totalOutstanding = categories.reduce((sum, cat) => sum + (data[cat.valueKey] || 0), 0);
  const totalEMIs = categories.reduce((sum, cat) => sum + (cat.emiKey ? (data[cat.emiKey] || 0) : 0), 0);

  const monthlyIncome = (data.grossAnnualIncome || 0) / 12;
  const derivedSurplus = monthlyIncome - (data.monthlyExpenses || 0) - totalEMIs;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">Your Liabilities</h3>
        <div className="flex justify-between items-center">
          <p className="text-sm text-brand-mutedText">Select any outstanding loans.</p>
          <Button variant="outline" size="sm" onClick={() => {
            categories.forEach(cat => {
              updateData({ [cat.hasKey]: false, [cat.valueKey]: null });
              if (cat.emiKey) updateData({ [cat.emiKey]: null });
            });
          }}>I have no loans</Button>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isToggled = data[cat.hasKey];
          return (
            <div key={cat.id} className={`border rounded-xl p-4 transition-all ${isToggled === true ? 'border-brand-orange/30 bg-orange-50/30 shadow-sm' : 'border-brand-border bg-white'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Label className="font-semibold text-brand-darkText">{cat.label}</Label>
                <SegmentedToggle 
                  value={isToggled} 
                  onChange={(c: boolean) => {
                    updateData({ [cat.hasKey]: c });
                    if (!c) {
                      updateData({ [cat.valueKey]: null });
                      if (cat.emiKey) updateData({ [cat.emiKey]: null });
                      if (cat.descKey) updateData({ [cat.descKey]: '' });
                    }
                  }} 
                />
              </div>
              
              {isToggled && (
                <div className="mt-4 pl-7 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-brand-mutedText">Outstanding Amount</Label>
                      <RupeeInput value={data[cat.valueKey]} onChange={v => updateData({ [cat.valueKey]: v })} />
                    </div>
                    {!cat.noEmi && (
                      <div className="space-y-2">
                        <Label className="text-xs text-brand-mutedText">Monthly EMI</Label>
                        <RupeeInput value={data[cat.emiKey!]} onChange={v => updateData({ [cat.emiKey!]: v })} />
                      </div>
                    )}
                  </div>
                  {cat.descKey && (
                    <div className="space-y-2">
                      <Label className="text-xs text-brand-mutedText">Description</Label>
                      <LocalInput className="h-10 focus-visible:ring-brand-cyan" value={data[cat.descKey] || ''} onChange={v => updateData({ [cat.descKey as string]: v })} placeholder="e.g. Gold loan" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 p-4 bg-[#2d3340] text-white rounded-xl shadow-lg grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400">Total EMIs</p>
          <p className="font-bold">₹{totalEMIs.toLocaleString('en-IN')}/mo</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total Outstanding</p>
          <p className="font-bold">₹{totalOutstanding.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {derivedSurplus > 0 && (
        <div className="mt-8 p-6 bg-brand-cyan-light/30 border border-brand-cyan/20 rounded-xl space-y-4 animate-in fade-in zoom-in-95">
          <h4 className="font-semibold text-brand-darkText">Surplus Check</h4>
          <p className="text-sm text-brand-bodyText">
            Based on your income, expenses, and EMIs, you have a rough monthly surplus of <strong>₹{derivedSurplus.toLocaleString('en-IN')}</strong>. 
            Of this amount, roughly how much are you actually investing each month?
          </p>
          <RupeeInput value={data.monthlySavings} onChange={v => updateData({ monthlySavings: v })} />
        </div>
      )}
    </div>
  );
}

// Part 5: SectionInsurance
export function SectionInsurance({ data, updateData }: SectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">Insurance & Protection</h3>
        <p className="text-sm text-brand-mutedText">How is your family protected?</p>
      </div>

      <div className="space-y-6">
        {/* Term Insurance */}
        <div className="border border-brand-border rounded-xl p-4 bg-white transition-all hover:border-brand-cyan/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <Label className="font-semibold text-brand-darkText">Pure Term Life Insurance</Label>
            <SegmentedToggle 
              value={data.hasTermInsurance} 
              onChange={c => {
                updateData({ hasTermInsurance: c });
                if (!c) updateData({ termInsuranceCover: null });
              }} 
            />
          </div>
          {data.hasTermInsurance && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label className="text-sm">Total Cover Amount (Death Benefit)</Label>
              <RupeeInput value={data.termInsuranceCover} onChange={v => updateData({ termInsuranceCover: v })} />
            </div>
          )}
        </div>

        {/* Health Insurance */}
        <div className="border border-brand-border rounded-xl p-4 bg-white transition-all hover:border-brand-cyan/50">
          <Label className="font-semibold text-brand-darkText mb-4 block">Health Insurance / Mediclaim</Label>
          <div className="space-y-4">
            <RadioGroup 
              value={data.healthInsuranceType || ''} 
              onValueChange={v => updateData({ healthInsuranceType: v })}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {HEALTH_INSURANCE_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-slate-50">
                  <RadioGroupItem value={type} id={`health-${type}`} className="text-brand-orange" />
                  <Label htmlFor={`health-${type}`} className="cursor-pointer flex-1">{type}</Label>
                </div>
              ))}
            </RadioGroup>

            {data.healthInsuranceType && data.healthInsuranceType !== 'None' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-2">
                <Label className="text-sm">Total Cover Amount (Base + Super Top-up)</Label>
                <RupeeInput value={data.healthInsuranceCover} onChange={v => updateData({ healthInsuranceCover: v })} />
              </div>
            )}
          </div>
        </div>

        {/* Traditional Insurance */}
        <div className="border border-brand-border rounded-xl p-4 bg-white transition-all hover:border-brand-cyan/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <Label className="font-semibold text-brand-darkText">Traditional Policies (LIC, ULIPs, Money-back)</Label>
            <SegmentedToggle 
              value={data.hasTraditionalInsurance} 
              onChange={c => {
                updateData({ hasTraditionalInsurance: c });
                if (!c) updateData({ traditionalInsuranceCover: null, traditionalInsurancePremium: null });
              }} 
            />
          </div>
          {data.hasTraditionalInsurance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label className="text-sm">Total Cover Amount</Label>
                <RupeeInput value={data.traditionalInsuranceCover} onChange={v => updateData({ traditionalInsuranceCover: v })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Annual Premium Paid</Label>
                <RupeeInput value={data.traditionalInsurancePremium} onChange={v => updateData({ traditionalInsurancePremium: v })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Part 6: SectionGoals
export function SectionGoals({ data, updateData }: SectionProps) {
  const selectedGoals: string[] = data.selectedGoals ? JSON.parse(data.selectedGoals) : [];
  const goalDetails: any = data.goalDetails ? JSON.parse(data.goalDetails) : {};
  const currentYear = new Date().getFullYear();

  const handleToggle = (goal: string) => {
    let newGoals;
    if (selectedGoals.includes(goal)) {
      newGoals = selectedGoals.filter(g => g !== goal);
    } else {
      newGoals = [...selectedGoals, goal];
    }
    updateData({ selectedGoals: JSON.stringify(newGoals) });
  };

  const handleDetailChange = (goal: string, field: string, value: any) => {
    const newDetails = { ...goalDetails };
    if (!newDetails[goal]) newDetails[goal] = {};
    newDetails[goal][field] = value;
    updateData({ goalDetails: JSON.stringify(newDetails) });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">Your Goals</h3>
        <p className="text-sm text-brand-mutedText">Select what you are saving for, drag to rank them by priority, and provide details.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {GOAL_TYPES.map(goal => (
          <button
            key={goal}
            type="button"
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${selectedGoals.includes(goal) ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-brand-bodyText border-brand-border hover:bg-slate-50'}`}
            onClick={() => handleToggle(goal)}
          >
            {selectedGoals.includes(goal) ? '✓ ' : ''}{goal}
          </button>
        ))}
      </div>

      {selectedGoals.length > 0 && (
        <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
          <Label className="text-base font-semibold text-brand-darkText">Rank & Details (Top is highest priority)</Label>
          <Reorder.Group axis="y" values={selectedGoals} onReorder={(newOrder) => updateData({ selectedGoals: JSON.stringify(newOrder) })} className="space-y-3">
            {selectedGoals.map((goal, idx) => (
              <Reorder.Item key={goal} value={goal} className="border border-brand-border rounded-xl p-4 bg-white flex flex-col md:flex-row gap-4 md:items-center shadow-sm relative group cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-3 w-full md:w-1/3">
                  <div className="w-6 h-6 flex-shrink-0 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  <span className="font-semibold text-brand-darkText">{goal}</span>
                </div>
                
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {goal === 'Retirement' ? (
                    <div className="space-y-1">
                      <Label className="text-xs">Target Retirement Age</Label>
                      <LocalInput 
                        type="text" 
                        inputMode="numeric" 
                        className="h-10 focus-visible:ring-brand-cyan" 
                        value={data.retirementAge || ''} 
                        onChange={v => {
                          const raw = v.replace(/[^0-9]/g, '');
                          updateData({ retirementAge: raw === '' ? null : parseInt(raw, 10) });
                        }} 
                        placeholder="e.g. 60"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs">Target Year</Label>
                      <Select value={goalDetails[goal]?.targetYear?.toString() || ''} onValueChange={v => handleDetailChange(goal, 'targetYear', parseInt(v))}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 30}).map((_, i) => (
                            <SelectItem key={i} value={(currentYear + i).toString()}>{currentYear + i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Approximate Target Amount</Label>
                    <RupeeInput 
                      value={goalDetails[goal]?.targetAmount} 
                      onChange={v => handleDetailChange(goal, 'targetAmount', v)}
                      placeholder="Amount"
                    />
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}

// Part 7: Risk Tolerance 1 (Reaction to loss)
export function SectionRiskTolerance1({ data, updateData }: SectionProps) {
  const optionsQ1 = [
    { v: 5, l: "Invest more while prices are low" },
    { v: 4, l: "Hold and wait it out" },
    { v: 3, l: "Hold, but check it constantly" },
    { v: 2, l: "Sell some to limit further damage" },
    { v: 1, l: "Sell everything and step away" }
  ];
  
  const optionsQ3 = [
    { v: 5, l: "Invested more" },
    { v: 4, l: "Held everything, changed nothing" },
    { v: 3, l: "Held, but stopped my SIPs" },
    { v: 2, l: "Sold some investments" },
    { v: 1, l: "Sold most or all of it" },
    { v: 3, l: "I wasn't investing then", extra: "neutral" } // Extra tag mapped conceptually
  ];

  const optionsQ4 = [
    { v: 5, l: "A fall wouldn't affect my sleep" },
    { v: 4, l: "Around 30% or more" },
    { v: 3, l: "Around 20%" },
    { v: 2, l: "Around 10%" },
    { v: 1, l: "Any fall at all would worry me" }
  ];

  const optionsQ5 = [
    { v: 5, l: "As long as it takes — I judge over decades" },
    { v: 4, l: "Around 5 years" },
    { v: 3, l: "Around 3 years" },
    { v: 2, l: "Around 1 year" },
    { v: 1, l: "A few months at most" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">How you think about money</h3>
        <p className="text-sm text-brand-mutedText">A few questions about how you think about money. There are no right answers — honest ones are the most useful.</p>
      </div>

      {/* Q1 */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-brand-darkText">Q1. Your ₹10,00,000 investment falls to ₹8,00,000 in three months. What do you do?</Label>
        <RadioGroup value={data.riskQ1?.toString() || ''} onValueChange={v => updateData({ riskQ1: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ1.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ1 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q1-${opt.v}`} className={data.riskQ1 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q1-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q2 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q2. Imagine you are investing for one year. Which of these scenarios are you most comfortable with?</Label>
        <p className="text-xs text-brand-mutedText">There is no right answer. Choose the trade-off you could handle without losing sleep.</p>
        <RadioGroup value={data.riskQ2?.toString() || ''} onValueChange={v => updateData({ riskQ2: parseInt(v) })} className="space-y-3 mt-4">
          {[
            { id: 1, text: 'A portfolio that could gain up to 6% or lose up to 1%' },
            { id: 2, text: 'A portfolio that could gain up to 12% or lose up to 6%' },
            { id: 3, text: 'A portfolio that could gain up to 20% or lose up to 12%' },
            { id: 4, text: 'A portfolio that could gain up to 30% or lose up to 22%' },
            { id: 5, text: 'A portfolio that could gain up to 40% or lose up to 35%' }
          ].map(opt => (
            <div key={opt.id} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ2 === opt.id ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.id.toString()} id={`q2-${opt.id}`} className={data.riskQ2 === opt.id ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q2-${opt.id}`} className="font-normal cursor-pointer w-full">{opt.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q3 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q3. During the market crash of March 2020, what did you actually do?</Label>
        <p className="text-xs text-brand-mutedText">If you don't remember exactly, choose what's closest.</p>
        <RadioGroup 
          value={data.riskQ3 !== undefined ? optionsQ3.findIndex(o => o.v === data.riskQ3 && (o.extra === 'neutral') === !!data.riskQ3_neutral).toString() : ''} 
          onValueChange={idxStr => {
            const opt = optionsQ3[parseInt(idxStr, 10)];
            if (opt) updateData({ riskQ3: opt.v, riskQ3_neutral: opt.extra === 'neutral' });
          }} 
          className="space-y-3 mt-4"
        >
          {optionsQ3.map((opt, idx) => (
            <div key={idx} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ3 === opt.v && (opt.extra === 'neutral') === !!data.riskQ3_neutral ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={idx.toString()} id={`q3-${idx}`} className={data.riskQ3 === opt.v && (opt.extra === 'neutral') === !!data.riskQ3_neutral ? 'text-white border-white' : 'text-brand-orange'} onClick={() => updateData({ riskQ3: opt.v, riskQ3_neutral: opt.extra === 'neutral' })} />
              <Label htmlFor={`q3-${idx}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q4 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q4. How far would your investments have to fall before you lost sleep over it?</Label>
        <RadioGroup value={data.riskQ4?.toString() || ''} onValueChange={v => updateData({ riskQ4: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ4.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ4 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q4-${opt.v}`} className={data.riskQ4 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q4-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q5 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q5. After a bad year, how long would you give an investment to recover before giving up on it?</Label>
        <RadioGroup value={data.riskQ5?.toString() || ''} onValueChange={v => updateData({ riskQ5: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ5.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ5 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q5-${opt.v}`} className={data.riskQ5 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q5-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

// Part 7b: Risk Tolerance 2 (Trade-offs)
export function SectionRiskTolerance2({ data, updateData }: SectionProps) {
  const optionsQ6 = [
    { v: 1, l: "I want to keep my money completely safe, even if returns are low" },
    { v: 2, l: "I want steady, small returns with very little risk" },
    { v: 3, l: "I want a balance between moderate growth and safety" },
    { v: 4, l: "I want strong growth and can accept significant market drops" },
    { v: 5, l: "I want maximum possible growth and can stomach extreme volatility" }
  ];

  const optionsQ7 = [
    { v: 1, l: "Always protecting my money, even if it means missing out on growth" },
    { v: 2, l: "Mostly protecting my money, with a small focus on growth" },
    { v: 3, l: "An equal balance of protection and growth" },
    { v: 4, l: "Mostly growing my wealth, even if it means taking on risk" },
    { v: 5, l: "Maximizing growth above all else, regardless of the risk" }
  ];

  const optionsQ8 = [
    { v: 1, l: "Keep it totally safe in a bank FD or savings account" },
    { v: 2, l: "Mostly safe debt funds, with a tiny bit in the stock market" },
    { v: 3, l: "A balanced 50-50 mix of safe debt funds and the stock market" },
    { v: 4, l: "Mostly stock market (equity funds) for growth" },
    { v: 5, l: "Entirely stock market, maybe even a few aggressive bets" }
  ];

  const optionsQ9 = [
    { v: 5, l: "Absolutely, I don't mind locking my money away for better returns" },
    { v: 4, l: "Yes, I'd do it for a large portion of my money" },
    { v: 3, l: "Yes, but only for a small portion of my money" },
    { v: 2, l: "Probably not, I prefer having access to my money" },
    { v: 1, l: "No way, I need my money to be easily available" }
  ];

  const optionsQ10 = [
    { v: 5, l: "Comfortable, if I believe in it" },
    { v: 4, l: "Acceptable for a while" },
    { v: 3, l: "Slightly uneasy" },
    { v: 2, l: "I'd want to reduce it" },
    { v: 1, l: "I'd never allow that" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">How you think about money (2/3)</h3>
      </div>

      {/* Q6 */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-brand-darkText">Q6. Which statement best describes your primary goal for investing?</Label>
        <RadioGroup value={data.riskQ6?.toString() || ''} onValueChange={v => updateData({ riskQ6: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ6.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ6 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q6-${opt.v}`} className={data.riskQ6 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q6-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q7 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q7. When investing, which is your bigger priority: protecting your money from losses, or growing your wealth?</Label>
        <RadioGroup value={data.riskQ7?.toString() || ''} onValueChange={v => updateData({ riskQ7: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ7.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ7 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q7-${opt.v}`} className={data.riskQ7 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q7-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q8 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q8. You just received an unexpected ₹20 Lakh bonus. Where would you invest most of it?</Label>
        <RadioGroup value={data.riskQ8?.toString() || ''} onValueChange={v => updateData({ riskQ8: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ8.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ8 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q8-${opt.v}`} className={data.riskQ8 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q8-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q9 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q9. If an investment promised much higher returns but locked your money away for 5 years, would you do it?</Label>
        <RadioGroup value={data.riskQ9?.toString() || ''} onValueChange={v => updateData({ riskQ9: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ9.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ9 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q9-${opt.v}`} className={data.riskQ9 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q9-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q10 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q10. How would you feel about a single investment making up 30% of your portfolio?</Label>
        <RadioGroup value={data.riskQ10?.toString() || ''} onValueChange={v => updateData({ riskQ10: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ10.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ10 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q10-${opt.v}`} className={data.riskQ10 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q10-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

// Part 7c: Risk Tolerance 3 (Habits & Knowledge)
export function SectionRiskTolerance3({ data, updateData }: SectionProps) {
  const optionsQ11 = [
    { v: 5, l: "Once a year or less" },
    { v: 4, l: "Every few months" },
    { v: 3, l: "Monthly" },
    { v: 2, l: "Weekly" },
    { v: 1, l: "Daily" }
  ];

  const optionsQ12 = [
    { v: 5, l: "I understand market cycles and volatility well" },
    { v: 4, l: "Reasonably good" },
    { v: 3, l: "Basic" },
    { v: 2, l: "Limited" },
    { v: 1, l: "I'm starting from scratch" }
  ];

  const optionsQ13 = [
    { v: 5, l: "Research thoroughly, then decide myself" },
    { v: 4, l: "Research, then confirm with an advisor" },
    { v: 3, l: "Rely mainly on my advisor's judgment" },
    { v: 2, l: "Ask family or friends" },
    { v: 1, l: "Go with my gut, or postpone deciding" }
  ];

  const optionsQ14 = [
    { v: 5, l: "This is normal — stay the course" },
    { v: 4, l: "Ask for context, but stay invested" },
    { v: 3, l: "Ask whether we should change something" },
    { v: 2, l: "Ask to move to something safer" },
    { v: 1, l: "Lose confidence in the recommendation" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-semibold text-brand-darkText">How you think about money (3/3)</h3>
      </div>

      {/* Q11 */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-brand-darkText">Q11. How often would you check your investments?</Label>
        <RadioGroup value={data.riskQ11?.toString() || ''} onValueChange={v => updateData({ riskQ11: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ11.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ11 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q11-${opt.v}`} className={data.riskQ11 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q11-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q12 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q12. How would you describe your understanding of how markets work?</Label>
        <RadioGroup value={data.riskQ12?.toString() || ''} onValueChange={v => updateData({ riskQ12: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ12.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ12 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q12-${opt.v}`} className={data.riskQ12 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q12-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q13 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q13. How do you usually make financial decisions?</Label>
        <RadioGroup value={data.riskQ13?.toString() || ''} onValueChange={v => updateData({ riskQ13: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ13.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ13 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q13-${opt.v}`} className={data.riskQ13 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q13-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q14 */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <Label className="text-base font-semibold text-brand-darkText">Q14. An investment your advisor recommended is down 15% after one year. Your reaction?</Label>
        <RadioGroup value={data.riskQ14?.toString() || ''} onValueChange={v => updateData({ riskQ14: parseInt(v) })} className="space-y-3 mt-4">
          {optionsQ14.map(opt => (
            <div key={opt.v} className={`flex items-center space-x-3 p-3 border rounded-xl transition-colors ${data.riskQ14 === opt.v ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-border hover:bg-slate-50 text-brand-bodyText'}`}>
              <RadioGroupItem value={opt.v.toString()} id={`q14-${opt.v}`} className={data.riskQ14 === opt.v ? 'text-white border-white' : 'text-brand-orange'} />
              <Label htmlFor={`q14-${opt.v}`} className="font-normal cursor-pointer w-full">{opt.l}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Q15 */}
      <div className="space-y-3 pt-6 border-t border-slate-100 relative">
        <div className="flex justify-between relative">
          <Label className="text-base font-semibold text-brand-darkText">Q15. Is there anything about money, markets, or past investment experiences you'd like us to know?</Label>
        </div>
        <p className="text-xs text-brand-mutedText">For example, an experience that shaped how you invest.</p>
        <LocalInput 
          value={data.riskQ15 || ''} 
          onChange={val => updateData({ riskQ15: val })} 
          className="h-12 focus-visible:ring-brand-cyan"
          placeholder="Optional"
        />
      </div>
    </div>
  );
}

// Part 8: SectionWrapUp
export function SectionWrapUp({ data, updateData }: SectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-[#f8f9fa] border border-brand-border rounded-2xl text-center space-y-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-health-green-bg mb-2">
          <span className="text-3xl">🎉</span>
        </div>
        <h3 className="text-2xl font-bold text-brand-darkText">You made it!</h3>
        <p className="text-brand-bodyText text-base max-w-md mx-auto leading-relaxed">
          Thank you for taking the time to share this. This allows our team to prepare thoroughly so your consultation goes straight to what matters.
        </p>

        <div className="pt-6 border-t border-slate-200 mt-6 max-w-md mx-auto text-left">
          <div className="space-y-3">
            <Label className="font-semibold text-brand-darkText block">Anything specific you'd like to discuss?</Label>
            <LocalInput 
              value={data.meetingTopics || ''}
              onChange={val => updateData({ meetingTopics: val })}
              className="h-12 focus-visible:ring-brand-cyan bg-white"
              placeholder="e.g. 'I want to plan for a new home'"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-xl">
        <Checkbox 
          id="consent" 
          checked={data.consentGiven || false} 
          onCheckedChange={c => updateData({ consentGiven: c })}
          className="mt-1" 
        />
        <Label htmlFor="consent" className="text-sm text-brand-bodyText leading-relaxed cursor-pointer">
          I consent to FINETHY processing this information to prepare my financial review. I understand this is for assessment purposes only and does not constitute binding financial advice.
        </Label>
      </div>
    </div>
  );
}
