import { AlertTriangle, CircleAlert } from "lucide-react";
import { cn, formatINR, formatINRShort, calculateAge } from "@/lib/utils";
import { riskBand } from "@/lib/risk";
import type { AnalysisResult, HealthMetricResult, RiskProfileResult } from "@/lib/types";
import type { SanityFlag } from "@/lib/sanity";
import { RISK_QUESTIONS, RISK_Q15, describeRiskAnswer } from "@/config/questions";

export function Panel({ title, children, className, id }: { title: string; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section aria-labelledby={id} className={cn("rounded-xl border border-brand-border bg-white p-5 sm:p-6", className)}>
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SanityAlerts({ flags }: { flags: SanityFlag[] }) {
  if (!flags.length) return null;
  return (
    <div className="space-y-2" role="region" aria-label="Data checks">
      {flags.map((f, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-3 rounded-lg border p-4 text-[15px]",
            f.level === "CRITICAL" ? "border-health-red-line bg-health-red-bg text-[#7f1d1d]" : "border-health-yellow-line bg-health-yellow-bg text-[#713f12]",
          )}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong>{f.level === "CRITICAL" ? "Check before the meeting: " : "Worth confirming: "}</strong>
            {f.message}
          </p>
        </div>
      ))}
    </div>
  );
}

