# Android Auto — Islam Media Central

Native Android module (`android/`) adding **AndroidX Media3** playback and **Android Auto** browse support on top of the existing Islam Media Central experience. The Vite/React web app is unchanged.

## Android Auto media browser checklist

| Requirement | Status |
|-------------|--------|
| `MediaLibraryService` (`PlaybackService`) | Done |
| Manifest `android.media.browse.MediaBrowserService` intent | Done |
| `automotive_app_desc.xml` + Car App metadata | Done |
| Root tabs: **Continue Listening** (first), Live Radio, Quran Reciters, Podcasts, Lectures, Favorites, Recently Played | Done |
| Continue Listening resumes radio / Quran / podcast / lecture | Done |
| Resume position for podcasts, Quran tracks, lectures | Done |
| Live radio reconnects to last station | Done |
| Last played auto-saved + survives app restart | Done |
| Phone home **Resume Last Played** button | Done |
| Auto-resume when Android Auto reconnects after disconnect | Done |
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

## Build signed debug APK

Requirements: JDK 17+, Android SDK 35, Android Studio Ladybug+ (or CLI).

```bash
cd android
# Create local.properties with sdk.dir=/path/to/Android/Sdk
./gradlew :app:assembleDebug
```

Output (debug-keystore signed):

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Package id: `com.imediac.islammediacentral.debug` · label: **Islam Media Central**

Install on a device/emulator:

```bash
./gradlew :app:installDebug
# or: adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.imediac.islammediacentral.debug/.ui.MainActivity
```

### Static APK checks (no DHU required)

```bash
aapt dump badging app/build/outputs/apk/debug/app-debug.apk | head
aapt dump xmltree app/build/outputs/apk/debug/app-debug.apk AndroidManifest.xml | grep -E 'MediaBrowserService|car.application|PlaybackService'
aapt dump xmltree app/build/outputs/apk/debug/app-debug.apk res/xml/automotive_app_desc.xml
apksigner verify --print-certs app/build/outputs/apk/debug/app-debug.apk
```

Expected: `MediaBrowserService` + `MediaLibraryService` intents, `com.google.android.gms.car.application` → `@xml/automotive_app_desc` with `<uses name="media" />`, signed with Android Debug.

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
   - **Continue Listening** is the first root item — tap it to resume last content.
   - Live Radio → pick a station → streams immediately; Play / Pause / Stop work.
   - Quran Reciters → Alafasy (etc.) → Surah → background playback continues with screen off.
   - Podcasts → category → episode resumes near last position after pause.
   - Lectures → talk → resume position restored after pause / app restart.
   - Favorites / Recently Played populate after you play or favorite content.

8. **Phone app**
   - Open MainActivity → **Resume Last Played** resumes the same item Android Auto would continue.
   - Last played is shown under the button (type + title + position).

9. **Voice / Assistant** (on device or DHU mic if available):
   - “Play Islam Media Central”
   - “Play Radio”
   - “Play Quran”
   - “Continue listening”

10. **Reconnect test**
   - Stop DHU while playing, restart DHU — playback auto-resumes via `onDisconnected` pending flag + `onPlaybackResumption` / `onConnect`.

## App not showing in the car? (sideloaded APK)

Android Auto **hides apps that are not from Play Store** until you enable developer Unknown sources:

1. On the phone open **Android Auto settings**  
   (Settings → search “Android Auto” → Additional settings in the app)
2. Scroll to **Version** → tap it **10 times** → OK
3. Top-right **⋮** menu → **Developer settings**
4. Turn **ON** “Unknown sources”
5. Back in Auto settings → **Customize launcher** → enable **Islam Media Central**
6. Open Islam Media Central on the phone once and tap **Play Live Radio**
7. Disconnect the car / wireless Auto, then reconnect

Without step 4, a GitHub/sideload APK will never appear in the car media list.

### DHU tips

- Prefer the **release** sideload APK (`com.imediac.islammediacentral`, no `.debug` suffix) for car testing.
- Debug builds (`applicationIdSuffix .debug`) also work after Unknown sources is on.
- For production Play listing you must submit for [Android Auto review](https://developer.android.com/training/cars/media/auto-app-quality).
- If still missing: force-stop Android Auto, clear its cache, reboot phone, reconnect.

## Content sources (aligned with web app)

- **Live radio default**: `https://a4.asurahosting.com:7820/radio.mp3` (same as `Layout.jsx` / AdminSettings).
- **Reciters**: Alafasy, Sudais, Abdul Basit, Husary (`FullQuran.jsx` mp3quran.net bases).
- **Podcasts**: categories match `AudioNew.jsx` (`story`, `hadith`, `history`, `nasheed`, `tajweed`, `fiqh`, `quran`) with seed episodes; replace via `MediaSyncRepository.applyRemotePodcasts(...)`.
- **Lectures**: seed talks under `lecture:` media IDs with resume positions; replace via `MediaSyncRepository.applyRemoteLectures(...)`.

## Continue Listening behavior

| Content | On resume |
|---------|-----------|
| Live Radio | Reconnects to the **last station** (no seek) |
| Quran Reciter (surah) | Restores saved playback position |
| Podcast episode | Restores saved playback position |
| Lecture | Restores saved playback position |

Last played + positions are stored in SharedPreferences (`imc_media_prefs`) and survive process death / app restarts. Positions are saved on pause, every ~15s while playing, and on service destroy.

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
