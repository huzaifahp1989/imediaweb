#!/usr/bin/env bash
# Build a signed debug APK and verify Android Auto media-app packaging.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${ANDROID_HOME:-}" && -z "${ANDROID_SDK_ROOT:-}" ]]; then
  echo "Set ANDROID_HOME (or ANDROID_SDK_ROOT) before running." >&2
  exit 1
fi
SDK="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"

if [[ ! -f local.properties ]]; then
  echo "sdk.dir=$SDK" > local.properties
fi

./gradlew :app:assembleDebug --quiet

APK="$ROOT/app/build/outputs/apk/debug/app-debug.apk"
AAPT="$(ls -1 "$SDK"/build-tools/*/aapt 2>/dev/null | sort -V | tail -1)"
APKSIGNER="$(ls -1 "$SDK"/build-tools/*/apksigner 2>/dev/null | sort -V | tail -1)"

if [[ -z "$AAPT" || ! -x "$AAPT" ]]; then
  echo "aapt not found under $SDK/build-tools" >&2
  exit 1
fi

echo "APK: $APK ($(du -h "$APK" | cut -f1))"
echo
echo "=== badging ==="
"$AAPT" dump badging "$APK" | head -8
echo
echo "=== Auto / media service intents ==="
"$AAPT" dump xmltree "$APK" AndroidManifest.xml | grep -E 'MediaBrowserService|MediaLibraryService|MediaSessionService|car.application|PlaybackService|automotive' || true
echo
echo "=== automotive_app_desc ==="
"$AAPT" dump xmltree "$APK" res/xml/automotive_app_desc.xml
echo
if [[ -n "${APKSIGNER:-}" && -x "$APKSIGNER" ]]; then
  echo "=== signature ==="
  "$APKSIGNER" verify --print-certs "$APK" | head -5
fi

fail=0
manifest="$("$AAPT" dump xmltree "$APK" AndroidManifest.xml)"
auto="$("$AAPT" dump xmltree "$APK" res/xml/automotive_app_desc.xml)"
badging="$("$AAPT" dump badging "$APK")"

check() {
  local name="$1" ok="$2"
  if [[ "$ok" == "1" ]]; then
    echo "PASS  $name"
  else
    echo "FAIL  $name"
    fail=1
  fi
}

[[ "$badging" == *"com.wnapp.id1761553570260"* ]] && c1=1 || c1=0
[[ "$badging" == *"Islam Media Central"* ]] && c2=1 || c2=0
[[ "$manifest" == *"android.media.browse.MediaBrowserService"* ]] && c3=1 || c3=0
[[ "$manifest" == *"androidx.media3.session.MediaLibraryService"* ]] && c4=1 || c4=0
[[ "$manifest" == *"com.google.android.gms.car.application"* ]] && c5=1 || c5=0
[[ "$auto" == *'name="media"'* || "$auto" == *"media"* ]] && c6=1 || c6=0
[[ "$manifest" != *"android.hardware.type.automotive"* ]] && c7=1 || c7=0

echo
echo "=== checklist ==="
check "applicationId com.wnapp.id1761553570260" "$c1"
check "label Islam Media Central" "$c2"
check "MediaBrowserService" "$c3"
check "MediaLibraryService" "$c4"
check "car.application meta-data" "$c5"
check "automotiveApp media" "$c6"
check "no automotive hardware feature" "$c7"

if [[ "$fail" -ne 0 ]]; then
  echo "Verification failed." >&2
  exit 1
fi

echo
echo "Signed debug APK is ready for DHU / vehicle install."
echo "Next: install on phone, open the app once, connect Android Auto / DHU,"
echo "and confirm Islam Media Central appears under media apps."
