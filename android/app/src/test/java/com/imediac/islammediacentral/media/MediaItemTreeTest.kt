package com.imediac.islammediacentral.media

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.imediac.islammediacentral.data.MediaIds
import com.imediac.islammediacentral.data.MediaPreferences
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Verifies the Android Auto media browser tree that MediaLibraryService exposes.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class MediaItemTreeTest {

    private lateinit var tree: MediaItemTree

    @Before
    fun setUp() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        tree = MediaItemTree(context, MediaPreferences(context))
    }

    @Test
    fun rootExposesRequiredAndroidAutoTabs() {
        val children = tree.rootChildren()
        val ids = children.map { it.mediaId }
        assertEquals(MediaItemTree.REQUIRED_ROOT_TAB_IDS, ids)
        children.forEach { child ->
            assertTrue("${child.mediaId} must be browsable", child.mediaMetadata.isBrowsable == true)
            assertFalse("${child.mediaId} must not be playable", child.mediaMetadata.isPlayable == true)
        }
    }

    @Test
    fun liveRadioHasPlayableStations() {
        val stations = tree.getChildren(MediaIds.LIVE_RADIO)
        assertTrue(stations.isNotEmpty())
        assertTrue(stations.all { it.mediaMetadata.isPlayable == true })
        assertTrue(stations.any { it.mediaId == MediaIds.radio("imc_live") })
    }

    @Test
    fun quranRecitersAreBrowsableThenSurahsPlayable() {
        val reciters = tree.getChildren(MediaIds.QURAN_RECITERS)
        assertEquals(4, reciters.size)
        assertTrue(reciters.all { it.mediaMetadata.isBrowsable == true })

        val surahs = tree.getChildren(MediaIds.reciter("alafasy"))
        assertTrue(surahs.size >= 9)
        assertTrue(surahs.all { it.mediaMetadata.isPlayable == true })
        assertTrue(surahs.first().localConfiguration?.uri.toString().contains("mp3quran.net"))
    }

    @Test
    fun podcastsExposeCategories() {
        val categories = tree.getChildren(MediaIds.PODCASTS)
        assertTrue(categories.size >= 5)
        assertTrue(categories.all { it.mediaMetadata.isBrowsable == true })
    }

    @Test
    fun favoritesAndRecentStartEmpty() {
        assertTrue(tree.getChildren(MediaIds.FAVORITES).isEmpty())
        assertTrue(tree.getChildren(MediaIds.RECENTLY_PLAYED).isEmpty())
    }
}
