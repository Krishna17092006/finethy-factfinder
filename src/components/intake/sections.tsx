"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatIndianNumber } from "@/lib/utils";
import { deriveData, countDependentTypes } from "@/lib/derive";
import { isValidEmail } from "@/lib/validators";
import { RISK_QUESTIONS, RISK_Q15, RISK_STEPS, Q3_NO_HISTORY_LABEL } from "@/config/questions";
import {
  DEPENDENT_TYPE_OPTIONS,
  GOAL_TYPES,
  HEALTH_INSURANCE_TYPES,
  HOUSE_STATUS_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  OCCUPATION_TYPES,
} from "@/lib/types";
import {
  ChipGroup,
  ChoiceList,
  CountPicker,
  DateOfBirthInput,
  Field,
  Group,
  NativeSelect,
  Reveal,
  SectionIntro,
  TextArea,
  TextInput,
  YesNo,
  readList,
  readObject,
} from "./fields";
import { RupeeInput } from "./RupeeInput";
import type { FormData } from "./steps";

export interface SectionProps {
  data: FormData;
  update: (patch: FormData) => void;
  errors?: Record<string, string>;
}

const money = (n: number) => `₹${formatIndianNumber(Math.round(n))}`;

/* ================================================================== */
/* 1. You and your family                                              */
/* ================================================================== */

