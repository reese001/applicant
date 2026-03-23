# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma database GUI
```

## Architecture

This is a Next.js 14 App Router SaaS application ("Applicant") — a job application tracker with AI-powered career tools, Stripe billing, and multi-provider auth.

### Route Groups

- `src/app/(auth)/` — Public auth pages (login, register, forgot-password)
- `src/app/(dashboard)/` — Protected pages behind auth middleware. Has its own layout with sidebar, top nav, and mobile nav
- `src/app/api/` — REST API routes organized by domain (applications, ai, stripe, scrape, export, auth)
- `src/app/page.tsx` — Public landing/marketing page

### Key Libraries (`src/lib/`)

- **auth.ts** — NextAuth v5 config with Google, GitHub, and Credentials providers. JWT strategy with Prisma adapter. Custom callbacks inject `user.id` and `user.plan` into the session
- **prisma.ts** — PrismaClient singleton (global cache in dev to avoid hot-reload connection exhaustion)
- **stripe.ts** — Lazy-initialized Stripe client. `PLANS` constant defines FREE/PRO tier limits (scrape, reminder, template counts)
- **anthropic.ts** — Lazy-initialized Anthropic client. `generateAIResponse()` for one-shot, `streamAIResponse()` for streaming
- **scraper.ts** — Job URL scraper using Cheerio. Extracts via JSON-LD → Open Graph → DOM heuristics
- **validators.ts** — All Zod schemas for API input validation (applications, auth, AI features, contacts, reminders)
- **utils.ts** — `cn()` (clsx+tailwind-merge), date/salary formatters, string helpers

### Auth & Middleware

Middleware (`src/middleware.ts`) protects `/dashboard/*`, `/api/applications/*`, and `/api/ai/*` routes. Unauthenticated requests get 401. Auth state is accessed in API routes via `auth()` from `@/lib/auth`.

### Subscription/Feature Gating

Two-tier model: FREE and PRO. The `PremiumGate` component (`src/components/shared/premium-gate.tsx`) wraps Pro-only UI. API routes check `user.plan` for feature limits (scrape counts, AI access). Stripe webhooks manage subscription lifecycle.

### Component Organization

- `src/components/ui/` — shadcn/ui primitives (Radix-based). Don't modify these directly; add new ones via the shadcn pattern
- `src/components/layout/` — App shell: Sidebar, TopNav, MobileNav, UpgradeBanner
- `src/components/dashboard/` — Kanban board (uses @dnd-kit), application list, stats, add-application modal
- `src/components/shared/` — ThemeProvider, PremiumGate, loading skeletons, empty states

### Database (Prisma)

PostgreSQL via Supabase. Schema at `prisma/schema.prisma`. Core models: User, Application (with Tags, Contacts, Reminders, ActivityLog relations), Resume (JSON content field), Subscription. Enums: Plan (FREE/PRO), ApplicationStatus (7 stages), SubscriptionStatus.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Styling

Tailwind CSS with CSS variable-based theming in `globals.css`. Dark mode via `next-themes`. Colors use HSL values referenced as `--primary`, `--background`, etc.

## Environment Variables

Copy `.env.example` to `.env`. Required: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, OAuth credentials (Google/GitHub), STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, ANTHROPIC_API_KEY. See `.env.example` for the full list.
