import { test, expect } from "@playwright/test";
import { signIn } from "./helpers";

/** Runs after client-journey (files run in order, one worker). */
test.describe("Advisor", () => {
  test("creates a client link, reviews a report, takes notes, downloads the PDF", async ({ page, request, context }) => {
    await signIn(page);

    // New client link
    await page.getByRole("button", { name: "New client link" }).click();
    await page.getByLabel(/Client name/).fill("Ravi Kumar");
    await page.getByLabel(/Mobile number/).fill("9876543210");
    await page.getByRole("button", { name: "Create link" }).click();
    const linkField = page.getByLabel("Client link");
    await expect(linkField).toHaveValue(/\/intake\/[\w-]{20,}$/);
    await expect(page.getByRole("link", { name: "Send on WhatsApp" })).toHaveAttribute("href", /wa\.me\/919876543210\?text=Namaste%20Ravi/);
    const clientUrl = await linkField.inputValue();
    await page.getByRole("button", { name: "Done" }).click();

    // The client sees their name pre-filled
    const client = await context.browser()!.newContext();
    const cp = await client.newPage();
    await cp.goto(clientUrl);
    await expect(cp.getByRole("heading", { name: "Namaste, Ravi." })).toBeVisible();
    await client.close();

    // The submitted report from the client journey
    await page.getByRole("button", { name: /^New/ }).click();
    await page.getByRole("link", { name: "Open report" }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Asha Rao/i);
    await expect(page.getByRole("heading", { name: /Needs attention/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Financial health check" })).toBeVisible();
    // EPF + PPF (5L) + bank (6L) = 11L of assets reach the analysis
    await expect(page.getByText("₹11L").first()).toBeVisible();

    // Answers are shown with the real question text
    await page.getByText("How they think about money", { exact: true }).click();
    await expect(page.getByText(/Your ₹10,00,000 investment falls/)).toBeVisible();

    // Notes
    await page.getByLabel("New note").fill("Called to confirm the meeting on Friday.");
    await page.getByRole("button", { name: "Save note" }).click();
    await expect(page.getByText("Called to confirm the meeting on Friday.")).toBeVisible();

    // Status workflow
    await page.getByLabel("Status").selectOption("reviewed");
    await expect(page.getByText(/Marked as reviewed/)).toBeVisible();

    // PDF download
    const pdfHref = await page.getByRole("link", { name: "Download PDF" }).getAttribute("href");
    const pdf = await page.request.get(pdfHref!);
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
    const body = await pdf.body();
    expect(body.subarray(0, 4).toString()).toBe("%PDF");
    expect(body.length).toBeGreaterThan(50_000);

    // Email (SMTP is off in tests, so it is logged and reported as such)
    await page.getByRole("button", { name: "Email report" }).click();
    await expect(page.getByText(/Email isn't set up yet/)).toBeVisible();

    // Dashboard reflects the new status, and the filter lives in the URL
    await page.goto("/advisor?tab=reviewed");
    await expect(page.getByRole("button", { name: /^Reviewed/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: /Asha Rao/i })).toBeVisible();

    // Sign out ends the session
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/advisor\/login/);
    expect((await request.get("/api/advisor/submissions")).status()).toBe(401);
  });

  test("a submitted client record cannot be deleted from the app", async ({ page }) => {
    await signIn(page);
    const list = await (await page.request.get("/api/advisor/submissions")).json();
    const id = list.submissions[0].id;
    const res = await page.request.delete(`/api/advisor/submissions/${id}`);
    expect(res.status()).toBe(409);
  });
});
