package com.imediac.islammediacentral.data

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class MediaPreferencesTest {

    private lateinit var preferences: MediaPreferences

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        context.getSharedPreferences("imc_media_prefs", Context.MODE_PRIVATE).edit().clear().commit()
        preferences = MediaPreferences(context)
    }

    @Test
    fun recordPlayedPersistsAcrossRestart() {
        val item = PlayableMedia(
            mediaId = MediaIds.lecture("lecture_tawheed"),
            title = "Introduction to Tawheed",
            subtitle = "Lecture",
            streamUrl = "https://example.com/a.mp3",
            category = MediaCategory.LECTURE
        )
        preferences.recordPlayed(item)
        preferences.savePlaybackPosition(item.mediaId, 30_000L)

        // New instance simulates app restart
        val context = ApplicationProvider.getApplicationContext<Context>()
        val reloaded = MediaPreferences(context)
        assertEquals(item.mediaId, reloaded.getLastPlayed()?.mediaId)
        assertEquals(30_000L, reloaded.getPlaybackPosition(item.mediaId))
    }

    @Test
    fun liveRadioPositionIsNotSaved() {
        preferences.savePlaybackPosition(MediaIds.radio("imc_live"), 60_000L)
        assertEquals(0L, preferences.getPlaybackPosition(MediaIds.radio("imc_live")))
    }

    @Test
    fun pendingAutoResumeFlag() {
        assertFalse(preferences.isPendingAutoResume())
        preferences.setPendingAutoResume(true)
        assertTrue(preferences.isPendingAutoResume())
        assertTrue(preferences.consumePendingAutoResume())
        assertFalse(preferences.isPendingAutoResume())
        assertFalse(preferences.consumePendingAutoResume())
    }

    @Test
    fun lastPlayedUpdatesToMostRecent() {
        preferences.recordPlayed(
            PlayableMedia(
                mediaId = MediaIds.radio("imc_live"),
                title = "Live",
                subtitle = "",
                streamUrl = "https://example.com/radio",
                isLive = true,
                category = MediaCategory.RADIO
            )
        )
        preferences.recordPlayed(
            PlayableMedia(
                mediaId = MediaIds.podcastEpisode("quran_fatiha"),
                title = "Fatiha",
                subtitle = "",
                streamUrl = "https://example.com/p.mp3",
                category = MediaCategory.PODCAST
            )
        )
        assertEquals(
            MediaIds.podcastEpisode("quran_fatiha"),
            preferences.getLastPlayed()?.mediaId
        )
        assertEquals(2, preferences.getRecentlyPlayed().size)
    }

    @Test
    fun getLastPlayedNullWhenEmpty() {
        assertNull(preferences.getLastPlayed())
    }

    @Test
    fun seedLecturesAvailable() {
        val lectures = preferences.getLectures()
        assertTrue(lectures.isNotEmpty())
        assertNotNull(lectures.find { it.id == "lecture_tawheed" })
    }
}