export function Snapshot({ analysis }: { analysis: AnalysisResult }) {
  const items = [
    { label: "Net worth", value: formatINRShort(analysis.netWorth) },
    { label: "Household income", value: `${formatINRShort(analysis.annualIncome)} a year` },
    { label: "Monthly surplus", value: formatINRShort(analysis.monthlySurplus), negative: analysis.monthlySurplus < 0 },
    { label: "Dependents", value: String(analysis.totalDependents) },
    { label: "Top goal", value: analysis.topGoal || "None given", wide: true },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-brand-border bg-brand-border sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div key={it.label} className={cn("bg-white px-4 py-4", it.wide && "col-span-2 sm:col-span-1")}>
          <dt className="text-sm text-brand-mutedText">{it.label}</dt>
          <dd className={cn("tabular mt-1 text-xl font-bold leading-tight text-brand-darkText", it.negative && "text-health-red")}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const STATUS_STYLE: Record<string, { row: string; pill: string; label: string }> = {
  RED: { row: "", pill: "bg-health-red-bg text-health-red border-health-red-line", label: "Red" },
  YELLOW: { row: "", pill: "bg-health-yellow-bg text-health-yellow border-health-yellow-line", label: "Yellow" },
  GREEN: { row: "", pill: "bg-health-green-bg text-health-green border-health-green-line", label: "Green" },
  INFO: { row: "", pill: "bg-brand-blue-light text-brand-blue border-[#c9d7f0]", label: "Info" },
};

export function StatusTag({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.INFO;
  return <span className={cn("inline-flex h-6 items-center rounded-full border px-2 text-[13px] font-bold", s.pill)}>{s.label}</span>;
}

export function AttentionList({ metrics }: { metrics: HealthMetricResult[] }) {
  const flagged = metrics.filter((m) => m.status === "RED" || m.status === "YELLOW").sort((a, b) => (a.status === "RED" ? -1 : 1) - (b.status === "RED" ? -1 : 1));
  if (!flagged.length) return <p className="text-health-green">Nothing flagged. Every measured area is in a healthy range.</p>;
  return (
    <ul className="space-y-3">
      {flagged.map((m) => (
        <li key={m.key} className={cn("rounded-lg border-l-4 bg-brand-page p-4", m.status === "RED" ? "border-health-red" : "border-[#ca8a04]")}>
          <div className="flex flex-wrap items-center gap-2">
            <StatusTag status={m.status} />
            <span className="font-semibold text-brand-darkText">{m.name}</span>
            <span className="tabular text-brand-mutedText">{m.displayValue.replace(/^Rs\. /, "₹")}</span>
          </div>
          {m.observation ? <p className="mt-2 text-[15px] leading-relaxed">{m.observation.replace(/Rs\. /g, "₹")}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function MetricsTable({ metrics }: { metrics: HealthMetricResult[] }) {
  const order = { RED: 0, YELLOW: 1, GREEN: 2, INFO: 3 } as Record<string, number>;
  const sorted = [...metrics].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[34rem] text-left text-[15px]">
        <thead className="border-y border-brand-border bg-brand-page text-sm text-brand-mutedText">
          <tr>
            <th scope="col" className="px-5 py-2.5 font-semibold sm:px-6">Measure</th>
            <th scope="col" className="px-3 py-2.5 font-semibold">Client</th>
            <th scope="col" className="px-3 py-2.5 font-semibold">Healthy range</th>
            <th scope="col" className="px-5 py-2.5 text-right font-semibold sm:px-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border">
          {sorted.map((m) => (
            <tr key={m.key}>
              <th scope="row" className="px-5 py-3 font-medium text-brand-darkText sm:px-6">
                {m.name}
                {m.isEstimated ? <span className="ml-1 text-sm font-normal text-brand-mutedText">(estimate)</span> : null}
                <span className="block text-sm font-normal text-brand-mutedText">{m.description}</span>
              </th>
              <td className="tabular px-3 py-3 font-semibold text-brand-darkText">{m.displayValue.replace(/^Rs\. /, "₹")}</td>
              <td className="px-3 py-3 text-brand-mutedText">{m.healthyRange.replace(/Rs\. /g, "₹")}</td>
              <td className="px-5 py-3 text-right sm:px-6">
                <StatusTag status={m.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RiskProfileView({ profile }: { profile: RiskProfileResult }) {
  const bars = [
    { label: "Recommended risk level", hint: "The lower of the two scores below", value: profile.finalScore, strong: true },
    { label: "Ability to take risk (capacity)", hint: profile.capacityConstraint, value: profile.capacityScore },
    { label: "Willingness to take risk (tolerance)", hint: "From the 14 questionnaire answers", value: profile.toleranceScore },
  ];
  return (
    <div className="space-y-5">
      <p className="text-brand-darkText">
        <span className="font-wide text-2xl font-bold">{riskBand(profile.finalScore)}</span>
        <span className="tabular ml-2 text-brand-mutedText">score {profile.finalScore} of 100</span>
      </p>
      <div className="space-y-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={cn("text-[15px]", b.strong ? "font-semibold text-brand-darkText" : "text-brand-bodyText")}>{b.label}</span>
              <span className="tabular font-semibold text-brand-darkText">{b.value}</span>
            </div>
            <div
              className="mt-1.5 h-2.5 rounded-full bg-brand-page"
              role="meter"
              aria-label={b.label}
              aria-valuenow={b.value}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={cn("h-full rounded-full", b.strong ? "bg-brand-blue" : "bg-[#93acd6]")} style={{ width: `${b.value}%` }} />
            </div>
            <p className="mt-1 text-sm text-brand-mutedText">{b.hint}</p>
          </div>
        ))}
      </div>
      <p className="text-[15px]">{profile.gapInsight}</p>
      {profile.consistencyWarning ? (
        <p className="flex gap-2 rounded-lg border border-health-yellow-line bg-health-yellow-bg p-3 text-[15px] text-[#713f12]">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          {profile.consistencyWarning}
        </p>
      ) : null}
    </div>
  );
}

export function Breakdown({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3 className="flex items-baseline justify-between font-semibold">
          What they own <span className="tabular text-brand-mutedText">{formatINRShort(analysis.totalAssets)}</span>
        </h3>
        <ul className="mt-3 space-y-2.5">
          {analysis.assetBreakdown.map((a) => (
            <li key={a.category}>
              <div className="flex justify-between gap-3 text-[15px]">
                <span>{a.category}</span>
                <span className="tabular font-semibold text-brand-darkText">{formatINRShort(a.value)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-brand-page">
                <div className="h-full rounded-full" style={{ width: `${Math.max(a.percentage, 1)}%`, background: a.color }} />
              </div>
            </li>
          ))}
          {!analysis.assetBreakdown.length ? <li className="text-brand-mutedText">No assets entered.</li> : null}
        </ul>
      </div>
      <div>
        <h3 className="flex items-baseline justify-between font-semibold">
          What they owe <span className="tabular text-brand-mutedText">{formatINRShort(analysis.totalLiabilities)}</span>
        </h3>
        {analysis.liabilityBreakdown.length ? (
          <table className="mt-3 w-full text-[15px]">
            <thead className="text-sm text-brand-mutedText">
              <tr>
                <th scope="col" className="pb-2 text-left font-semibold">Loan</th>
                <th scope="col" className="pb-2 text-right font-semibold">Outstanding</th>
                <th scope="col" className="pb-2 text-right font-semibold">EMI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {analysis.liabilityBreakdown.map((l) => (
                <tr key={l.category}>
                  <td className="py-2">{l.category}</td>
                  <td className="tabular py-2 text-right font-semibold text-brand-darkText">{formatINRShort(l.outstanding)}</td>
                  <td className="tabular py-2 text-right">{l.emi ? formatINRShort(l.emi) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-3 text-brand-mutedText">No loans.</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Everything the client entered, grouped like the form                */
/* ------------------------------------------------------------------ */

type Row = [string, React.ReactNode];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ClientAnswers({ sub }: { sub: any }) {
  const yes = (v: unknown) => (v === true ? "Yes" : v === false ? "No" : null);
  const money = (v: unknown) => (typeof v === "number" ? formatINR(v) : null);
  const list = (v: unknown) => {
    try {
      const arr = typeof v === "string" ? JSON.parse(v) : v;
      return Array.isArray(arr) && arr.length ? arr.join(", ") : null;
    } catch {
      return null;
    }
  };
  const age = calculateAge(sub.dateOfBirth);
  const otherIncome = (() => {
    try {
      const arr = JSON.parse(sub.otherIncomeSources || "[]") as Array<{ type: string; amount: number }>;
      return arr.length ? arr.map((s) => `${s.type}: ${s.amount ? formatINR(s.amount) : "amount not given"}`).join("; ") : null;
    } catch {
      return null;
    }
  })();

  const groups: Array<{ title: string; rows: Row[] }> = [
    {
      title: "You and your family",
      rows: [
        ["Name", sub.fullName],
        ["Mobile", sub.mobile],
        ["Email", sub.email],
        ["City", sub.city],
        ["Date of birth", sub.dateOfBirth ? `${sub.dateOfBirth}${age !== null ? ` (age ${age})` : ""}` : null],
        ["Marital status", sub.maritalStatus],
        ["Spouse earning", yes(sub.spouseEarning)],
        ["Spouse income (yearly)", money(sub.spouseIncome)],
        ["Children", typeof sub.childrenCount === "number" ? String(sub.childrenCount) : null],
        ["Other dependents", list(sub.dependentTypes)],
        ["Dependents (confirmed by client)", typeof sub.totalDependents === "number" ? String(sub.totalDependents) : null],
      ],
    },
    {
      title: "Income and expenses",
      rows: [
        ["Occupation", sub.occupationType === "Other" && sub.occupationOther ? `Other: ${sub.occupationOther}` : sub.occupationType],
        ["Yearly income", money(sub.grossAnnualIncome)],
        ["Other income (yearly)", otherIncome],
        ["Monthly expenses (excl. EMIs)", money(sub.monthlyExpenses)],
        ["Invests each month", money(sub.monthlySavings)],
      ],
    },
    {
      title: "What they own",
      rows: [
        ["Bank savings and FDs", money(sub.bankSavingsFDValue) ?? yes(sub.hasBankSavingsFD)],
        ["Mutual funds", money(sub.mutualFundsValue) ?? yes(sub.hasMutualFunds)],
        ["Equity share of mutual funds", typeof sub.mfEquityPercent === "number" ? `About ${sub.mfEquityPercent}%` : sub.hasMutualFunds ? "Not sure" : null],
        ["Shares", money(sub.stocksValue) ?? yes(sub.hasStocks)],
        ["EPF", money(sub.epfValue)],
        ["PPF", money(sub.ppfValue)],
        ["NPS", money(sub.npsValue)],
        ["EPF/PPF/NPS total", money(sub.retirementAccountsValue) ?? yes(sub.hasRetirementAccounts)],
        ["Other property", money(sub.investmentPropertyValue) ?? yes(sub.hasInvestmentProperty)],
        ["Home", [sub.ownHouseStatus, money(sub.ownHouseValue)].filter(Boolean).join(", ") || null],
        ["Gold", money(sub.goldValue) ?? yes(sub.hasGold)],
        ["Other assets", [sub.otherAssetsDescription, money(sub.otherAssetsValue)].filter(Boolean).join(", ") || yes(sub.hasOtherAssets)],
      ],
    },
    {
      title: "What they owe",
      rows: [
        ["Home loan", loan(sub.homeLoanOutstanding, sub.homeLoanEMI, sub.hasHomeLoan)],
        ["Vehicle loan", loan(sub.carLoanOutstanding, sub.carLoanEMI, sub.hasCarLoan)],
        ["Personal loan", loan(sub.personalLoanOutstanding, sub.personalLoanEMI, sub.hasPersonalLoan)],
        ["Credit card balance", money(sub.creditCardOutstanding) ?? yes(sub.hasCreditCardDebt)],
        ["Other loan", [sub.otherLoansDescription, loan(sub.otherLoansOutstanding, sub.otherLoansEMI, sub.hasOtherLoans)].filter(Boolean).join(": ") || null],
      ],
    },
    {
      title: "Insurance",
      rows: [
        ["Term life cover", money(sub.termInsuranceCover) ?? yes(sub.hasTermInsurance)],
        ["Health insurance", [sub.healthInsuranceType, money(sub.healthInsuranceCover)].filter(Boolean).join(", ") || null],
        ["Traditional policies", sub.hasTraditionalInsurance ? `Cover ${money(sub.traditionalInsuranceCover) ?? "not given"}, premium ${money(sub.traditionalInsurancePremium) ?? "not given"} a year` : yes(sub.hasTraditionalInsurance)],
      ],
    },
    {
      title: "Goals (in priority order)",
      rows: (Array.isArray(sub.goalsList) ? sub.goalsList : []).map((g: { name: string; targetYear: number | null; targetAmount: number }, i: number) => [
        `${i + 1}. ${g.name}`,
        [g.targetYear ? `by ${g.targetYear}` : null, g.targetAmount ? formatINR(g.targetAmount) : null].filter(Boolean).join(", ") || "No details given",
      ] as Row).concat(sub.retirementAge ? [["Wants to retire at", `${sub.retirementAge}`] as Row] : []),
    },
    {
      title: "Wrap-up",
      rows: [["Wants to discuss", sub.meetingTopics]],
    },
  ];

  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const rows = g.rows.filter(([, v]) => v !== null && v !== undefined && v !== "");
        return (
          <details key={g.title} className="group rounded-lg border border-brand-border open:bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-brand-darkText marker:hidden">
              {g.title}
              <span className="text-sm font-normal text-brand-mutedText">{rows.length ? `${rows.length} answers` : "Not answered"}</span>
            </summary>
            {rows.length ? (
              <dl className="divide-y divide-brand-border border-t border-brand-border">
                {rows.map(([k, v]) => (
                  <div key={k} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[14rem_1fr] sm:gap-4">
                    <dt className="text-[15px] text-brand-mutedText">{k}</dt>
                    <dd className="tabular whitespace-pre-wrap text-[15px] text-brand-darkText">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </details>
        );
      })}

      <details className="group rounded-lg border border-brand-border open:bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-brand-darkText">
          How they think about money
          <span className="text-sm font-normal text-brand-mutedText">15 questions</span>
        </summary>
        <ol className="divide-y divide-brand-border border-t border-brand-border">
          {RISK_QUESTIONS.map((q) => (
            <li key={q.key} className="px-4 py-3">
              <p className="text-[15px] text-brand-mutedText">
                {q.number}. {q.text}
              </p>
              <p className="mt-1 font-medium text-brand-darkText">
                {describeRiskAnswer(q.key, sub[q.key], sub.riskQ3NoHistory) ?? <span className="font-normal text-brand-mutedText">Not answered</span>}
              </p>
            </li>
          ))}
          <li className="px-4 py-3">
            <p className="text-[15px] text-brand-mutedText">
              {RISK_Q15.number}. {RISK_Q15.text}
            </p>
            <p className="mt-1 whitespace-pre-wrap font-medium text-brand-darkText">
              {sub.riskQ15 || <span className="font-normal text-brand-mutedText">Not answered</span>}
            </p>
          </li>
        </ol>
      </details>
    </div>
  );

  function loan(out: unknown, emi: unknown, has: unknown) {
    if (typeof out !== "number" && typeof emi !== "number") return yes(has);
    return [money(out) && `${money(out)} outstanding`, money(emi) && `EMI ${money(emi)}`].filter(Boolean).join(", ");
  }
}
