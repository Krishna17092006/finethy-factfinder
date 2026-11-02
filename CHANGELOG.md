# Changelog

## 2.0.0 (2026-11-02): rebuild

An audit of 1.0 found the problems below. Every item is fixed and covered by an
automated test where it can be.

### Security (critical)
- Advisor APIs (`/api/advisor/*`) were open to anyone: every client's name,
  phone and full financial details, their PDFs, and link creation needed no
  login. They are now guarded, and the browser password prompt is replaced by a
  sign-in page with sign-out.
- The client autosave accepted any database field (status, analysis, relations).
  It now accepts an allow-list with per-field validation.
- Submitted forms could be edited again once an advisor marked them reviewed.
  They are now locked.
- The thank-you page offered clients the advisor's internal PDF ("Demo Mode").
  Removed.
- Added rate limiting, security headers and `noindex` on private pages, and
  HTML-escaped emails.

### Broken features
- The production build failed (a leftover script imported a missing file).
- The advisor report page crashed (500), and the dashboard linked to a 404.
- `/intake` and the dashboard were prerendered at build time: in production every
  client would have shared one form, and the dashboard would never update.
- Typing a retirement age or a loan description crashed the form.
- The retirement-age question never appeared (goal-name mismatch).
- The welcome screen never showed, and "Do you have children?" started pre-answered.

### Calculations
- EPF / PPF / NPS entered individually were left out of net worth and retirement.
- Choosing "None" for dependents counted as one dependent.
- Emergency fund and savings rate were computed differently in the health table
  and the risk engine, so the report could contradict itself. There is now one
  source; case-study capacity is 60, inside the approved 55–65 band.
- "I wasn't investing then" (Q3) was discarded on save, so its scoring rule never ran.
- Goals ignored the client's ranking; dates of birth in DD/MM/YYYY broke the
  retirement year.
- The client's Q15 note and meeting topics never reached the advisor brief.
- Stored reports are versioned and recompute automatically after fixes.

### PDF
- 11 pages with four near-empty overflow pages became 8 full pages. Headings stay
  with their content, and the notes page fits one page.

### Client experience
- Rebuilt form: honest step ticks, Back/Next fixed at the bottom on phones,
  inline validation, autosave about a second after each change, answers kept on the
  device if the connection drops, native phone pickers, no timer.
- New home page; starting a form is a button (POST), so the 56 empty forms created
  by page visits stop appearing.
- Accessible colours (body text and orange buttons failed WCAG contrast), visible
  focus, skip link, reduced motion, correct heading order.
- 108 fewer npm packages (animation, input-mask and unused UI libraries removed).

### Advisor experience
- Dashboard with New / Reviewed / Meeting done / In progress / Not opened filters,
  search, flag counts, copy link, delete unfinished forms, remove blank forms.
- New client link dialog with WhatsApp share.
- Full report page: data checks, brief, attention list, questions to raise, health
  table, risk profile, money breakdown, every answer with its question, status,
  private notes, PDF and email.

### Housekeeping
- One header and one footer with the finethy.co details (two conflicting footers before).
- Dark mode code removed (owner decision).
- 30 scratch scripts removed from the repo (backed up outside it).
- README, `.env.example` without secrets, unit and browser test suites.
