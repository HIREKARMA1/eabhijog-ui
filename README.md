# e-Abhijog UI

Next.js frontend for the Odisha Grievance portal. Connects to the FastAPI backend in the sibling `eabhijog-server` repo.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Component-based** UI with JSON i18n (`en`, `hi`, `or`)

## Folder structure

```
src/
├── app/                 # Routes (pages)
├── components/
│   ├── ui/              # Reusable primitives (Button, Input, Table, …)
│   ├── layout/          # App shell, sidebar
│   ├── landing/         # Public landing sections
│   ├── auth/            # Login
│   ├── dashboard/       # Dashboard widgets
│   └── i18n/            # Language switcher
├── config/              # Theme tokens, env helpers
├── content/             # All UI copy (JSON per locale)
│   ├── en/
│   ├── hi/
│   └── or/
├── lib/
│   ├── api/             # API client (browser + server)
│   └── i18n/            # Translation loader
└── types/               # Shared TypeScript types
```

## Setup

```bash
cd eabhijog-ui
cp .env.example .env.local
npm install
npm run dev
```

| Variable | Purpose |
|----------|---------|
| `API_BASE_URL` | FastAPI server (default `http://localhost:8000`) |
| `NEXT_PUBLIC_API_PREFIX` | Browser proxy prefix (default `/backend`) |
| `NEXT_PUBLIC_APP_URL` | This UI's public URL |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en`, `hi`, or `or` |

## Backend requirements

1. FastAPI server running with migrations applied.
2. Set `CORS_ORIGINS=http://localhost:3000` in the **server** `.env` (for direct API calls from server components).
3. New JSON endpoints used by this UI:
   - `POST /api/auth/login`
   - `POST /api/auth/logout`
   - `GET /api/auth/me`
   - `GET /api/public/portal`
   - `GET /api/portal/dashboard`

Browser requests use `/backend/*` rewrites so session cookies stay on the UI origin.

## Theming

Edit `src/config/theme.ts` and CSS variables in `src/app/globals.css`.  
All visible text lives in `src/content/{locale}/*.json` — not hardcoded in components.

## Deploy separately

| Service | Repo / folder | Example |
|---------|---------------|---------|
| API | `eabhijog-server` | `api.abhijog.odisha.gov.in` |
| UI | `eabhijog-ui` | `abhijog.odisha.gov.in` |

Set `API_BASE_URL` to the production API URL and `CORS_ORIGINS` on the server to the UI origin.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Public landing |
| `/login` | Officer sign-in |
| `/forgot-password` | Password reset request |
| `/reset-password?token=` | Set new password |
| `/request-access` | Portal access request |
| `/request-demo` | Demo request |
| `/dashboard` | Admin overview |
| `/dashboard/grievances` | Grievance list + filters |
| `/dashboard/grievance/[ref]` | Grievance detail + respond |
| `/dashboard/analytics` | Reports |
| `/dashboard/staff` | Staff CRUD |
| `/osd/[slug]/dashboard` | OSD KPI overview |
| `/osd/[slug]/grievances` | OSD grievance list |
| `/osd/[slug]/grievance/[ref]` | OSD detail, forward, status |
| `/profile` | Staff profile |
| `/logout` | Sign out |

## API endpoints used

```bash
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint
```
