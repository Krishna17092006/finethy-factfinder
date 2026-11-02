/**
 * Risk questionnaire: single source of truth.
 *
 * Used by the client form, the advisor web report and the PDF so the wording
 * can never drift between them. Wording is the owner-approved copy; change it
 * here only.
 *
 * Scores run 1 (most conservative) to 5 (most aggressive).
 */

export interface RiskOption {
  /** Stable id stored in the form (unique within the question). */
  id: string;
  score: number;
  label: string;
}

export interface RiskQuestion {
  key: `riskQ${number}`;
  number: number;
  text: string;
  hint?: string;
  options: RiskOption[];
}

const opts = (prefix: string, list: Array<[number, string]>): RiskOption[] =>
  list.map(([score, label], i) => ({ id: `${prefix}-${i}`, score, label }));

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    key: "riskQ1",
    number: 1,
    text: "Your ₹10,00,000 investment falls to ₹8,00,000 in three months. What do you do?",
    options: opts("q1", [
      [5, "Invest more while prices are low"],
      [4, "Hold and wait it out"],
      [3, "Hold, but check it constantly"],
      [2, "Sell some to limit further damage"],
      [1, "Sell everything and step away"],
    ]),
  },
  {
    key: "riskQ2",
    number: 2,
    text: "Imagine you are investing for one year. Which of these scenarios are you most comfortable with?",
    options: opts("q2", [
      [1, "A portfolio that could gain up to 6% or lose up to 1%"],
      [2, "A portfolio that could gain up to 12% or lose up to 6%"],
      [3, "A portfolio that could gain up to 20% or lose up to 12%"],
      [4, "A portfolio that could gain up to 30% or lose up to 22%"],
      [5, "A portfolio that could gain up to 40% or lose up to 35%"],
    ]),
  },
  {
    key: "riskQ3",
    number: 3,
    text: "During the market crash of March 2020, what did you actually do?",
    hint: "If you don't remember exactly, choose what's closest.",
    options: opts("q3", [
      [5, "Invested more"],
      [4, "Held everything, changed nothing"],
      [3, "Held, but stopped my SIPs"],
      [2, "Sold some investments"],
      [1, "Sold most or all of it"],
      // Neutral score; the weight of this question is redistributed (see risk.ts).
      [3, "I wasn't investing then"],
    ]),
  },
  {
    key: "riskQ4",
    number: 4,
    text: "How far would your investments have to fall before you lost sleep over it?",
    options: opts("q4", [
      [5, "A fall wouldn't affect my sleep"],
      [4, "Around 30% or more"],
      [3, "Around 20%"],
      [2, "Around 10%"],
      [1, "Any fall at all would worry me"],
    ]),
  },
  {
    key: "riskQ5",
    number: 5,
    text: "After a bad year, how long would you give an investment to recover before giving up on it?",
    options: opts("q5", [
      [5, "As long as it takes — I judge over decades"],
      [4, "Around 5 years"],
      [3, "Around 3 years"],
      [2, "Around 1 year"],
      [1, "A few months at most"],
    ]),
  },
  {
    key: "riskQ6",
    number: 6,
    text: "Which statement best describes your primary goal for investing?",
    options: opts("q6", [
      [1, "I want to keep my money completely safe, even if returns are low"],
      [2, "I want steady, small returns with very little risk"],
      [3, "I want a balance between moderate growth and safety"],
      [4, "I want strong growth and can accept significant market drops"],
      [5, "I want maximum possible growth and can stomach extreme volatility"],
    ]),
  },
  {
    key: "riskQ7",
    number: 7,
    text: "When investing, which is your bigger priority: protecting your money from losses, or growing your wealth?",
    options: opts("q7", [
      [1, "Always protecting my money, even if it means missing out on growth"],
      [2, "Mostly protecting my money, with a small focus on growth"],
      [3, "An equal balance of protection and growth"],
      [4, "Mostly growing my wealth, even if it means taking on risk"],
      [5, "Maximizing growth above all else, regardless of the risk"],
    ]),
  },
  {
    key: "riskQ8",
    number: 8,
    text: "You just received an unexpected ₹20 Lakh bonus. Where would you invest most of it?",
    options: opts("q8", [
      [1, "Keep it totally safe in a bank FD or savings account"],
      [2, "Mostly safe debt funds, with a tiny bit in the stock market"],
      [3, "A balanced 50-50 mix of safe debt funds and the stock market"],
      [4, "Mostly stock market (equity funds) for growth"],
      [5, "Entirely stock market, maybe even a few aggressive bets"],
    ]),
  },
  {
    key: "riskQ9",
    number: 9,
    text: "If an investment promised much higher returns but locked your money away for 5 years, would you do it?",
    options: opts("q9", [
      [5, "Absolutely, I don't mind locking my money away for better returns"],
      [4, "Yes, I'd do it for a large portion of my money"],
      [3, "Yes, but only for a small portion of my money"],
      [2, "Probably not, I prefer having access to my money"],
      [1, "No way, I need my money to be easily available"],
    ]),
  },
  {
    key: "riskQ10",
    number: 10,
    text: "How would you feel about a single investment making up 30% of your portfolio?",
    options: opts("q10", [
      [5, "Comfortable, if I believe in it"],
      [4, "Acceptable for a while"],
      [3, "Slightly uneasy"],
      [2, "I'd want to reduce it"],
      [1, "I'd never allow that"],
    ]),
  },
  {
    key: "riskQ11",
    number: 11,
    text: "How often would you check your investments?",
    options: opts("q11", [
      [5, "Once a year or less"],
      [4, "Every few months"],
      [3, "Monthly"],
      [2, "Weekly"],
      [1, "Daily"],
    ]),
  },
  {
    key: "riskQ12",
    number: 12,
    text: "How would you describe your understanding of how markets work?",
    options: opts("q12", [
      [5, "I understand market cycles and volatility well"],
      [4, "Reasonably good"],
      [3, "Basic"],
      [2, "Limited"],
      [1, "I'm starting from scratch"],
    ]),
  },
  {
    key: "riskQ13",
    number: 13,
    text: "How do you usually make financial decisions?",
    options: opts("q13", [
      [5, "Research thoroughly, then decide myself"],
      [4, "Research, then confirm with an advisor"],
      [3, "Rely mainly on my advisor's judgment"],
      [2, "Ask family or friends"],
      [1, "Go with my gut, or postpone deciding"],
    ]),
  },
  {
    key: "riskQ14",
    number: 14,
    text: "An investment your advisor recommended is down 15% after one year. Your reaction?",
    options: opts("q14", [
      [5, "This is normal — stay the course"],
      [4, "Ask for context, but stay invested"],
      [3, "Ask whether we should change something"],
      [2, "Ask to move to something safer"],
      [1, "Lose confidence in the recommendation"],
    ]),
  },
];

