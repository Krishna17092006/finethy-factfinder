import { describe, it, expect, beforeEach } from "vitest";
import { checkCredentials, createSessionToken, verifySessionToken } from "../lib/auth/session";

describe("Advisor session", () => {
  beforeEach(() => {
    process.env.ADVISOR_USERNAME = "advisor";
    process.env.ADVISOR_PASSWORD = "a-long-test-password";
    delete process.env.SESSION_SECRET;
  });

  it("round-trips a valid token", async () => {
    const token = await createSessionToken("advisor");
    expect(await verifySessionToken(token)).toMatchObject({ u: "advisor" });
  });

  it("rejects a tampered token", async () => {
    const token = (await createSessionToken("advisor"))!;
    const [body, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ u: "advisor", exp: 9999999999 })).toString("base64url");
    expect(await verifySessionToken(`${forged}.${sig}`)).toBeNull();
    expect(await verifySessionToken(`${body}.${sig.slice(0, -2)}xx`)).toBeNull();
    expect(await verifySessionToken("garbage")).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });

  it("expires after 12 hours", async () => {
    const issued = Date.now() - 13 * 60 * 60 * 1000;
    const token = await createSessionToken("advisor", issued);
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("logs everyone out when the password changes", async () => {
    const token = await createSessionToken("advisor");
    process.env.ADVISOR_PASSWORD = "a-new-password-entirely";
    expect(await verifySessionToken(token)).toBeNull();
  });

  it("checks credentials exactly", async () => {
    expect(await checkCredentials("advisor", "a-long-test-password")).toBe(true);
    expect(await checkCredentials("advisor", "a-long-test-passwor")).toBe(false);
    expect(await checkCredentials("Advisor", "a-long-test-password")).toBe(false);
    expect(await checkCredentials("", "")).toBe(false);
  });
});
