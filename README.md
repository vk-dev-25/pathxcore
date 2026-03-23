# pathxcore

Next.js app for [pathxdx.com](https://pathxdx.com): public marketing pages, plus authenticated **PathX** modules under `/pathx`.

## Stack

- Next.js 15 (App Router), React 18, TypeScript
- Tailwind CSS v4, Radix UI, class-variance-authority, tailwind-merge, tailwindcss-animate
- Supabase: `@supabase/supabase-js` + `@supabase/ssr` (middleware, server components, browser client).  
  `@supabase/auth-helpers-nextjs` is installed for alignment with older docs but **new code uses `@supabase/ssr` only** (auth-helpers is deprecated on npm).

## Setup

```bash
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

In the Supabase dashboard: **Authentication → URL configuration** — set **Site URL** to your app origin (e.g. `http://localhost:3000`) and add the same to **Redirect URLs**, including `http://localhost:3000/auth/callback`. Enable the **Email** provider and (for magic links) configure templates as needed.

## Routes

| Path | Notes |
|------|--------|
| `/` | Home (content aligned with pathxdx.com) |
| `/clinical-services` | Clinical specialties |
| `/preclinical-services` | Preclinical workflow |
| `/contact` | Contact & portal CTA |
| `/pathx/sign-in` | Magic link sign-in (public) |
| `/pathx` | Module hub (auth required) |
| `/pathx/lims` | LIMS scaffold (auth required) |
| `/pathx/quotebuilder` | Quote builder scaffold (auth required) |

Middleware refreshes the Supabase session and redirects unauthenticated users away from `/pathx/*` (except sign-in).
