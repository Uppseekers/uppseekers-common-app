# University shortlist report → emailed to Akash on submit

## 1. Seed benchmark data (DB)

Create one new table:

**`university_benchmarks`** — seeded from `Benchmarking_USA_1.xlsx`
- `id`, `course_key` (cs-ai / ds-stats / business / finance-eco), `rank`, `university`, `country`
- `q1`–`q10` (numeric), `total` (numeric)
- ~130 unis × 4 courses = ~520 rows seeded once

No reference table for the question rubric is needed — the 10 dimensions and their max scores are constants we hardcode (small, stable, easier to tune).

## 2. Score the applicant (server-side)

Based on the rubric in `University_Readiness_new_2.xlsx`, derive a 0–100 score from the data the applicant already enters in onboarding. Mapping:

| # | Dimension (max)            | Source in current profile                                     |
|---|----------------------------|---------------------------------------------------------------|
| 1 | Academics (40)             | `academics.gpa` + `gpa_scale` → bucket → score                |
| 2 | Advanced coursework (7.5)  | `academics.honors_courses` + `testing.ap_scores` count        |
| 3 | Competitions (7.5)         | `activities` where category mentions olympiad/competition/hackathon |
| 4 | Research / projects (11.2) | `activities` where category mentions research/project + essays signal |
| 5 | Technical tools (7.5)      | `activities` description keywords (Python, Excel, modeling…)  |
| 6 | Internships (7.5)          | `activities` where category mentions internship               |
| 7 | Foundations (3.8)          | `testing.sat_math` / `act` / olympiad flag                    |
| 8 | Recognition (3.8)          | `activities` where description mentions award/national/intl   |
| 9 | Impact project (3.8)       | `activities` where category = volunteer/community + impact    |
| 10| MOOCs / certs (7.5)        | `activities` or `academics.notable_subjects` MOOC keywords    |

Keyword matching is intentionally simple and explainable; we can refine later.

## 3. Match to course

- Look at `preferences.intended_majors`; pick the closest `course_key` (CS/AI, DS/Stats, Business, Finance&Eco). Default = CS/AI if unmatched.
- For each of the ~130 unis in that course, compute `gap = benchmark.total − applicant.total`:
  - `gap ≤ 0` → **Safe** (90–99% match)
  - `gap ≤ 10` → **Target** (60–80%)
  - `gap ≤ 20` → **Reach** (30–50%)
  - `gap > 20`  → **Dream** (10–25%)
- Take top 4 Dream + top 5 Target + 3 Safe = 12 unis.

## 4. Update the advisor email

Extend `renderEmailHtml` in `src/lib/onboarding.functions.ts` to append a **"University Shortlist"** section styled like the landing-page Universities cards (Dream/Target/Safe pills, match %, country, gradient progress bar — same color tones).

Also include the applicant's overall readiness score (e.g. "Profile score: 62.4 / 100").

## 5. Trigger

Already wired — `submitProfile` runs on submit and sends to `akash@uppseekers.com`. We add the shortlist HTML inside that same email. No second email, no user-facing UI changes.

---

## Files touched

- **migration** — create `university_benchmarks` table (no RLS needed; server-only read via service role)
- **insert** — seed ~520 rows from the Excel files
- **`src/lib/university-matcher.ts`** (new) — pure scoring + matching logic
- **`src/lib/onboarding.functions.ts`** — call matcher inside `submitProfile`, extend email HTML

No UI changes. No new user-facing routes.
