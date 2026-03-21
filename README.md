# react-netlify-supabase-sso

A bootstrap template for auth-gated personal tools and SaaS MVPs — statically hosted on Netlify, Google SSO via Supabase, zero backend.

**Costs nothing to run.** Supabase free tier (500MB DB, 50K MAU) + Netlify free tier (100GB bandwidth, 300 build minutes/month) covers any personal tool or small app indefinitely.

---

## What's included

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 (dark theme, CSS variables) |
| Auth | Supabase Auth — Google OAuth, email allowlist enforcement |
| Database | Supabase (Postgres + Row Level Security) |
| Hosting | Netlify — static deploy from `git push` |

**Architecture:** static SPA on Netlify CDN → Supabase Auth (JWT) → Supabase DB (RLS-enforced queries). No backend server. No containers. No backend deployments.

---

## Repo layout

```
src/
├── context/
│   └── AuthContext.jsx     # Google OAuth flow, session management, email allowlist
├── hooks/
│   ├── useAuth.js          # useAuth() hook — session, signIn, signOut
│   └── useData.js          # stub — replace with your schema's CRUD hook
├── lib/
│   └── supabase.js         # Supabase client init from env vars
├── components/
│   ├── ErrorBoundary.jsx   # Top-level error boundary
│   ├── LoginScreen.jsx     # Auth gate UI — update app name
│   └── TabNav.jsx          # Generic tab navigation
├── pages/
│   ├── Home.jsx            # Public landing page
│   └── AppShell.jsx        # Auth-gated app shell — replace with your app
├── App.jsx                 # Routes: / (public) + /app/* (protected)
├── main.jsx
└── index.css               # CSS variables + base styles
```

---

## Setup — work through in order

### 1. Supabase project

- Create a new project at [supabase.com](https://supabase.com)
- Copy `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into `.env.local`
- Define your schema in the SQL editor
- Enable Row Level Security on all tables; add policy: `using (auth.uid() = user_id)`

### 2. Google OAuth

- Create an OAuth 2.0 client in [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- Set authorized redirect URI to: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
- Enter the client ID and secret in Supabase → Authentication → Providers → Google

### 3. Email allowlist

- Open `src/context/AuthContext.jsx`
- Update `ALLOWED_EMAILS` with the Google accounts that should have access
- **Do this first** — anyone not in this list is signed out immediately after OAuth completes

### 4. App name

- `src/components/LoginScreen.jsx` — update the `<h1>` from "Your App Name"
- `src/pages/Home.jsx` — update the heading
- `index.html` — update `<title>` and meta tags

### 5. CSP header

- `netlify.toml` → `connect-src` directive contains a placeholder Supabase project URL
- Replace `YOUR-PROJECT-REF.supabase.co` with your actual project ref

### 6. Data hook

- `src/hooks/useData.js` → rename to match your domain (e.g. `useNotes.js`)
- Replace the example schema with your own fields in `fromDB()` and `toDB()`
- The hook pattern (useCallback loadData, useEffect trigger, CRUD functions) stays the same

### 7. Netlify deploy

- Push to GitHub, connect at [netlify.com](https://netlify.com) → "New site from Git"
- Build command: `npm run build` | Publish directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
- Add the Netlify URL to Supabase → Authentication → URL Configuration → Redirect URLs

---

## Generic files — reuse as-is

| File | What it provides |
|---|---|
| `src/context/AuthContext.jsx` | Google OAuth flow, session management, allowlist enforcement |
| `src/hooks/useAuth.js` | `useAuth()` hook — access session, signIn, signOut from any component |
| `src/lib/supabase.js` | Supabase client init from env vars |
| `src/components/ErrorBoundary.jsx` | Top-level error boundary with reload prompt |
| `src/components/LoginScreen.jsx` | Auth gate UI — update app name only |
| `src/components/TabNav.jsx` | Generic tab navigation, driven by props |
| `netlify.toml` | Build config + security headers — update CSP `connect-src` only |
| `.env.example` | Documents the two required env vars |

## Domain-specific files — replace these

| File | Replace with |
|---|---|
| `src/hooks/useData.js` | Your schema's CRUD hook (`useNotes.js`, `useTasks.js`, etc.) |
| `src/pages/Home.jsx` | Your public landing page |
| `src/pages/AppShell.jsx` | Your application UI |

---

## Security checklist — before going live

- [ ] `ALLOWED_EMAILS` updated — remove any placeholder emails
- [ ] `.env.local` is gitignored (verify before first commit: `git status`)
- [ ] Supabase RLS enabled on all tables with `auth.uid() = user_id` policy
- [ ] `connect-src` in `netlify.toml` updated to your Supabase project URL
- [ ] Netlify URL added to Supabase Auth → URL Configuration → Redirect URLs
- [ ] `npm audit` clean before first deploy

---

## Key architecture decisions

**No API layer.** The Supabase JS client queries Postgres directly from the browser. RLS enforces that users can only access their own rows — the JWT from Auth is attached to every query automatically. Adding an Express server or Lambda between client and Supabase would add latency, a deployment surface, and code to maintain for no security benefit.

**Anon key in the client bundle is fine.** The Supabase anon key is a publishable key, not a secret. The service role key — which bypasses RLS entirely — must never be added to `.env.example`, `.env.local`, or any `VITE_`-prefixed variable. It should not exist anywhere near the frontend.

**`redirectTo: window.location.origin` — do not hardcode a URL.** Using `window.location.origin` means the OAuth redirect works correctly in local dev, Netlify production, and Netlify preview deploys without any configuration change. A hardcoded `localhost` or production URL will break in at least one of those environments.

**No flash of unauthenticated content.** `ProtectedRoute` returns `null` while `session === undefined` (the loading state before Supabase resolves the session on mount). This prevents a brief render of the login screen on page reload for authenticated users. Don't replace this with a naive `if (!session) redirect` — that fires before the session check completes.

**Session management via `onAuthStateChange`, not polling.** The auth state listener handles token refresh automatically. Don't call `getSession()` on a timer.

**RLS policy — start strict.** Use `auth.uid() = user_id` on all tables. Add permissive policies only with a specific, documented reason.

**Scope: client-to-Supabase only.** All data operations go directly from the browser to Supabase via the JS client. This covers the majority of personal tool and light SaaS use cases. If you need server-side logic — background jobs, third-party API calls that require secrets, webhooks — add Netlify Functions alongside this template; they deploy from the same repo with no additional infrastructure.

---

## Deployment loop

Once wired up:

```
git push origin main  →  Netlify auto-deploys  →  live in ~30s
```

Every push to the connected branch triggers a production deploy. Pull requests get their own preview URL automatically.

---

## Free tier limits (as of 2026)

| Service | Limit | Typical personal tool |
|---|---|---|
| Supabase DB | 500 MB | < 1 MB |
| Supabase Auth | 50,000 MAU | 1–10 users |
| Netlify Bandwidth | 100 GB/month | ~50 MB/month |
| Netlify Build Minutes | 300 min/month | ~1 min/deploy |

---

## Related

This template is described in the [React + Netlify + Supabase + SSO playbook entry](https://ekahle2-portfolio.netlify.app/playbook?entry=react_netlify_supabase_sso) — including the architectural rationale and a scaffold prompt you can hand to an AI agent.
