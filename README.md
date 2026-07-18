# Islam Kids Zone

Vite + React app with Supabase auth and Vercel serverless API routes under `/api`.

## Running the app

```bash
npm install
npm run dev
```

To exercise `/api/*` locally (signup notify, points, admin helpers, etc.):

```bash
npx vercel dev
```

## Building the app

```bash
npm run build
```

## Deploy (Vercel)

1. Import the repo in Vercel (framework: Vite, output: `dist`).
2. Copy server env vars from `.env.example` (especially `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`).
3. Set `VITE_*` build env vars and redeploy after changes.
