import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/** Fresh, empty test database for every run (never the real dev.db). */
export default function globalSetup() {
  const db = path.join(__dirname, "..", "prisma", "e2e.db");
  for (const f of [db, `${db}-journal`]) if (fs.existsSync(f)) fs.rmSync(f);
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: "file:./e2e.db" },
  });
}
