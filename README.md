# AI Study Profile

A mobile-first, anonymous five-question reflection for College Success and Beyond.
React + TypeScript + Vite, a Render Static Site, and Supabase PostgreSQL.

## Classroom links

- Student assessment: https://ai-qr-9oax.onrender.com/
- Instructor dashboard: https://ai-qr-9oax.onrender.com/#/instructor
- Classroom QR page and downloadable 1200px PNG: https://ai-qr-9oax.onrender.com/#/qr

## Instructor access (one-time)

1. In the AI-QR Supabase project, open **Authentication → Users → Add user → Create new user**.
2. Create your own instructor email/password account and select **Auto Confirm User**. Do not create student accounts.
3. Copy that user's UUID. In Supabase SQL Editor, run `supabase/add-instructor.sql`, replacing its UUID placeholder.
4. Open the instructor dashboard and sign in. Sign out on shared devices.

The instructor dashboard returns only aggregates: response count, average score, category counts and percentages, question averages, and program breakdowns. An account must be in the private instructor allowlist; signing in alone does not grant access. No public signup form exists. Instructor sign-in tokens stay in memory and are never attached to assessment submissions. Reloading the dashboard requires signing in again.

## Database setup

`supabase/setup.sql` is already applied to the connected AI-QR project. **Do not run it again on this project.** For a fresh Supabase project, run it once in the SQL Editor.

The response table contains only an anonymous random submission UUID, timestamp, five 1–4 answers, generated total/category, and optional program area. No names, student emails, student IDs, fingerprints, or tracking cookies are collected by the app. Hosting providers may retain their standard operational request logs.

The browser can INSERT answers but cannot SELECT, UPDATE, or DELETE responses. PostgreSQL computes and validates totals and categories. Only a private instructor-checked function can aggregate results; the public RPC wrapper runs as the caller. Never expose `ai_study_private` as a Data API schema.

Student results are scored immediately on the device. Saving happens afterward with a 10-second timeout, and a failure message does not remove or delay the profile. Submitting twice by double tapping is prevented during a single assessment. Reloading starts a new assessment. Counts are submissions, not verified unique students. Anonymous public submissions can be repeated; there is deliberately no identity tracking.

## Local development

Use Node 22.12+ (Node 24 recommended).

```sh
npm install
cp .env.example .env
# Fill in the project URL and PUBLISHABLE key in .env.
npm run dev
```

Only public configuration uses VITE_ variables. A service-role or secret key must NEVER be used here.

```sh
npm test
npm run build
```

Dependencies are pinned and a package lock is included. Scoring tests cover all 1,024 valid response combinations and reject invalid input.

## Render

Use the existing AI-QR Static Site, repository `bfdtally/AI-QR`, branch `main`.

- Root Directory: blank
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- `VITE_SUPABASE_URL`: the connected project's HTTPS URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the project's publishable key
- `VITE_PUBLIC_STUDENT_URL`: optional; the classroom assessment URL. Without it, the QR page uses the current site's root URL.

Set environment variables before building; Vite embeds public values during the build. Rebuild after changing them. `render.yaml` supplies matching settings for fresh deployments. Hash routes work without a rewrite; the Blueprint also includes SPA fallback routing. Instructor access never depends on a hidden route or a browser-side password.

## QR code for PowerPoint

Open the live `/#/qr` page and choose **Download QR PNG**. Insert that image into PowerPoint. The QR encodes the student assessment URL directly, without a third-party QR service or expiration. Print the page if desired. A local preview clearly warns that a localhost code cannot be shared with students.

## Verification

The production build and exhaustive scoring checks are required by GitHub Actions. Database verification uses rollback transactions so synthetic responses do not remain in class totals. Verify anonymous INSERT, denial of raw reads/updates/deletes and anonymous aggregate access, validation of answers/program area, instructor-only aggregate calculations, and denial to accounts outside the allowlist.
