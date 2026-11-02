import { expect, type Page } from "@playwright/test";
import { E2E_PASS, E2E_USER } from "../playwright.config";

export async function signIn(page: Page) {
  await page.goto("/advisor/login");
  await page.getByLabel("Username").fill(E2E_USER);
  await page.getByLabel("Password").fill(E2E_PASS);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/advisor$/);
}

/** Click a Yes/No pair by its question text. */
export async function answer(page: Page, question: string | RegExp, value: "Yes" | "No") {
  const group = page.getByRole("group", { name: question });
  await group.getByText(value, { exact: true }).click();
}

export async function next(page: Page) {
  await page.getByRole("button", { name: /^Next/ }).click();
}