export function SectionPersonal({ data, update, errors = {} }: SectionProps) {
  const [hasChildren, setHasChildren] = React.useState<boolean | null>(
    typeof data.childrenCount === "number" ? data.childrenCount > 0 : null,
  );
  const [adjustDependents, setAdjustDependents] = React.useState(false);

  const dependentTypes = readList(data.dependentTypes);
  const impliedDependents =
    (data.maritalStatus === "Married" && data.spouseEarning === false ? 1 : 0) +
    (data.childrenCount || 0) +
    countDependentTypes(data.dependentTypes);
  const confirmed = typeof data.totalDependents === "number";

  return (
    <div className="space-y-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName}>
          <TextInput
            id="fullName"
            autoComplete="name"
            value={data.fullName}
            onChange={(v) => update({ fullName: v })}
            aria-invalid={!!errors.fullName || undefined}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
        </Field>
        <Field label="Mobile number" htmlFor="mobile" required error={errors.mobile}>
          <TextInput
            id="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit number"
            maxLength={10}
            value={data.mobile}
            filter={(v) => v.replace(/\D/g, "").slice(0, 10)}
            onChange={(v) => update({ mobile: v })}
            aria-invalid={!!errors.mobile || undefined}
            aria-describedby={errors.mobile ? "mobile-error" : undefined}
          />
        </Field>
        <Field
          label="Email"
          htmlFor="email"
          error={data.email && !isValidEmail(data.email) ? "This email address looks incomplete." : null}
        >
          <TextInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={data.email}
            onChange={(v) => update({ email: v.trim() })}
          />
        </Field>
        <Field label="City" htmlFor="city">
          <TextInput id="city" autoComplete="address-level2" value={data.city} onChange={(v) => update({ city: v })} />
        </Field>
        <Field label="Date of birth" htmlFor="dateOfBirth" error={errors.dateOfBirth}>
          <DateOfBirthInput
            id="dateOfBirth"
            value={data.dateOfBirth}
            onChange={(v) => update({ dateOfBirth: v })}
            invalid={!!errors.dateOfBirth}
          />
        </Field>
        <Field label="Marital status" htmlFor="maritalStatus">
          <NativeSelect
            id="maritalStatus"
            value={data.maritalStatus}
            options={MARITAL_STATUS_OPTIONS}
            onChange={(v) => update({ maritalStatus: v, ...(v !== "Married" ? { spouseEarning: null, spouseIncome: null } : {}) })}
          />
        </Field>
      </div>

      {data.maritalStatus === "Married" ? (
        <Reveal>
          <YesNo
            name="spouseEarning"
            legend="Is your spouse also earning?"
            value={data.spouseEarning}
            onChange={(v) => update({ spouseEarning: v, ...(v ? {} : { spouseIncome: null }) })}
          />
          {data.spouseEarning ? (
            <Field label="Spouse's yearly income (before tax)" htmlFor="spouseIncome">
              <RupeeInput id="spouseIncome" value={data.spouseIncome} onChange={(v) => update({ spouseIncome: v })} />
            </Field>
          ) : null}
        </Reveal>
      ) : null}

      <div className="space-y-4">
        <YesNo
          name="hasChildren"
          legend="Do you have children?"
          value={hasChildren}
          onChange={(v) => {
            setHasChildren(v);
            update({ childrenCount: v ? (data.childrenCount > 0 ? data.childrenCount : null) : 0 });
          }}
        />
        {hasChildren ? (
          <Reveal>
            <Group legend="How many children?">
              <CountPicker label="Number of children" value={data.childrenCount} onChange={(v) => update({ childrenCount: v })} />
            </Group>
          </Reveal>
        ) : null}
      </div>

      <Group legend="Does anyone else depend on you financially?">
        <ChipGroup
          options={DEPENDENT_TYPE_OPTIONS}
          selected={dependentTypes}
          onToggle={(opt) => {
            let next = dependentTypes.includes(opt) ? dependentTypes.filter((t) => t !== opt) : [...dependentTypes, opt];
            next = opt === "None" && next.includes("None") ? ["None"] : next.filter((t) => t !== "None" || opt === "None");
            update({ dependentTypes: JSON.stringify(next), totalDependents: null });
          }}
        />
      </Group>

      {impliedDependents > 0 || confirmed ? (
        <div className="rounded-lg border border-brand-border bg-brand-page p-4">
          {!adjustDependents ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-brand-darkText">
                {confirmed ? (
                  <>
                    You told us <strong>{data.totalDependents}</strong>{" "}
                    {data.totalDependents === 1 ? "person depends" : "people depend"} on your income.
                  </>
                ) : (
                  <>
                    From your answers, <strong>{impliedDependents}</strong>{" "}
                    {impliedDependents === 1 ? "person depends" : "people depend"} on your income. Is that right?
                  </>
                )}
              </p>
              <div className="flex shrink-0 gap-2">
                {!confirmed ? (
                  <Button size="sm" onClick={() => update({ totalDependents: impliedDependents })}>
                    Yes, that&apos;s right
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => setAdjustDependents(true)}>
                  Change number
                </Button>
              </div>
            </div>
          ) : (
            <Group legend="How many people depend on your income?">
              <CountPicker
                label="Number of dependents"
                value={data.totalDependents}
                onChange={(v) => update({ totalDependents: v })}
              />
            </Group>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* 2. Income and expenses                                              */
/* ================================================================== */

const OTHER_INCOME = ["Rent", "Interest & dividends", "Business or side income", "Pension"] as const;

export function SectionIncome({ data, update }: SectionProps) {
  const firstName = typeof data.fullName === "string" ? data.fullName.trim().split(/\s+/)[0] : "";
  const sources = readJsonArray<{ type: string; amount: number | null }>(data.otherIncomeSources);
  const selected = sources.map((s) => s.type);

  const setSources = (next: Array<{ type: string; amount: number | null }>) =>
    update({ otherIncomeSources: JSON.stringify(next) });

  return (
    <div className="space-y-7">
      {firstName ? <SectionIntro>Thanks, {firstName}. Now a few questions about income.</SectionIntro> : null}

      <Field label="What do you do for a living?" htmlFor="occupationType">
        <NativeSelect
          id="occupationType"
          value={data.occupationType}
          options={OCCUPATION_TYPES}
          onChange={(v) => update({ occupationType: v, ...(v !== "Other" ? { occupationOther: null } : {}) })}
        />
      </Field>
      {data.occupationType === "Other" ? (
        <Reveal>
          <Field label="Please tell us your occupation" htmlFor="occupationOther">
            <TextInput
              id="occupationOther"
              placeholder="e.g. Freelance designer"
              value={data.occupationOther}
              onChange={(v) => update({ occupationOther: v })}
            />
          </Field>
        </Reveal>
      ) : null}

      <Field label="Your yearly income (before tax)" htmlFor="grossAnnualIncome" hint="Salary or business income for one year.">
        <RupeeInput
          id="grossAnnualIncome"
          placeholder="e.g. 12,00,000"
          value={data.grossAnnualIncome}
          onChange={(v) => update({ grossAnnualIncome: v })}
          aria-describedby="grossAnnualIncome-hint"
        />
      </Field>

      <Group legend="Any other regular income?" hint="Tick all that apply, then add a yearly amount.">
        <ChipGroup
          options={OTHER_INCOME}
          selected={selected}
          onToggle={(opt) =>
            setSources(selected.includes(opt) ? sources.filter((s) => s.type !== opt) : [...sources, { type: opt, amount: null }])
          }
        />
        {sources.length ? (
          <Reveal className="mt-4">
            {sources.map((s) => (
              <Field key={s.type} label={`${s.type}: yearly amount`} htmlFor={`other-${s.type}`}>
                <RupeeInput
                  id={`other-${s.type}`}
                  value={s.amount}
                  onChange={(v) => setSources(sources.map((x) => (x.type === s.type ? { ...x, amount: v } : x)))}
                />
              </Field>
            ))}
          </Reveal>
        ) : null}
      </Group>

      <Field
        label="Average monthly household expenses"
        htmlFor="monthlyExpenses"
        hint="Groceries, bills, fuel, school fees, lifestyle. Leave out loan EMIs; we ask about those next."
      >
        <RupeeInput
          id="monthlyExpenses"
          placeholder="e.g. 30,000"
          value={data.monthlyExpenses}
          onChange={(v) => update({ monthlyExpenses: v })}
          aria-describedby="monthlyExpenses-hint"
        />
      </Field>
    </div>
  );
}

/* ================================================================== */
/* 3. What you own                                                     */
/* ================================================================== */

const ASSETS = [
  { has: "hasBankSavingsFD", value: "bankSavingsFDValue", label: "Bank savings and fixed deposits" },
  { has: "hasMutualFunds", value: "mutualFundsValue", label: "Mutual funds" },
  { has: "hasStocks", value: "stocksValue", label: "Shares (direct equity)" },
  { has: "hasRetirementAccounts", value: "retirementAccountsValue", label: "EPF, PPF or NPS" },
  { has: "hasInvestmentProperty", value: "investmentPropertyValue", label: "Property other than your home" },
  { has: "hasGold", value: "goldValue", label: "Gold and jewellery" },
  { has: "hasOtherAssets", value: "otherAssetsValue", label: "Anything else (business, crypto, etc.)", desc: "otherAssetsDescription" },
] as const;

const RETIREMENT_PARTS = [
  { key: "epfValue", label: "EPF", placeholder: "e.g. 5,00,000" },
  { key: "ppfValue", label: "PPF", placeholder: "e.g. 2,00,000" },
  { key: "npsValue", label: "NPS", placeholder: "e.g. 3,00,000" },
] as const;

const EQUITY_SPLIT = [
  { label: "Mostly equity", value: 90 },
  { label: "About half and half", value: 50 },
  { label: "Mostly debt", value: 20 },
] as const;

export function SectionAssets({ data, update }: SectionProps) {
  const derived = deriveData(data);
  const total =
    ASSETS.reduce((sum, a) => sum + (a.has === "hasRetirementAccounts" ? 0 : Number(data[a.value]) || 0), 0) +
    (derived.retirementAccountsValue || 0) +
    (Number(data.ownHouseValue) || 0);

  const setRetirementPart = (key: string, v: number | null) => {
    const next = { ...data, [key]: v };
    const sum = RETIREMENT_PARTS.reduce((s, p) => s + (Number(next[p.key]) || 0), 0);
    update({ [key]: v, retirementAccountsValue: sum || null });
  };

  const equityChoice =
    typeof data.mfEquityPercent === "number"
      ? data.mfEquityPercent >= 70
        ? 90
        : data.mfEquityPercent >= 30
          ? 50
          : 20
      : null;

  return (
    <div className="space-y-6">
      <SectionIntro>Tell us roughly what you own today. Approximate values are fine.</SectionIntro>

      <div className="divide-y divide-brand-border rounded-lg border border-brand-border">
        {ASSETS.map((a) => (
          <div key={a.has} className="space-y-4 p-4">
            <YesNo
              name={a.has}
              legend={a.label}
              value={data[a.has]}
              onChange={(v) =>
                update({
                  [a.has]: v,
                  ...(v
                    ? {}
                    : {
                        [a.value]: null,
                        ...("desc" in a ? { [a.desc]: null } : {}),
                        ...(a.has === "hasRetirementAccounts" ? { epfValue: null, ppfValue: null, npsValue: null } : {}),
                        ...(a.has === "hasMutualFunds" ? { mfEquityPercent: null } : {}),
                      }),
                })
              }
            />
            {data[a.has] ? (
              <Reveal>
                {a.has === "hasRetirementAccounts" ? (
                  <Group legend="Which ones do you have?" hint="Tick each one and enter its current balance.">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {RETIREMENT_PARTS.map((p) => {
                        const on = data[p.key] !== null && data[p.key] !== undefined;
                        return (
                          <div key={p.key} className="space-y-2">
                            <label className="flex h-11 cursor-pointer items-center gap-3 font-semibold text-brand-darkText">
                              <input
                                type="checkbox"
                                className="h-5 w-5 accent-[#2f5aa8]"
                                checked={on}
                                onChange={(e) => setRetirementPart(p.key, e.target.checked ? 0 : null)}
                              />
                              {p.label}
                            </label>
                            {on ? (
                              <RupeeInput
                                aria-label={`${p.label} balance`}
                                placeholder={p.placeholder}
                                value={data[p.key] || null}
                                onChange={(v) => setRetirementPart(p.key, v ?? 0)}
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </Group>
                ) : (
                  <Field label="Approximate value today" htmlFor={a.value}>
                    <RupeeInput id={a.value} value={data[a.value]} onChange={(v) => update({ [a.value]: v })} />
                  </Field>
                )}
                {"desc" in a ? (
                  <Field label="What is it?" htmlFor={a.desc}>
                    <TextInput
                      id={a.desc}
                      placeholder="e.g. 30% share in a family business"
                      value={data[a.desc]}
                      onChange={(v) => update({ [a.desc]: v })}
                    />
                  </Field>
                ) : null}
                {a.has === "hasMutualFunds" ? (
                  <Group legend="Roughly how is it split between equity and debt?">
                    <div className="flex flex-wrap gap-2">
                      {[...EQUITY_SPLIT, { label: "Not sure", value: null }].map((o) => {
                        const on = equityChoice === o.value && (o.value !== null || data.mfEquityPercent === null);
                        return (
                          <button
                            key={o.label}
                            type="button"
                            aria-pressed={on}
                            onClick={() => update({ mfEquityPercent: o.value })}
                            className={cn(
                              "min-h-11 rounded-full border px-4 text-[15px] font-medium",
                              on ? "border-brand-blue bg-brand-blue text-white" : "border-brand-border bg-white text-brand-darkText hover:border-brand-blue",
                            )}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </Group>
                ) : null}
              </Reveal>
            ) : null}
          </div>
        ))}

        <div className="space-y-4 p-4">
          <Field label="Your home" htmlFor="ownHouseStatus">
            <NativeSelect
              id="ownHouseStatus"
              value={data.ownHouseStatus}
              options={HOUSE_STATUS_OPTIONS}
              onChange={(v) => update({ ownHouseStatus: v, ...(v.startsWith("Own") ? {} : { ownHouseValue: null }) })}
            />
          </Field>
          {typeof data.ownHouseStatus === "string" && data.ownHouseStatus.startsWith("Own") ? (
            <Reveal>
              <Field label="Approximate value of your home" htmlFor="ownHouseValue">
                <RupeeInput id="ownHouseValue" value={data.ownHouseValue} onChange={(v) => update({ ownHouseValue: v })} />
              </Field>
            </Reveal>
          ) : null}
        </div>
      </div>

      <Summary items={[{ label: "Total of what you own", value: money(total) }]} />
    </div>
  );
}

/* ================================================================== */
/* 4. What you owe                                                     */
/* ================================================================== */

const LOANS = [
  { has: "hasHomeLoan", out: "homeLoanOutstanding", emi: "homeLoanEMI", label: "Home loan" },
  { has: "hasCarLoan", out: "carLoanOutstanding", emi: "carLoanEMI", label: "Vehicle loan" },
  { has: "hasPersonalLoan", out: "personalLoanOutstanding", emi: "personalLoanEMI", label: "Personal loan" },
  { has: "hasCreditCardDebt", out: "creditCardOutstanding", label: "Unpaid credit card balance", hint: "Only amounts you carry over, not this month's bill." },
  { has: "hasOtherLoans", out: "otherLoansOutstanding", emi: "otherLoansEMI", label: "Education, gold or other loan", desc: "otherLoansDescription" },
] as const;

export function SectionLiabilities({ data, update }: SectionProps) {
  const totalOutstanding = LOANS.reduce((s, l) => s + (Number(data[l.out]) || 0), 0);
  const totalEmi = LOANS.reduce((s, l) => s + ("emi" in l ? Number(data[l.emi]) || 0 : 0), 0);
  const surplus = deriveData(data).householdMonthlySurplus as number;
  const noLoans = LOANS.every((l) => data[l.has] === false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionIntro>Tell us about any loans you are repaying.</SectionIntro>
        <Button
          variant={noLoans ? "default" : "outline"}
          size="sm"
          aria-pressed={noLoans}
          onClick={() => {
            const patch: FormData = {};
            for (const l of LOANS) {
              patch[l.has] = false;
              patch[l.out] = null;
              if ("emi" in l) patch[l.emi] = null;
              if ("desc" in l) patch[l.desc] = null;
            }
            update(patch);
          }}
        >
          I have no loans
        </Button>
      </div>

      <div className="divide-y divide-brand-border rounded-lg border border-brand-border">
        {LOANS.map((l) => (
          <div key={l.has} className="space-y-4 p-4">
            <YesNo
              name={l.has}
              legend={l.label}
              hint={"hint" in l ? l.hint : undefined}
              value={data[l.has]}
              onChange={(v) =>
                update({
                  [l.has]: v,
                  ...(v ? {} : { [l.out]: null, ...("emi" in l ? { [l.emi]: null } : {}), ...("desc" in l ? { [l.desc]: null } : {}) }),
                })
              }
            />
            {data[l.has] ? (
              <Reveal>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Amount still to repay" htmlFor={l.out}>
                    <RupeeInput id={l.out} value={data[l.out]} onChange={(v) => update({ [l.out]: v })} />
                  </Field>
                  {"emi" in l ? (
                    <Field label="Monthly EMI" htmlFor={l.emi}>
                      <RupeeInput id={l.emi} placeholder="e.g. 15,000" value={data[l.emi]} onChange={(v) => update({ [l.emi]: v })} />
                    </Field>
                  ) : null}
                </div>
                {"desc" in l ? (
                  <Field label="What kind of loan?" htmlFor={l.desc}>
                    <TextInput id={l.desc} placeholder="e.g. Gold loan" value={data[l.desc]} onChange={(v) => update({ [l.desc]: v })} />
                  </Field>
                ) : null}
              </Reveal>
            ) : null}
          </div>
        ))}
      </div>

      <Summary
        items={[
          { label: "Total EMIs each month", value: money(totalEmi) },
          { label: "Total still to repay", value: money(totalOutstanding) },
        ]}
      />

      {surplus > 0 ? (
        <Field
          label="How much of that do you actually invest each month?"
          htmlFor="monthlySavings"
          hint={`After expenses and EMIs, your household has roughly ${money(surplus)} left each month. SIPs, RDs and other regular investments count.`}
        >
          <RupeeInput
            id="monthlySavings"
            placeholder="e.g. 20,000"
            value={data.monthlySavings}
            onChange={(v) => update({ monthlySavings: v })}
            aria-describedby="monthlySavings-hint"
          />
        </Field>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* 5. Insurance                                                        */
/* ================================================================== */

export function SectionInsurance({ data, update }: SectionProps) {
  return (
    <div className="space-y-6">
      <SectionIntro>How are you and your family protected today?</SectionIntro>
      <div className="divide-y divide-brand-border rounded-lg border border-brand-border">
        <div className="space-y-4 p-4">
          <YesNo
            name="hasTermInsurance"
            legend="Pure term life insurance"
            hint="A plan that pays only if something happens to you, with no maturity amount."
            value={data.hasTermInsurance}
            onChange={(v) => update({ hasTermInsurance: v, ...(v ? {} : { termInsuranceCover: null }) })}
          />
          {data.hasTermInsurance ? (
            <Reveal>
              <Field label="Total cover amount" htmlFor="termInsuranceCover">
                <RupeeInput id="termInsuranceCover" placeholder="e.g. 1,00,00,000" value={data.termInsuranceCover} onChange={(v) => update({ termInsuranceCover: v })} />
              </Field>
            </Reveal>
          ) : null}
        </div>

        <div className="space-y-4 p-4">
          <Group legend="Health insurance">
            <ChoiceList
              name="healthInsuranceType"
              options={HEALTH_INSURANCE_TYPES.map((t) => ({ id: t, label: t }))}
              value={data.healthInsuranceType ?? null}
              onChange={(v) => update({ healthInsuranceType: v, ...(v === "None" ? { healthInsuranceCover: null } : {}) })}
            />
          </Group>
          {data.healthInsuranceType && data.healthInsuranceType !== "None" ? (
            <Reveal>
              <Field label="Total cover for the family (base plus any top-up)" htmlFor="healthInsuranceCover">
                <RupeeInput id="healthInsuranceCover" placeholder="e.g. 10,00,000" value={data.healthInsuranceCover} onChange={(v) => update({ healthInsuranceCover: v })} />
              </Field>
            </Reveal>
          ) : null}
        </div>

        <div className="space-y-4 p-4">
          <YesNo
            name="hasTraditionalInsurance"
            legend="Traditional policies (LIC, ULIPs, money-back)"
            value={data.hasTraditionalInsurance}
            onChange={(v) =>
              update({ hasTraditionalInsurance: v, ...(v ? {} : { traditionalInsuranceCover: null, traditionalInsurancePremium: null }) })
            }
          />
          {data.hasTraditionalInsurance ? (
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Total cover amount" htmlFor="traditionalInsuranceCover">
                  <RupeeInput id="traditionalInsuranceCover" value={data.traditionalInsuranceCover} onChange={(v) => update({ traditionalInsuranceCover: v })} />
                </Field>
                <Field label="Premium you pay each year" htmlFor="traditionalInsurancePremium">
                  <RupeeInput id="traditionalInsurancePremium" placeholder="e.g. 50,000" value={data.traditionalInsurancePremium} onChange={(v) => update({ traditionalInsurancePremium: v })} />
                </Field>
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 6. Goals                                                            */
/* ================================================================== */

type GoalDetail = { targetYear?: number | null; targetAmount?: number | null };

export function SectionGoals({ data, update }: SectionProps) {
  const goals = readList(data.selectedGoals);
  const details = readObject<Record<string, GoalDetail>>(data.goalDetails);
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 41 }, (_, i) => String(thisYear + i));

  const setGoals = (next: string[]) => update({ selectedGoals: JSON.stringify(next) });
  const setDetail = (goal: string, patch: GoalDetail) =>
    update({ goalDetails: JSON.stringify({ ...details, [goal]: { ...details[goal], ...patch } }) });
  const move = (i: number, dir: -1 | 1) => {
    const next = [...goals];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setGoals(next);
  };

  return (
    <div className="space-y-7">
      <Group legend="What are you saving or planning for?" hint="Pick as many as apply.">
        <ChipGroup
          options={GOAL_TYPES}
          selected={goals}
          onToggle={(g) => setGoals(goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g])}
        />
      </Group>

      {goals.length ? (
        <div className="space-y-3">
          <h3 className="font-semibold">Put them in order of priority, then add details</h3>
          <p className="text-[15px] text-brand-mutedText">Number 1 is the most important to you. Use the arrows to reorder.</p>
          <ol className="space-y-3">
            {goals.map((goal, i) => {
              const isRetirement = /retire/i.test(goal);
              const d = details[goal] ?? {};
              return (
                <li key={goal} className="rounded-lg border border-brand-border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue-light font-bold text-brand-blue">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-semibold text-brand-darkText">{goal}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Move ${goal} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Move ${goal} down`} disabled={i === goals.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Remove ${goal}`} onClick={() => setGoals(goals.filter((g) => g !== goal))}>
                        <X />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {isRetirement ? (
                      <Field label="Age you want to retire at" htmlFor={`goal-${i}-age`}>
                        <TextInput
                          id={`goal-${i}-age`}
                          inputMode="numeric"
                          placeholder="e.g. 60"
                          maxLength={3}
                          value={data.retirementAge ? String(data.retirementAge) : ""}
                          filter={(v) => v.replace(/\D/g, "").slice(0, 3)}
                          onChange={(v) => {
                            const age = v ? parseInt(v, 10) : null;
                            update({ retirementAge: age && age >= 18 && age <= 100 ? age : null });
                          }}
                        />
                      </Field>
                    ) : (
                      <Field label="Target year" htmlFor={`goal-${i}-year`}>
                        <NativeSelect
                          id={`goal-${i}-year`}
                          placeholder="Choose a year"
                          value={d.targetYear ? String(d.targetYear) : ""}
                          options={years}
                          onChange={(v) => setDetail(goal, { targetYear: parseInt(v, 10) })}
                        />
                      </Field>
                    )}
                    <Field label={isRetirement ? "Retirement fund you are aiming for (if you know)" : "Approximate amount needed"} htmlFor={`goal-${i}-amount`}>
                      <RupeeInput
                        id={`goal-${i}-amount`}
                        placeholder={isRetirement ? "e.g. 3,00,00,000" : "e.g. 10,00,000"}
                        value={d.targetAmount ?? null}
                        onChange={(v) => setDetail(goal, { targetAmount: v })}
                      />
                    </Field>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* 7–9. How you think about money                                      */
/* ================================================================== */

export function SectionRisk({ data, update, part }: SectionProps & { part: 0 | 1 | 2 }) {
  const step = RISK_STEPS[part];
  return (
    <div className="space-y-9">
      {step.intro ? <SectionIntro>{step.intro}</SectionIntro> : null}
      {step.keys.map((key) => {
        const q = RISK_QUESTIONS.find((x) => x.key === key)!;
        const score = data[key];
        const selectedId =
          typeof score === "number"
            ? key === "riskQ3" && score === 3
              ? (q.options.find((o) => (data.riskQ3NoHistory ? o.label === Q3_NO_HISTORY_LABEL : o.score === 3 && o.label !== Q3_NO_HISTORY_LABEL))?.id ?? null)
              : (q.options.find((o) => o.score === score)?.id ?? null)
            : null;
        return (
          <Group key={key} legend={`${q.number}. ${q.text}`} hint={q.hint}>
            <ChoiceList
              name={key}
              options={q.options}
              value={selectedId}
              onChange={(id) => {
                const opt = q.options.find((o) => o.id === id)!;
                update(key === "riskQ3" ? { riskQ3: opt.score, riskQ3NoHistory: opt.label === Q3_NO_HISTORY_LABEL } : { [key]: opt.score });
              }}
            />
          </Group>
        );
      })}
      {step.includeQ15 ? (
        <Field label={`${RISK_Q15.number}. ${RISK_Q15.text}`} htmlFor="riskQ15" hint={`${RISK_Q15.hint} This one is optional.`}>
          <TextArea id="riskQ15" value={data.riskQ15} onChange={(v) => update({ riskQ15: v })} aria-describedby="riskQ15-hint" />
        </Field>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* 10. Wrap-up                                                         */
/* ================================================================== */

export function SectionWrapUp({ data, update, errors = {} }: SectionProps) {
  return (
    <div className="space-y-7">
      <SectionIntro>
        That&apos;s everything. Thank you for taking the time. Your advisor will go through this before you meet, so the
        consultation can go straight to what matters to you.
      </SectionIntro>

      <Field label="Anything specific you'd like to discuss?" htmlFor="meetingTopics" hint="Optional.">
        <TextArea
          id="meetingTopics"
          placeholder="e.g. Planning my daughter's education without touching retirement savings"
          value={data.meetingTopics}
          onChange={(v) => update({ meetingTopics: v })}
        />
      </Field>

      <div className={cn("rounded-lg border p-4", errors.consentGiven ? "border-health-red bg-health-red-bg" : "border-brand-border bg-brand-page")}>
        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[#2f5aa8]"
            checked={data.consentGiven === true}
            onChange={(e) => update({ consentGiven: e.target.checked })}
            aria-describedby={errors.consentGiven ? "consent-error" : undefined}
          />
          <span className="text-[15px] leading-relaxed text-brand-darkText">
            I agree to FINETHY using this information to prepare my financial review. I understand it is for assessment
            only and is not binding financial advice.
          </span>
        </label>
        {errors.consentGiven ? (
          <p id="consent-error" role="alert" className="mt-2 text-[15px] font-medium text-health-red">
            {errors.consentGiven}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Summary({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid gap-3 rounded-lg bg-brand-footerBg px-5 py-4 text-white sm:grid-flow-col sm:auto-cols-fr">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-4 sm:block">
          <dt className="text-sm text-[#c9d1de]">{it.label}</dt>
          <dd className="tabular text-xl font-bold">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function readJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

