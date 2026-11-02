# FINETHY Fact-Finder

A pre-meeting financial fact-finder for FINETHY LLP. A client opens a private link,
answers 10 short steps about their family, money, insurance, goals and attitude to
risk, and submits. The advisor then gets a scored report (13 health measures, a risk
profile, questions to raise) on the web and as a branded PDF.

- **Clients** use `/` (start a form) and `/intake/<link>` (their own form).
- **Advisors** sign in at `/advisor` to create links, review reports, take notes
  and download PDFs.

## Quick start (Windows, macOS or Linux)

Requires Node.js 20 or newer.

```bash
npm install
copy .env.example .env      # macOS/Linux: cp .env.example .env
# edit .env: set ADVISOR_USERNAME, ADVISOR_PASSWORD and SESSION_SECRET
npx prisma db push          # creates prisma/dev.db (safe to run again; it keeps data)
npm run dev                 # http://localhost:3000
```

Open http://localhost:3000 for the client side and http://localhost:3000/advisor for
the advisor side.

To try it with sample data, run `npm run db:seed` (adds the "Suresh Venkatesan"
case study) while `npm run dev` is running.

## Everyday use

| Task | Where |
| --- | --- |
| Send a client their form | Advisor → **New client link** → *Copy link* or *Send on WhatsApp* |
| See new submissions | Advisor → **New** filter |
| Read a client's report | **Open report**: brief, red/yellow flags, questions to raise, every answer |
| Track progress | Report → **Status**: New → Reviewed → Meeting done |
| Keep private notes | Report → **Your notes** (never shown to the client or in the PDF) |
| Get the PDF | Report → **Download PDF** or **Open PDF** |
| Clear blank forms | **Not opened yet** → *Remove blank forms* (only unnamed forms nobody typed in) |

When a client submits, the PDF is emailed to `ADVISOR_EMAIL` if SMTP is configured.
Without SMTP the email is printed in the server log instead, and the report page
says so.

## Configuration (`.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite file, `file:./dev.db` |
| `ADVISOR_USERNAME`, `ADVISOR_PASSWORD` | yes | Advisor sign-in. Use a long password. |
| `SESSION_SECRET` | recommended | Signs login sessions. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `APP_URL` | yes in production | Public address used in client links and emails, e.g. `https://factfinder.finethy.co` |
| `ADVISOR_EMAIL` | for email | Inbox that receives new reports |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | for email | Gmail: use an App Password |

Never commit `.env`. It is git-ignored.

## Checks and tests

```bash
npm run check        # type check + lint + unit tests
npm test             # unit tests only (Vitest, 46 tests)
npm run build        # production build
npm run test:e2e     # browser tests (Playwright); run `npm run build` first
```

- **Unit tests** (`src/__tests__`) cover the finance engines, the risk engine, input
  validation and login sessions. `case-study.test.ts` locks the owner-approved
  Suresh Venkatesan numbers (net worth ₹2,55,20,000, surplus ₹1,72,000, 2 red /
  2 yellow, capacity 55–65). If it fails, the maths changed: confirm with the owner
  before updating it.
- **Browser tests** (`e2e/`) run a production server on port 3200 against a
  separate database, `prisma/e2e.db`, which is wiped each run. Your real data in
  `dev.db` is never touched. They cover security (no data without signing in), the
  full client journey on desktop and phone, and the advisor journey (links, report,
  notes, status, PDF, sign out).

## Deploying

The app is a standard Next.js server with a SQLite file, so it needs one machine
with a persistent disk (a VPS, a Windows/Linux office server, Railway, Render or
Fly.io with a volume). Serverless hosts without a disk (plain Vercel) are not
suitable for SQLite.

```bash
npm ci
npx prisma db push
npm run build
npm start            # port 3000; put HTTPS in front (Caddy, Nginx, or the host's proxy)
```

- Set `APP_URL` to the real https address, and set a strong `SESSION_SECRET`.
- **Back up `prisma/dev.db` daily.** It holds every client's data.
- If the app ever runs on more than one server, move to PostgreSQL and replace
  the in-memory rate limiter (`src/lib/rate-limit.ts`).

## How it is built

| Area | Files |
| --- | --- |
| Pages | `src/app` (Next.js App Router). Every data page is server-rendered on request. |
| Client form | `src/components/intake`: `IntakeForm.tsx` (steps, autosave, offline copy), `sections.tsx` (the 10 steps), `fields.tsx` (inputs) |
| Advisor UI | `src/components/advisor` |
| Questionnaire wording | `src/config/questions.ts` (one place for the form, report and PDF) |
| Business details | `src/config/site.ts` (address, phone, ARN, from finethy.co) |
| Health thresholds | `src/config/healthRanges.ts` |
| Calculations | `src/lib/derive.ts` (single source of derived numbers) → `analysis.ts` (13 measures) and `risk.ts` (capacity / tolerance) → `report.ts` (brief, questions) |
| Stored results | `src/lib/analysis-cache.ts`. Results carry `ANALYSIS_VERSION`; bump it when the maths changes and old reports recompute themselves. |
| PDF | `src/components/report` + `src/lib/pdf.tsx` (letterhead from `public/Finethy - Letterhead.pdf`) |
| Security | `src/middleware.ts` (guards `/advisor` and `/api/advisor`), `src/lib/auth/session.ts`, `src/lib/intake-schema.ts` (what a client may write) |

### Security model

- Advisor pages and APIs need a signed, 12-hour session cookie (HttpOnly,
  SameSite=Lax). Sign-in is rate-limited, and credentials are compared in constant time.
- A client link is a 128-bit random token. It only gives access to that one form,
  and only to the fields listed in `intake-schema.ts`. Once submitted, a form is locked.
- Security headers (CSP, frame blocking, nosniff) are set in `next.config.mjs`.
  Client links and advisor pages are marked `noindex`.

## Changes

See [CHANGELOG.md](CHANGELOG.md).
