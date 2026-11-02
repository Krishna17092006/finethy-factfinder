import { describe, it, expect } from "vitest";
import { deriveData, normalizeGoals } from "../lib/derive";
import { parseDateOfBirth, formatINRShort } from "../lib/utils";
import { formatDobInput } from "../components/intake/fields";
import { describeRiskAnswer } from "../config/questions";

describe("Derivation rules added in the rebuild", () => {
  it('"None" is not counted as a dependent', () => {
    expect(deriveData({ dependentTypes: '["None"]' }).totalDependents).toBe(0);
    expect(deriveData({ dependentTypes: '["Parents","In-laws"]' }).totalDependents).toBe(2);
  });

  it("EPF + PPF + NPS make up the retirement total; the legacy combined value still works", () => {
    expect(deriveData({ epfValue: 100, ppfValue: 200, npsValue: 300 }).retirementAccountsValue).toBe(600);
    expect(deriveData({ retirementAccountsValue: 3200000 }).retirementAccountsValue).toBe(3200000);
  });

  it("retirement year works with DD/MM/YYYY dates of birth", () => {
    const d = deriveData({ dateOfBirth: "15/05/1990", retirementAge: 60, selectedGoals: '["Retirement planning"]', goalDetails: "{}" });
    expect(d.retirementTargetYear).toBe(2050);
    expect(d.goalsList[0]).toEqual({ name: "Retirement planning", targetYear: 2050, targetAmount: 0 });
  });

  it("goals follow the client's ranking, including goals without details", () => {
    const goals = normalizeGoals(
      {
        selectedGoals: JSON.stringify(["Buying a house", "Children's education", "Wealth creation"]),
        goalDetails: JSON.stringify({ "Children's education": { targetYear: 2032, targetAmount: 2500000 }, "Buying a house": { targetYear: 2028 } }),
      },
      null,
    );
    expect(goals.map((g) => g.name)).toEqual(["Buying a house", "Children's education", "Wealth creation"]);
    expect(goals[1]).toEqual({ name: "Children's education", targetYear: 2032, targetAmount: 2500000 });
    expect(goals[2].targetYear).toBeNull();
  });
});

describe("Formatting and parsing", () => {
  it("parses real DD/MM/YYYY dates only", () => {
    expect(parseDateOfBirth("22/08/1982")?.getFullYear()).toBe(1982);
    expect(parseDateOfBirth("31/02/1990")).toBeNull();
    expect(parseDateOfBirth("22/08")).toBeNull();
    expect(parseDateOfBirth("")).toBeNull();
  });

  it("types the slashes in a date of birth automatically", () => {
    expect(formatDobInput("2")).toBe("2");
    expect(formatDobInput("2208")).toBe("22/08");
    expect(formatDobInput("22081982")).toBe("22/08/1982");
    expect(formatDobInput("22/08/19825")).toBe("22/08/1982");
  });

  it("shows short rupee amounts", () => {
    expect(formatINRShort(25520000)).toBe("₹2.6Cr");
    expect(formatINRShort(172000)).toBe("₹1.7L");
    expect(formatINRShort(-45000)).toBe("−₹45K");
  });

  it("describes risk answers in words, telling the two Q3 '3' answers apart", () => {
    expect(describeRiskAnswer("riskQ1", 5)).toBe("Invest more while prices are low");
    expect(describeRiskAnswer("riskQ3", 3, true)).toBe("I wasn't investing then");
    expect(describeRiskAnswer("riskQ3", 3, false)).toBe("Held, but stopped my SIPs");
    expect(describeRiskAnswer("riskQ7", null)).toBeNull();
  });
});
