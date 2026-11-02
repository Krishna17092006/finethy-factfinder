import { describe, it, expect } from "vitest";
import { sanitizeIntakePayload, submissionProblem } from "../lib/intake-schema";
import { isValidMobile } from "../lib/validators";

describe("Intake payload allow-list", () => {
  it("drops fields a client must never write", () => {
    const { data } = sanitizeIntakePayload({
      fullName: "Asha Rao",
      status: "met",
      submittedAt: "2020-01-01",
      analysisJson: "{}",
      linkId: "x",
      id: "y",
      advisorNotes: { create: { content: "injected" } },
      link: { update: { token: "stolen" } },
      somethingElse: 1,
    });
    expect(data).toEqual({ fullName: "Asha Rao" });
  });

  it("rejects bad values field by field without losing the good ones", () => {
    const { data, rejected } = sanitizeIntakePayload({
      grossAnnualIncome: -5,
      monthlyExpenses: 40000,
      riskQ1: 9,
      riskQ2: 4,
      childrenDetails: "{not json",
      mobile: "98450abc",
    });
    expect(data).toEqual({ monthlyExpenses: 40000, riskQ2: 4 });
    expect(rejected.sort()).toEqual(["childrenDetails", "grossAnnualIncome", "mobile", "riskQ1"].sort());
  });

  it("accepts nulls (clearing an answer) and trims text", () => {
    const { data } = sanitizeIntakePayload({ city: "  Mysuru ", goldValue: null });
    expect(data).toEqual({ city: "Mysuru", goldValue: null });
  });

  it("maps the legacy riskQ3_neutral flag", () => {
    expect(sanitizeIntakePayload({ riskQ3_neutral: true }).data).toEqual({ riskQ3NoHistory: true });
  });

  it("ignores non-object bodies", () => {
    expect(sanitizeIntakePayload(null).data).toEqual({});
    expect(sanitizeIntakePayload([1, 2]).data).toEqual({});
  });
});

describe("Submission requirements", () => {
  it("needs a name, a valid mobile and consent", () => {
    expect(submissionProblem({ fullName: "A", mobile: "9845012345", consentGiven: true })).toMatch(/name/);
    expect(submissionProblem({ fullName: "Asha", mobile: "12345", consentGiven: true })).toMatch(/mobile/);
    expect(submissionProblem({ fullName: "Asha", mobile: "9845012345", consentGiven: false })).toMatch(/consent/);
    expect(submissionProblem({ fullName: "Asha", mobile: "9845012345", consentGiven: true })).toBeNull();
  });

  it("validates Indian mobile numbers", () => {
    expect(isValidMobile("9845012345")).toBe(true);
    expect(isValidMobile("+91 98450 12345")).toBe(true);
    expect(isValidMobile("0000000000")).toBe(false);
    expect(isValidMobile("5845012345")).toBe(false);
    expect(isValidMobile("98450")).toBe(false);
  });
});
