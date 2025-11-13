## Problem Analysis
- Error `net::ERR_ABORTED https://server11.mp3quran.net/sds/067.mp3` indicates the browser canceled the network request (typical when a media request is superseded by another, navigation occurs, or the element is detached). It’s not always a server error but results in no sound.
- Current implementation creates a new `Audio(url)` per play. Rapid switches or sequence transitions can abort requests before playback stabilizes.
- Verse-level audio may be missing for some reciter editions; code falls back to full-surah MP3, which can still abort if triggered back-to-back.
- Juz/Surah click-to-play needs robust sequencing: start from clicked ayah and continue cleanly.

## Implementation Plan
1. Replace per-play `new Audio(url)` with a single reusable `<audio>` element (singleton) via `useRef` and attach listeners (`oncanplay`, `onended`, `onerror`, `onstalled`).
2. Preflight check for audio availability:
   - Perform `HEAD` request for full-surah MP3 before setting `src`. If non-200, skip to verse-level or alternate reciter.
   - For verse-level audio, if missing for selected reciter edition, attempt fallback to a known reliable edition (e.g., `ar.alafasy`).
3. Stabilize sequence playback:
   - Surah mode: `startSurahSequenceAt(index)` sets `src` to selected ayah audio and auto-advances to next ayah on `ended` (respecting `repeat`).
   - Juz mode: `startJuzSequenceAt(index)` mirrors the above across combined ayahs, with `Resume`/`Stop` controls working.
   - Ensure we do not start a new load until the previous `audio.src` is cleared and `pause()` completes.
4. Error handling & user feedback:
   - Show toast when an ayah/audio source fails, and automatically switch to fallback.
   - Log concise debug info (reciter, surah/ayah, status) for QA.
5. Minor UX tweaks:
   - Keep “Play Ayah” click behavior to start sequence from that ayah.
   - Maintain `repeat` by toggling `audio.loop` on the singleton element.

## File Changes
- `src/pages/FullQuran.jsx`
  - Introduce `audioRef` and replace `currentAudio` state with this singleton element.
  - Implement `ensureAudio(url)` with optional `HEAD` preflight and listener wiring.
  - Refactor `handlePlayAudio`, `onPlayVerse`, `startSurahSequenceAt`, `startJuzSequenceAt`, `pauseAudio`, `stopJuzSequence`, `resumeJuzSequence` to use the singleton.
  - Add fallback edition logic when verse-level audio is missing.
  - Keep existing repeat and highlight logic intact.

## Testing
- Surah 67 (Al-Mulk) with `Sudais`:
  - Click any ayah: plays that ayah; continues to next ayahs.
  - If full surah MP3 request aborts, verify verse-level fallback kicks in.
- Switch to `Alafasy` and repeat tests to confirm reliability.
- Juz playback:
  - Select a Juz, click an ayah; playback starts from that ayah and continues.
  - Use `Stop` and `Resume` controls to confirm state consistency.
- Confirm no `ERR_ABORTED` floods; occasional aborts during intentional switches are acceptable but audio should continue.

## Safety & Rollback
- Changes are localized to `FullQuran.jsx` and do not affect other pages.
- Easy rollback by restoring previous `handlePlayAudio` usage.

## Acceptance Criteria
- Clicking any ayah plays that ayah’s audio immediately and continues to subsequent ayahs (Surah and Juz modes).
- If a reciter’s audio is unavailable, fallback occurs automatically without breaking playback.
- Audio starts reliably with minimal `ERR_ABORTED` occurrences; user hears sound consistently.
- Stop/Resume controls work as expected for Juz sequences.