package com.imediac.islammediacentral.media

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Process
import android.util.Log

/**
 * Identifies Android Auto / Assistant / system callers.
 *
 * Important: returning a denied library root prevents the app from appearing in
 * Android Auto's media list. Unknown packages are therefore allowed (with a log),
 * because AAOS OEM media hosts and DHU package names vary widely.
 */
class PackageValidator(private val context: Context) {

    fun isAllowed(packageName: String, uid: Int): Boolean {
        if (uid == Process.SYSTEM_UID) return true
        if (packageName == context.packageName) return true
        if (ALLOWED_PACKAGES.contains(packageName)) return true
        if (packageName.startsWith("com.google.android.projection.gearhead")) return true
        if (packageName.startsWith("com.google.android.autosimulator")) return true
        if (packageName.contains("android.auto") || packageName.contains("gearhead")) return true
        if (isSystemApp(packageName)) return true

        // Do not block unknown hosts — rejecting them hides the app from Auto.
        Log.i(TAG, "Allowing media browser connection from unrecognized package: $packageName")
        return true
    }

    private fun isSystemApp(packageName: String): Boolean =
        try {
            val info = context.packageManager.getApplicationInfo(packageName, 0)
            (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }

    companion object {
        private const val TAG = "ImcPackageValidator"

        val ALLOWED_PACKAGES = setOf(
            "com.google.android.projection.gearhead",
            "com.google.android.googlequicksearchbox",
            "com.google.android.as",
            "com.google.android.apps.googleassistant",
            "com.google.android.carassistant",
            "com.android.car.media",
            "com.android.car.media.localmediaplayer",
            "com.google.android.car.media",
            "com.google.android.automotive.embedded.projection",
            "com.android.bluetooth",
            "com.android.systemui",
            "com.google.android.gms"
        )
    }
}
