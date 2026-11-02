import { test, expect } from "@playwright/test";

/** Advisor data must never be reachable without signing in. */
test.describe("Security", () => {
  for (const path of [
    "/api/advisor/submissions",
    "/api/advisor/links",
    "/api/advisor/submissions/anything",
    "/api/advisor/submissions/anything/pdf",
  ]) {
    test(`GET ${path} needs a session`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(401);
      expect(await res.json()).toEqual({ error: "Not signed in" });
    });
  }

  test("creating a link needs a session", async ({ request }) => {
    const res = await request.post("/api/advisor/links", { data: { clientName: "Intruder" } });
    expect(res.status()).toBe(401);
  });

  test("advisor pages redirect to the login page", async ({ page }) => {
    await page.goto("/advisor");
    await expect(page).toHaveURL(/\/advisor\/login\?next=%2Fadvisor/);
    await expect(page.getByRole("heading", { name: "Advisor sign in" })).toBeVisible();
  });

  test("wrong password is refused", async ({ request }) => {
    const res = await request.post("/api/auth/login", { data: { username: "e2e-advisor", password: "nope" } });
    expect(res.status()).toBe(401);
  });

  test("forged session cookie is refused", async ({ request }) => {
    const res = await request.get("/api/advisor/submissions", {
      headers: { cookie: "ff_session=eyJ1IjoiZTJlLWFkdmlzb3IiLCJleHAiOjk5OTk5OTk5OTl9.forged" },
    });
    expect(res.status()).toBe(401);
  });

  test("security headers are sent", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("a client cannot change protected fields through autosave", async ({ page, request }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Start the fact-finder" }).click();
    await expect(page).toHaveURL(/\/intake\/[\w-]+$/);
    const token = page.url().split("/").pop()!;

    const res = await request.put(`/api/intake/${token}`, {
      data: { fullName: "Mallory", status: "met", analysisJson: "{}", consentGiven: true },
    });
    expect(res.ok()).toBeTruthy();
    const view = await (await request.get(`/api/intake/${token}`)).json();
    expect(view.status).toBe("draft");
    expect(view.submission.fullName).toBe("Mallory");
    expect(view.submission.consentGiven).toBe(false);
  });

  test("visiting the home page or /intake does not create forms", async ({ page, request }) => {
    await page.goto("/");
    await page.goto("/intake");
    await expect(page).toHaveURL(/\/$/);
    // Unknown token: friendly message, not a crash
    const res = await request.get("/intake/does-not-exist");
    expect(res.status()).toBe(200);
    await page.goto("/intake/does-not-exist");
    await expect(page.getByRole("heading", { name: "We couldn't find this form" })).toBeVisible();
  });
});
