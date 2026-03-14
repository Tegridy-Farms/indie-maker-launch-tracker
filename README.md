# Indie Maker Launch Tracker

A focused, single-user idea tracker built for indie makers. Capture, organise, and track your project ideas from raw concept through to launch — with inline status updates, full-text search, smart filtering, and CSV export.

**Live app:** https://indie-maker-launch-tracker.vercel.app

---

## Features

- **Capture ideas fast** — Create a new idea in under 30 seconds; press `N` anywhere to open the new-idea form instantly
- **Status pipeline** — Track each idea through four stages: Idea → In Progress → Launched → Shelved
- **Inline status updates** — Click a status badge to update it without leaving the list
- **Search, filter & sort** — Find ideas instantly by title, filter by status, and sort by newest, recently updated, or title
- **Tags & URLs** — Add up to 5 tags per idea; attach an optional project URL
- **Dashboard** — At-a-glance stats with per-status counts and your 5 most recently updated ideas
- **CSV export** — Download all your ideas as a structured CSV file anytime

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Database   | Neon Postgres (serverless)        |
| ORM        | Drizzle ORM                       |
| Styling    | Tailwind CSS                      |
| Validation | Zod                               |
| Testing    | Vitest + Testing Library          |
| Deployment | Vercel                            |

---

## Local Development

### Prerequisites

- Node.js 20+
- A Neon Postgres database (or any Postgres 16+ instance)

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/tegridy-farms/indie-maker-launch-tracker.git
   cd indie-maker-launch-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Copy the example env file and fill in your database URL:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local`:

   ```
   DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
   ```

   > **Note:** Never commit `.env.local` — it is listed in `.gitignore`.

4. **Run database migrations**

   ```bash
   npx drizzle-kit migrate
   ```

   This creates the `status_enum` Postgres type, the `ideas` table, and all three composite indexes.

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/dashboard`.

---

## Available Scripts

| Command              | Description                                        |
|----------------------|----------------------------------------------------|
| `npm run dev`        | Start the Next.js development server               |
| `npm run build`      | Build for production                               |
| `npm start`          | Start the production server                        |
| `npm run lint`       | Run ESLint                                         |
| `npm test`           | Run the full test suite (unit + integration)       |
| `npm run test:watch` | Run tests in watch mode                            |
| `npm run db:generate`| Generate Drizzle migration files from schema       |
| `npm run db:migrate` | Apply pending migrations to the database           |
| `npm run db:studio`  | Open Drizzle Studio (database GUI)                 |

---

## Running Tests

```bash
npm test
```

The test suite includes:

- **Unit tests** — Zod schema edge cases, date formatting, CSV builder utilities
- **Integration tests** — All 7 API route handlers (mocked DB), filter/sort correctness

All tests run in-process with mocked database calls; no live database connection is required.

---

## Environment Variables

| Variable       | Required | Description                                  |
|----------------|----------|----------------------------------------------|
| `DATABASE_URL` | Yes      | Neon Postgres (or any Postgres 16+) connection string |

This is the only required environment variable. On Vercel, it is injected automatically from the linked Neon integration. For local development, set it in `.env.local`.

---

## Vercel Deployment

The app is configured for zero-config Vercel deployment:

1. Push to the `main` branch — Vercel CI automatically builds and deploys
2. The `DATABASE_URL` environment variable must be set in your Vercel project settings (or linked via the Neon Vercel integration)
3. After deployment, run migrations once against the production database:
   ```bash
   DATABASE_URL=<production-url> npx drizzle-kit migrate
   ```

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard page (stats + recent activity)
│   ├── ideas/              # Ideas list page
│   └── api/ideas/          # REST API route handlers
├── src/
│   ├── components/         # React components
│   ├── db/                 # Drizzle schema, client, migrations
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, validators, constants
│   └── types/              # TypeScript types
└── tests/
    ├── unit/               # Unit tests (validators, utils)
    └── integration/        # Integration tests (API routes, filter/sort)
```

---

## Security Notes

- `DATABASE_URL` is the only secret; it is injected at runtime and never bundled
- All API inputs are validated with Zod before touching the database
- Drizzle ORM uses parameterised queries only — no raw SQL interpolation
- `user_id` is always set server-side to `'default'`; it is never accepted from client input
