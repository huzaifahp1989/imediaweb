package com.imediac.islammediacentral.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class MediaCatalogTest {

    @Test
    fun radioStationsIncludeIslamMediaCentralLive() {
        val live = MediaCatalog.radioStations.find { it.id == "imc_live" }
        assertNotNull(live)
        assertTrue(live!!.streamUrl.contains("radio"))
    }

    @Test
    fun recitersMatchWebApp() {
        val ids = MediaCatalog.reciters.map { it.id }.toSet()
        assertTrue(ids.containsAll(listOf("alafasy", "sudais", "basit", "husary")))
    }

    @Test
    fun surahUrlIsZeroPadded() {
        val reciter = MediaCatalog.reciters.first { it.id == "alafasy" }
        assertEquals(
            "https://server8.mp3quran.net/afs/001.mp3",
            MediaCatalog.surahUrl(reciter, 1)
        )
        assertEquals(
            "https://server8.mp3quran.net/afs/114.mp3",
            MediaCatalog.surahUrl(reciter, 114)
        )
    }

    @Test
    fun resolvePlayableRadio() {
        val item = MediaCatalog.resolvePlayable(MediaIds.radio("imc_live"))
        assertNotNull(item)
        assertTrue(item!!.isLive)
        assertEquals(MediaCategory.RADIO, item.category)
    }

    @Test
    fun resolvePlayableSurah() {
        val item = MediaCatalog.resolvePlayable(MediaIds.surah("alafasy", 36))
        assertNotNull(item)
        assertEquals(MediaCategory.QURAN, item!!.category)
        assertTrue(item.streamUrl.endsWith("036.mp3"))
    }

    @Test
    fun podcastCategoriesCoverAudioLibrary() {
        val ids = MediaCatalog.podcastCategories.map { it.id }
        assertTrue(ids.containsAll(listOf("story", "hadith", "quran", "nasheed")))
    }

    @Test
    fun resolvePlayableLecture() {
        val item = MediaCatalog.resolvePlayable(MediaIds.lecture("lecture_tawheed"))
        assertNotNull(item)
        assertEquals(MediaCategory.LECTURE, item!!.category)
        assertFalse(item.isLive)
    }

    @Test
    fun continueListeningIdIsPlayableShortcut() {
        assertTrue(MediaIds.isPlayable(MediaIds.CONTINUE_LISTENING))
        assertTrue(MediaIds.supportsResumePosition(MediaIds.surah("alafasy", 1)))
        assertTrue(MediaIds.supportsResumePosition(MediaIds.podcastEpisode("x")))
        assertTrue(MediaIds.supportsResumePosition(MediaIds.lecture("y")))
        assertFalse(MediaIds.supportsResumePosition(MediaIds.radio("imc_live")))
    }
}
