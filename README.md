# Uppseekers - Common University Applications

Build a modern AI-powered undergraduate admissions evaluation web app inspired by the workflow structure of Common App, but completely original in branding, UI, and implementation.

The platform helps students evaluate their admission chances for top global universities by collecting their academic, extracurricular, testing, and profile data and then generating:

1. Academic Profile Score

2. Overall Admissions Readiness Score

3. University Recommendations

4. Safe / Target / Dream categorization

5. AI-powered improvement suggestions

The platform should feel premium, modern, clean, highly trustworthy, and optimized for students aged 14–19 and their parents.

---------------------------------------------------

PRODUCT NAME (TEMPORARY)

---------------------------------------------------

Use temporary branding:

"AdmitIQ AI"

Tagline:

"Know where you stand before you apply."

---------------------------------------------------

TECH STACK

---------------------------------------------------

Frontend:

- Next.js 14

- TypeScript

- TailwindCSS

- ShadCN UI

- Framer Motion

- React Hook Form

- Zod validation

Backend:

- Supabase

Use:

- Supabase Auth

- Supabase PostgreSQL Database

- Supabase Storage

AI:

- OpenAI API integration placeholders

- Gemini API placeholders

Charts:

- Recharts

Deployment:

- Vercel-ready

---------------------------------------------------

DESIGN SYSTEM

---------------------------------------------------

Design style:

- Modern SaaS

- Minimal but premium

- Apple + Notion + Stripe inspired

- Soft shadows

- Rounded corners (2xl)

- Clean typography

- Spacious layouts

- Smooth animations

- Dark/light mode toggle

- Mobile responsive

Primary colors:

- Indigo

- Blue

- White

- Light gray

Accent:

- Emerald for success

- Orange for target

- Red for dream/reach

Use:

- Glassmorphism on cards

- Sticky sidebar navigation

- Progress tracking UI

- Beautiful onboarding flow

- Animated progress bars

- Modern dashboards

---------------------------------------------------

USER TYPES

---------------------------------------------------

1. Student

2. Parent (future-ready only)

For now only implement:

- Student dashboard

---------------------------------------------------

AUTHENTICATION

---------------------------------------------------

Build:

- Sign Up

- Sign In

- Forgot Password

- Google Login

- Email verification

- Persistent session

User flow:

1. User lands on homepage

2. Clicks "Get Your Admit Score"

3. Signs up

4. Completes onboarding

5. Gets dashboard access

---------------------------------------------------

LANDING PAGE

---------------------------------------------------

Create a beautiful modern landing page.

Sections:

1. Hero section

2. Trusted admissions intelligence

3. How it works

4. Features

5. University recommendation preview

6. Student success style cards

7. CTA section

8. Footer

Hero CTA:

- Start Free Profile Review

- Calculate My Chances

Include:

- Animated mock dashboard preview

- University logos placeholders

- Modern floating UI cards

---------------------------------------------------

ONBOARDING FLOW

---------------------------------------------------

Create a multi-step onboarding form with progress tracking.

Sidebar should show:

- Profile

- Family

- Education

- Testing

- Activities

- Writing

- Courses & Grades

- Review & Submit

Autosave progress to Supabase.

---------------------------------------------------

SECTION 1: PROFILE

---------------------------------------------------

Fields:

- First Name

- Last Name

- DOB

- Gender

- Nationality

- Current Grade/Class

- School Name

- School Board

- Intended Major

- Target Countries

- Preferred Intake Year

Add:

- Searchable dropdowns

- Country selector

- Major selector

- Validation

---------------------------------------------------

SECTION 2: FAMILY DETAILS

---------------------------------------------------

Fields:

- Parent education

- Parent occupation

- Household income range

- First generation college student

- Languages spoken

- Number of family members

UI:

- Card based inputs

- Dropdowns

- Toggle switches

---------------------------------------------------

SECTION 3: EDUCATION

---------------------------------------------------

Fields:

- GPA

- Percentage

- Predicted grades

- Class rank

- Curriculum type

- Academic honors

Add:

- Dynamic grading system support

- IB / CBSE / ICSE / IGCSE / State board options

Create:

- Academic rigor indicator

---------------------------------------------------

SECTION 4: TESTING

---------------------------------------------------

Fields:

- SAT

- ACT

- IELTS

- TOEFL

- DET

- AP Exams

- Olympiads

- JEE/NEET optional

Add:

- Add multiple test scores

- Score validation

- Percentile estimation

---------------------------------------------------

SECTION 5: ACTIVITIES

---------------------------------------------------

This should be one of the strongest sections.

Allow:

- Up to 10 activities

Each activity:

- Activity title

- Category

- Leadership level

- Description

- Grades participated

- Hours per week

- Weeks per year

- Achievement level

- Organization name

Categories:

- Research

- Internship

- NGO

- Startup

- Sports

- Music

- Olympiads

- Debate

- MUN

- Volunteering

- Hackathon

- Coding

- Content Creation

- Entrepreneurship

