package com.imediac.islammediacentral.media

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.test.core.app.ApplicationProvider
import com.imediac.islammediacentral.data.MediaCategory
import com.imediac.islammediacentral.data.MediaIds
import com.imediac.islammediacentral.data.MediaPreferences
import com.imediac.islammediacentral.data.MediaSyncRepository
import com.imediac.islammediacentral.data.PlayableMedia
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
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

    private lateinit var context: Context
    private lateinit var preferences: MediaPreferences
    private lateinit var tree: MediaItemTree

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        // Clear prefs between tests, then seed bundled public catalogs (traet + audio library)
        context.getSharedPreferences("imc_media_prefs", Context.MODE_PRIVATE).edit().clear().commit()
        preferences = MediaPreferences(context)
        MediaSyncRepository(context, preferences).seedFromAssetsIfNeeded()
        tree = MediaItemTree(context, preferences)
    }

    @Test
    fun rootExposesContinueListeningFirstThenRequiredTabs() {
        val children = tree.rootChildren()
        val ids = children.map { it.mediaId }
        assertEquals(MediaItemTree.REQUIRED_ROOT_TAB_IDS, ids)
        assertEquals(MediaIds.CONTINUE_LISTENING, ids.first())
        // Without history, Continue Listening is a browsable placeholder
        val continueItem = children.first()
        assertTrue(continueItem.mediaMetadata.isBrowsable == true)
        assertFalse(continueItem.mediaMetadata.isPlayable == true)
        children.drop(1).forEach { child ->
            assertTrue("${child.mediaId} must be browsable", child.mediaMetadata.isBrowsable == true)
            assertFalse("${child.mediaId} must not be playable", child.mediaMetadata.isPlayable == true)
        }
    }

    @Test
    fun continueListeningBecomesPlayableAfterRecordingLastPlayed() {
        preferences.recordPlayed(
            PlayableMedia(
                mediaId = MediaIds.surah("alafasy", 1),
                title = "Al-Fatihah · Alafasy",
                subtitle = "The Opening",
                streamUrl = "https://server8.mp3quran.net/afs/001.mp3",
                category = MediaCategory.QURAN
            )
        )
        preferences.savePlaybackPosition(MediaIds.surah("alafasy", 1), 12_000L)

        val continueItem = tree.buildContinueListeningItem()
        assertEquals(MediaIds.CONTINUE_LISTENING, continueItem.mediaId)
        assertTrue(continueItem.mediaMetadata.isPlayable == true)
        assertFalse(continueItem.mediaMetadata.isBrowsable == true)
        assertEquals(
            12_000L,
            continueItem.mediaMetadata.extras?.getLong(MediaItemTree.EXTRA_RESUME_POSITION)
        )
        assertEquals(
            MediaIds.surah("alafasy", 1),
            continueItem.mediaMetadata.extras?.getString(MediaItemTree.EXTRA_RESOLVED_MEDIA_ID)
        )

        val resolved = tree.resolveContinueListening()
        assertNotNull(resolved)
        assertEquals(MediaIds.surah("alafasy", 1), resolved!!.mediaId)
    }

    @Test
    fun continueListeningResumesLastRadioStationWithoutPosition() {
        preferences.recordPlayed(
            PlayableMedia(
                mediaId = MediaIds.radio("mp3quran_alafasy"),
                title = "Quran Radio · Alafasy",
                subtitle = "Live",
                streamUrl = "https://backup.qurango.net/radio/mishary_alafasy",
                isLive = true,
                category = MediaCategory.RADIO
            )
        )
        val continueItem = tree.buildContinueListeningItem()
        assertTrue(continueItem.mediaMetadata.isPlayable == true)
        assertEquals(
            0L,
            continueItem.mediaMetadata.extras?.getLong(MediaItemTree.EXTRA_RESUME_POSITION, 0L)
        )
        assertTrue(
            continueItem.mediaMetadata.extras?.getBoolean(MediaItemTree.EXTRA_LIVE) == true
        )
    }

    @Test
    fun lecturesArePlayableWithResumeSupport() {
        val lectures = tree.getChildren(MediaIds.LECTURES)
        assertTrue(lectures.isNotEmpty())
        assertTrue(lectures.all { it.mediaMetadata.isPlayable == true })
        assertTrue(lectures.any { it.mediaId.startsWith("lecture:") })

        val firstId = lectures.first().mediaId
        preferences.savePlaybackPosition(firstId, 45_000L)
        val refreshed = tree.getItem(firstId)
        assertNotNull(refreshed)
        assertEquals(
            45_000L,
            refreshed!!.mediaMetadata.extras?.getLong(MediaItemTree.EXTRA_RESUME_POSITION)
        )
    }

    @Test
    fun liveRadioHasPlayableStations() {
        val stations = tree.getChildren(MediaIds.LIVE_RADIO)
        assertTrue(stations.isNotEmpty())
        assertTrue(stations.all { it.mediaMetadata.isPlayable == true })
        assertTrue(stations.any { it.mediaId == MediaIds.radio("imc_live") })
        assertTrue(stations.any { it.mediaId == MediaIds.radio("radio_seerah") })
    }

    @Test
    fun quranRadioTabIsPresent() {
        assertTrue(tree.rootChildren().any { it.mediaId == MediaIds.QURAN_RADIO })
        val streams = tree.getChildren(MediaIds.QURAN_RADIO)
        // Until assets are seeded in Robolectric, featured mp3quran fallback applies
        assertTrue(streams.isNotEmpty())
        assertTrue(streams.all { it.mediaMetadata.isPlayable == true })
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
        assertTrue(categories.isNotEmpty())
        assertTrue(categories.all { it.mediaMetadata.isBrowsable == true })
        // Audio Library from create-me-a-audio includes Nasheeds
        assertTrue(categories.any { it.mediaId.contains("nasheed") || it.mediaMetadata.title?.contains("Nasheed") == true || it.mediaId.contains("general") })
    }

    @Test
    fun favoritesAndRecentStartEmpty() {
        assertTrue(tree.getChildren(MediaIds.FAVORITES).isEmpty())
        assertTrue(tree.getChildren(MediaIds.RECENTLY_PLAYED).isEmpty())
    }

    @Test
    fun queueAroundPodcastSupportsNextPrevious() {
        val episodes = preferences.getPodcastEpisodes()
        assertTrue(episodes.isNotEmpty())
        val firstId = MediaIds.podcastEpisode(episodes.first().id)
        val (queue, index) = tree.buildQueueAround(firstId)
        assertTrue(queue.size >= 1)
        assertEquals(firstId, queue[index].mediaId)
        assertTrue(queue.all { it.mediaMetadata.isPlayable == true })
    }

    @Test
    fun expandSingleLiveRadioBuildsSkippableStationQueue() {
        val live = tree.getChildren(MediaIds.LIVE_RADIO)
        assertTrue(live.size > 1)
        val mid = live[live.size / 2]
        val (queue, index) = tree.expandRequestToPlaylist(listOf(mid))
        assertTrue("Expected multi-station queue for Next/Prev, got ${queue.size}", queue.size > 1)
        assertEquals(mid.mediaId, queue[index].mediaId)
        assertTrue(queue.all { it.localConfiguration?.uri != null })
    }

    @Test
    fun expandContinueListeningUsesUnderlyingCategoryQueue() {
        val stationId = MediaIds.radio("imc_live")
        val item = tree.getItem(stationId)
        assertNotNull(item)
        preferences.recordPlayed(
            PlayableMedia(
                mediaId = stationId,
                title = "IMC Live",
                subtitle = "Live",
                streamUrl = item!!.localConfiguration!!.uri.toString(),
                isLive = true,
                category = MediaCategory.RADIO
            )
        )
        val continueItem = MediaItem.Builder().setMediaId(MediaIds.CONTINUE_LISTENING).build()
        val (queue, index) = tree.expandRequestToPlaylist(listOf(continueItem))
        assertTrue(queue.size > 1)
        assertEquals(stationId, queue[index].mediaId)
    }

    @Test
    fun expandSingleSurahBuildsReciterQueue() {
        val surahId = MediaIds.surah("alafasy", 1)
        val item = tree.getItem(surahId)
        assertNotNull(item)
        val (queue, index) = tree.expandRequestToPlaylist(listOf(item!!))
        assertTrue(queue.size > 1)
        assertEquals(surahId, queue[index].mediaId)
    }

    @Test
    fun voiceSearchResolvesRadioAndQuran() {
        assertNotNull(tree.resolveVoiceQuery("Play Radio Seerah"))
        assertNotNull(tree.resolveVoiceQuery("play quran"))
        assertNotNull(tree.resolveVoiceQuery("nasheed"))
        val seerah = tree.resolveVoiceQuery("Radio Seerah")
        assertTrue(
            seerah?.mediaId?.contains("seerah") == true ||
                seerah?.mediaId?.startsWith("radio:") == true
        )
    }

    @Test
    fun recentChildrenIncludeResumePosition() {
        val podcastId = MediaIds.podcastEpisode("quran_yasin")
        preferences.recordPlayed(
            PlayableMedia(
                mediaId = podcastId,
                title = "Surah Ya-Sin",
                subtitle = "Podcast",
                streamUrl = "https://server8.mp3quran.net/afs/036.mp3",
                category = MediaCategory.PODCAST
            )
        )
        preferences.savePlaybackPosition(podcastId, 90_000L)
        val recent = tree.getChildren(MediaIds.RECENTLY_PLAYED)
        assertEquals(1, recent.size)
        assertEquals(
            90_000L,
            recent.first().mediaMetadata.extras?.getLong(MediaItemTree.EXTRA_RESUME_POSITION)
        )
    }
}
