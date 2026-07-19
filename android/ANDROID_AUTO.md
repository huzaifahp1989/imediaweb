# Android Auto — Islam Media Central

Native Android module (`android/`) adding **AndroidX Media3** playback and **Android Auto** browse support on top of the existing Islam Media Central experience. The Vite/React web app is unchanged.

## Android Auto media browser checklist

| Requirement | Status |
|-------------|--------|
| `MediaLibraryService` (`PlaybackService`) | Done |
| Manifest `android.media.browse.MediaBrowserService` intent | Done |
| `automotive_app_desc.xml` + Car App metadata | Done |
| Root tabs: Live Radio, Quran Reciters, Podcasts, Favorites, Recently Played | Done |
| `onGetLibraryRoot` / `onGetChildren` / `onSubscribe` | Done |
| Content style extras for Auto tabs | Done |
| ExoPlayer playback (no WebView) | Done |
| MediaStyle notifications + media buttons | Done |
| Assistant play-from-search | Done |


## Project layout

```
android/
  app/src/main/
    AndroidManifest.xml
    java/com/imediac/islammediacentral/
      IslamMediaApp.kt
      media/PlaybackService.kt      # MediaLibraryService
      media/MediaItemTree.kt        # Auto browse tree
      data/MediaCatalog.kt          # Stations, reciters, podcasts
      data/MediaPreferences.kt      # Favorites, recent, resume
      data/MediaSyncRepository.kt   # Optional backend sync
      ui/MainActivity.kt            # Phone MediaController UI
      voice/VoiceQueryHelper.kt
      voice/AssistantPlayback.kt
    res/xml/automotive_app_desc.xml
  ANDROID_AUTO.md                   # this file
```

## Build

Requirements: JDK 17+, Android SDK 35, Android Studio Ladybug+ (or CLI).

```bash
cd android
# Create local.properties with sdk.dir=/path/to/Android/Sdk
./gradlew :app:assembleDebug
```

Install on a device/emulator:

```bash
./gradlew :app:installDebug
adb shell am start -n com.imediac.islammediacentral.debug/.ui.MainActivity
```

## Test with Android Auto Desktop Head Unit (DHU)

1. **Enable developer mode on the phone**
   - Settings → About → tap Build number 7 times.
   - Settings → Developer options → enable **USB debugging** and **Unknown sources** (if needed).

2. **Install Android Auto on the phone** (Play Store) and complete first-run setup.

3. **Install Desktop Head Unit**
   - Android Studio → SDK Manager → SDK Tools → **Android Auto Desktop Head Unit Emulator**.
   - Or SDK path: `$ANDROID_HOME/extras/google/auto/desktop-head-unit`.

4. **Forward the Auto tunnel** (USB connected):

   ```bash
   adb forward tcp:5277 tcp:5277
   ```

5. **Start DHU**:

   ```bash
   $ANDROID_HOME/extras/google/auto/desktop-head-unit/desktop-head-unit
   ```

6. **On the phone**, open Android Auto (or tap the Auto notification) and select **Islam Media Central** under media apps.

7. **Verify browse tree**
   - Live Radio → pick a station → streams immediately; Play / Pause / Stop work.
   - Quran Reciters → Alafasy (etc.) → Surah → background playback continues with screen off.
   - Podcasts → category → episode resumes near last position after pause.
   - Favorites / Recently Played populate after you play or favorite content.

8. **Voice / Assistant** (on device or DHU mic if available):
   - “Play Islam Media Central”
   - “Play Radio”
   - “Play Quran”

9. **Reconnect test**
   - Stop DHU while playing, restart DHU — playback session should restore via `onPlaybackResumption`.

### DHU tips

- Use a **debug** build (`applicationIdSuffix .debug`) so you can side-load without Play Console Auto review.
- For release / production Auto listing you must submit the media app for [Android Auto review](https://developer.android.com/training/cars/media/auto-app-quality).
- If the app does not appear in Auto: reboot phone, clear Android Auto app data, confirm `automotive_app_desc.xml` is packaged (`aapt dump xmltree app-debug.apk AndroidManifest.xml`).

## Content sources (aligned with web app)

- **Live radio default**: `https://a4.asurahosting.com:7820/radio.mp3` (same as `Layout.jsx` / AdminSettings).
- **Reciters**: Alafasy, Sudais, Abdul Basit, Husary (`FullQuran.jsx` mp3quran.net bases).
- **Podcasts**: categories match `AudioNew.jsx` (`story`, `hadith`, `history`, `nasheed`, `tajweed`, `fiqh`, `quran`) with seed episodes; replace via `MediaSyncRepository.applyRemotePodcasts(...)`.

## Syncing favorites / podcasts from the existing app

After Supabase/Base44 login in a fuller Android UI:

```kotlin
val sync = MediaSyncRepository(IslamMediaApp.instance.mediaPreferences)
sync.applyRemoteFavorites(listOf("radio:imc_live", "surah:alafasy:1"))
sync.applyRemotePodcasts(rows.mapNotNull { sync.mapAudioContentRow(it) })
```

Android Auto reads the same `MediaPreferences` cache — no separate Auto database.

## Safety for the current product

- Web app under `/src` is untouched.
- Android code lives only under `/android`.
- Login, Supabase, and web streaming continue to work independently.