Add:

- Drag and drop reorder

- AI impact strength indicator

- Leadership score indicator

---------------------------------------------------

SECTION 6: WRITING

---------------------------------------------------

Allow:

- Personal statement upload

- SOP upload

- Essay text paste

Add:

- Word counter

- AI essay quality placeholder

- Essay authenticity placeholder

Storage:

- Save in Supabase storage

---------------------------------------------------

SECTION 7: COURSES & GRADES

---------------------------------------------------

Allow semester-wise input.

Fields:

- Subject

- Grade

- Course level

- Academic year

Features:

- Add/remove rows dynamically

- GPA trend visualization

- Academic rigor analysis

---------------------------------------------------

FINAL REVIEW PAGE

---------------------------------------------------

Show:

- Completed sections

- Missing fields

- Readiness percentage

Button:

"Generate My Admit Score"

---------------------------------------------------

AI PROFILE SCORING ENGINE

---------------------------------------------------

Create a mock scoring engine for MVP.

Generate:

1. Academic Score

2. Extracurricular Score

3. Leadership Score

4. Writing Score

5. Overall Profile Score

Score range:

0–100

Create realistic weighted calculations.

Example logic:

- SAT > 1500 increases academic score

- Leadership roles increase leadership score

- National awards increase extracurricular score

Make scoring modular and easy to replace with AI later.

---------------------------------------------------

RESULT DASHBOARD

---------------------------------------------------

After submission show a premium analytics dashboard.

Include:

- Circular score meters

- Radar chart

- Profile strength visualization

- University fit analysis

- Academic readiness

- Weakness analysis

Sections:

1. Overall Admit Score

2. Academic Analysis

3. Activity Impact

4. Leadership Strength

5. Essay Readiness

6. Recommended Improvements

---------------------------------------------------

UNIVERSITY RECOMMENDATION ENGINE

---------------------------------------------------

Create a university recommendation system.

Use mock dataset initially.

Categories:

1. Safe Universities

2. Target Universities

3. Dream Universities

Each university card should include:

- University name

- Country

- Match percentage

- Estimated admission probability

- Tuition estimate

- Scholarship possibility

- Why this matches

Include universities like:

- Stanford

- MIT

- Harvard

- Purdue

- ASU

- UIUC

- UBC

- NTU Singapore

- University of Toronto

- TU Munich

Create:

- Search

- Filters

- Country filters

- Major filters

---------------------------------------------------

UNIVERSITY DATA MODEL

---------------------------------------------------

Fields:

- Name

- Country

- QS ranking

- Acceptance rate

- SAT range

- GPA range

- Tuition

- Scholarships

- International student friendliness

- STEM strength

- Business strength

---------------------------------------------------

DASHBOARD FEATURES

---------------------------------------------------

Student dashboard should show:

- Profile completion

- Latest score

- Saved universities

- Suggested improvements

- Application readiness timeline

Add:

- Modern analytics widgets

- Animated charts

- Progress tracking

---------------------------------------------------

AI IMPROVEMENT SUGGESTIONS

---------------------------------------------------

Generate dynamic suggestions like:

- Improve SAT by 100 points

- Add leadership experience

- Publish research

- Improve essay storytelling

- Build stronger spike profile

Display:

- Priority labels

- Estimated impact improvement

---------------------------------------------------

DATABASE SCHEMA

---------------------------------------------------

Create Supabase schema for:

- users

- profiles

- family_details

- academics

- testing

- activities

- essays

- courses

- universities

- recommendations

- scores

Add:

- Foreign key relationships

- Proper indexing

- Row-level security

---------------------------------------------------

SECURITY

---------------------------------------------------

Implement:

- Protected routes

- Authentication guards

- Secure API routes

- Input validation

- File upload validation

---------------------------------------------------

ANIMATIONS

---------------------------------------------------

Use Framer Motion for:

- Page transitions

- Progress indicators

- Hover cards

- Dashboard loading animations

- Score reveal animations

---------------------------------------------------

EXTRA FEATURES

---------------------------------------------------

Add placeholders for future:

- Counselor dashboard

- Parent dashboard

- AI chatbot

- Essay reviewer

- Scholarship finder

- Application tracker

- CRM integration

- Common App export

---------------------------------------------------

IMPORTANT

---------------------------------------------------

Do NOT replicate Common App branding or exact UI.

Only replicate the logical structure of undergraduate application workflows.

The app must feel:

- Original

- Premium

- Trustworthy

- AI-first

- Built for Gen Z students and parents

---------------------------------------------------

DELIVERABLES

---------------------------------------------------

Generate:

1. Full frontend UI

2. Backend integration

3. Database schema

4. Dummy university dataset

5. Mock scoring engine

6. Responsive layouts

7. Authentication flow

8. Dashboard analytics

9. Complete onboarding flow

10. Production-ready code structure

Make the code modular, scalable, and startup-grade.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://uppseekers-common-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5ea3e5e0-f616-4117-825d-57478e45075f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