export const RISK_Q15 = {
  key: "riskQ15" as const,
  number: 15,
  text: "Is there anything about money, markets, or past investment experiences you'd like us to know?",
  hint: "For example, an experience that shaped how you invest.",
};

/** Which questions appear on each risk step of the form. */
export const RISK_STEPS: Array<{ title: string; intro?: string; keys: string[]; includeQ15?: boolean }> = [
  {
    title: "How you think about money",
    intro:
      "A few questions about how you think about money. There are no right answers — honest ones are the most useful.",
    keys: ["riskQ1", "riskQ2", "riskQ3", "riskQ4", "riskQ5"],
  },
  { title: "How you think about money (2/3)", keys: ["riskQ6", "riskQ7", "riskQ8", "riskQ9", "riskQ10"] },
  {
    title: "How you think about money (3/3)",
    keys: ["riskQ11", "riskQ12", "riskQ13", "riskQ14"],
    includeQ15: true,
  },
];

export const Q3_NO_HISTORY_LABEL = "I wasn't investing then";

export function getRiskQuestion(key: string): RiskQuestion | undefined {
  return RISK_QUESTIONS.find((q) => q.key === key);
}

/**
 * Human-readable answer for a stored score. Q3 needs the "no history" flag to
 * tell "Held, but stopped my SIPs" apart from "I wasn't investing then"
 * (both score 3).
 */
export function describeRiskAnswer(
  key: string,
  score: number | null | undefined,
  q3NoHistory?: boolean | null,
): string | null {
  if (score === null || score === undefined) return null;
  const q = getRiskQuestion(key);
  if (!q) return null;
  if (key === "riskQ3" && score === 3) {
    return q3NoHistory ? Q3_NO_HISTORY_LABEL : "Held, but stopped my SIPs";
  }
  return q.options.find((o) => o.score === score)?.label ?? null;
}
