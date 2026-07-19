package com.imediac.islammediacentral

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.imediac.islammediacentral.data.MediaPreferences
import com.imediac.islammediacentral.data.MediaSyncRepository

class IslamMediaApp : Application() {

    lateinit var mediaPreferences: MediaPreferences
        private set

    lateinit var mediaSyncRepository: MediaSyncRepository
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        mediaPreferences = MediaPreferences(this)
        mediaSyncRepository = MediaSyncRepository(this, mediaPreferences)
        // Seed bundled traet + audio-library catalogs, then refresh public streams online
        mediaSyncRepository.syncPublicCatalogsAsync()
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            getString(R.string.notification_channel_name),
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = getString(R.string.notification_channel_description)
            setShowBadge(false)
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    companion object {
        const val NOTIFICATION_CHANNEL_ID = "imc_playback"
        lateinit var instance: IslamMediaApp
            private set
    }
}
