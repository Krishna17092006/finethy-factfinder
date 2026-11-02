import { test, expect } from "@playwright/test";
import { answer, next } from "./helpers";

/**
 * A client fills in the whole form (runs on desktop AND a phone viewport),
 * comes back later, and submits. Two clients must never share a form.
 */
test("client completes the fact-finder end to end", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start the fact-finder" }).click();
  await expect(page).toHaveURL(/\/intake\/[\w-]+$/);
  const url = page.url();

  await expect(page.getByRole("heading", { name: /Namaste/ })).toBeVisible();
  await page.getByRole("button", { name: "Let's begin" }).click();

  // Step 1 validation
  await next(page);
  await expect(page.getByText("Enter your full name.")).toBeVisible();
  await expect(page.getByText(/Enter a 10-digit mobile number/)).toBeVisible();

  await page.getByLabel(/Full name/).fill("Asha Rao");
  await page.getByLabel(/Mobile number/).fill("9845012345");
  await page.getByLabel("Date of birth", { exact: true }).fill("15051988");
  await expect(page.getByLabel("Date of birth", { exact: true })).toHaveValue("15/05/1988");
  await page.getByLabel("Marital status").selectOption("Married");
  await answer(page, "Is your spouse also earning?", "Yes");
  await page.getByLabel(/Spouse's yearly income/).fill("900000");
  await answer(page, "Do you have children?", "Yes");
  await page.getByRole("radio", { name: "2" }).click();
  await page.getByRole("button", { name: "Parents" }).click();
  await page.getByRole("button", { name: "Yes, that's right" }).click();
  await expect(page.getByText(/You told us/)).toBeVisible();
  await next(page);

  // Step 2: income
  await expect(page.getByRole("heading", { name: "Income and expenses" })).toBeVisible();
  await page.getByLabel("What do you do for a living?").selectOption("Salaried–Private");
  await page.getByLabel(/Your yearly income/).fill("2400000");
  await expect(page.getByText("24 Lakh")).toBeVisible();
  await page.getByLabel("Average monthly household expenses").fill("80000");
  await next(page);

  // Step 3: assets, including EPF/PPF/NPS boxes
  await answer(page, "Bank savings and fixed deposits", "Yes");
  await page.getByLabel("Approximate value today").first().fill("600000");
  await answer(page, "Mutual funds", "No");
  await answer(page, "Shares (direct equity)", "No");
  await answer(page, "EPF, PPF or NPS", "Yes");
  await page.getByRole("checkbox", { name: "EPF" }).check();
  await page.getByLabel("EPF balance").fill("300000");
  await page.getByRole("checkbox", { name: "PPF" }).check();
  await page.getByLabel("PPF balance").fill("200000");
  await answer(page, "Property other than your home", "No");
  await answer(page, "Gold and jewellery", "No");
  await answer(page, "Anything else (business, crypto, etc.)", "No");
  await page.getByLabel("Your home", { exact: true }).selectOption("Renting");
  await expect(page.getByText("₹11,00,000")).toBeVisible(); // 6L + 3L + 2L
  await next(page);

  // Step 4: loans
  await page.getByRole("button", { name: "I have no loans" }).click();
  await next(page);

  // Step 5: insurance
  await answer(page, "Pure term life insurance", "No");
  await page.getByText("Personal policy", { exact: true }).click();
  await page.getByLabel(/Total cover for the family/).fill("1000000");
  await answer(page, "Traditional policies (LIC, ULIPs, money-back)", "No");
  await next(page);

  // Step 6: goals, the retirement-age field must appear
  await page.getByRole("button", { name: "Retirement planning" }).click();
  await page.getByRole("button", { name: "Children's education" }).click();
  await page.getByRole("button", { name: "Move Children's education up" }).click();
  await page.getByLabel("Age you want to retire at").fill("58");
  await page.getByLabel("Target year").selectOption(String(new Date().getFullYear() + 10));
  await next(page);

  // Steps 7–9: answer every risk question with the first option
  for (let step = 0; step < 3; step++) {
    const groups = page.locator("fieldset").filter({ has: page.locator('input[type="radio"]') });
    const n = await groups.count();
    for (let i = 0; i < n; i++) await groups.nth(i).locator("label").first().click();
    if (step === 2) await page.getByLabel(/15\. Is there anything/).fill("Lost money in a ULIP once.");
    await next(page);
  }

  // The step bar marks every step answered
  const answered = page.getByRole("button", { name: /\(answered\)/ });
  await expect(answered).toHaveCount(9);

  // Leave and come back: answers were saved
  await page.waitForTimeout(1600);
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Wrap-up" })).toBeVisible();

  // Submit needs consent
  await page.getByRole("button", { name: "Submit my answers" }).click();
  await expect(page.getByText("Tick this box so we can prepare your review.")).toBeVisible();
  await page.getByRole("checkbox", { name: /I agree to FINETHY/ }).check();
  await page.getByRole("button", { name: "Submit my answers" }).click();

  await expect(page).toHaveURL(/\/success$/);
  await expect(page.getByRole("heading", { name: "Thank you, Asha." })).toBeVisible();

  // The form is locked after submitting
  await page.goto(url);
  await expect(page).toHaveURL(/\/success$/);
});

test("two clients starting from the website get separate forms", async ({ browser }) => {
  const a = await (await browser.newContext()).newPage();
  const b = await (await browser.newContext()).newPage();
  for (const p of [a, b]) {
    await p.goto("/");
    await p.getByRole("button", { name: "Start the fact-finder" }).click();
    await expect(p).toHaveURL(/\/intake\/[\w-]+$/);
  }
  expect(a.url()).not.toBe(b.url());
});
