# Islamic Audio Library (create-me-a-audio)

Recovered, editable source for **https://create-me-a-audio.vercel.app**.

The live Vercel project was **not linked to GitHub**. This folder reconstructs the app against the same Firebase project (`audio-68d1f`) and route/feature surface so you can edit it in Cursor and redeploy.

## Run locally

```bash
cd create-me-a-audio
cp .env.example .env   # already filled with live project keys if present
npm install
npm run dev
```

## Connect to GitHub + Vercel

1. Create/use repo `huzaifahp1989/audio` (empty repo already exists).
2. Copy the contents of this `create-me-a-audio/` folder into that repo root (or set Vercel Root Directory to `create-me-a-audio` if keeping it inside `imediaweb`).
3. In Vercel → Project **create-me-a-audio** → Settings → Git → connect the GitHub repo.
4. Add the `VITE_*` env vars from `.env.example`.
5. Redeploy.

## What’s included

- Home hero (“Listen to the Voice of Islam”), category browse, search
- Category pages: Quran, Nasheeds, Talks, Audiobooks, Hadith, Dua, Kids
- Favorites + playlist manager (localStorage)
- Global audio player with continue-listening progress
- Admin upload, Submit Audio, Kids Record
- Stats / analytics page
- API stubs: `/api/podcast-rss`, `/api/analytics/stats`, `/api/upload`

## Backend

Tracks load from Firestore collections recovered from the live bundle:

- `tracks`, `kidsSubmissions`, `userSubmissions`, `views`, `votes`, `adAudio`, `nasheedRequests`

Firebase web config matches the production deployment (`audio-68d1f`).

## Note on fidelity

This is a **clean reconstruction** of the production app (logic + branding + data layer), not a byte-for-byte dump of the original Trae/Vercel build. Core library playback and management work against the live Firebase project; some advanced admin/import tooling from the minified bundle can be ported further as needed.
