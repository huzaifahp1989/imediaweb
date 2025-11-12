## What I’ll Do
1) Add environment variables for Quran Foundation credentials used by the frontend.
2) Ensure build/deploy environments provide these variables so word‑by‑word requests authenticate reliably.
3) Verify the app uses the variables correctly and the Quran word‑by‑word view loads without auth errors.

## Where The App Reads Them
- src/api/quranFoundation.js:10–12 reads `import.meta.env.VITE_QURAN_API_TOKEN`, `VITE_QURAN_API_CLIENT_ID`, optional `VITE_QURAN_API_BASE`.
- src/pages/QuranDictionary.jsx:125, 267 shows guidance when they’re missing and calls the helper at 103.

## Local Development Steps
1) Create or update `.env.local` (preferred) or `.env` at the repo root with:
   - `VITE_QURAN_API_TOKEN=<your_token>`
   - `VITE_QURAN_API_CLIENT_ID=<your_client_id>`
   - Optional: `VITE_QURAN_API_BASE=https://apis-prelive.quran.foundation/content/api/v4`
2) Restart the dev server so Vite picks up new variables.
3) Open the Quran word‑by‑word page and load a verse to confirm data appears.

## Netlify Deployment Steps
1) Set environment variables in Netlify (Site settings → Environment variables):
   - `VITE_QURAN_API_TOKEN`
   - `VITE_QURAN_API_CLIENT_ID`
   - Optional: `VITE_QURAN_API_BASE`
2) Trigger a new deploy so Vite embeds the values in the bundle.
3) Verify the Quran dictionary/word‑by‑word page in the deployed site.

## Verification
- Confirm requests are sent to `https://apis-prelive.quran.foundation/content/api/v4/...` with 200 responses and words data present.
- Confirm the UI no longer shows the missing‑credentials message in `QuranDictionary`.

## Security Note (Optional Hardening)
Currently these `VITE_*` values are bundled client‑side. If you want to keep credentials server‑only, I can instead:
- Add a Netlify function proxy (e.g., `qf-words`) that injects `process.env.QURAN_API_TOKEN` and `QURAN_API_CLIENT_ID` and forwards requests to Quran Foundation.
- Update the frontend to call the proxy. This avoids exposing secrets but requires a small code change.

If you approve, I’ll add the env entries locally, configure Netlify vars, and verify the Quran word‑by‑word feature works end‑to‑end.