package com.imediac.islammediacentral.media

import android.content.Context
import android.net.Uri
import android.os.Bundle
import androidx.annotation.DrawableRes
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.MimeTypes
import androidx.media3.session.MediaConstants
import androidx.media3.session.MediaLibraryService.LibraryParams
import com.imediac.islammediacentral.R
import com.imediac.islammediacentral.data.MediaCatalog
import com.imediac.islammediacentral.data.MediaCategory
import com.imediac.islammediacentral.data.MediaIds
import com.imediac.islammediacentral.data.MediaPreferences
import com.imediac.islammediacentral.data.PlayableMedia

/**
 * Android Auto / Media3 browse tree.
 *
 * Root children (always browsable — required for Auto navigation tabs):
 * Live Radio · Quran Reciters · Podcasts · Favorites · Recently Played
 */
class MediaItemTree(
    private val context: Context,
    private val preferences: MediaPreferences
) {

    fun getRootItem(): MediaItem = browsable(
        mediaId = MediaIds.ROOT,
        title = context.getString(R.string.browse_root_title),
        subtitle = "Islam Media Central",
        drawableRes = R.drawable.ic_launcher_foreground,
        folderType = MediaMetadata.MEDIA_TYPE_FOLDER_MIXED,
        isRootTab = false
    )

    /** Root returned when Auto asks for "continue listening" (LibraryParams.isRecent). */
    fun getRecentRootItem(): MediaItem = browsable(
        mediaId = MediaIds.RECENTLY_PLAYED,
        title = context.getString(R.string.category_recently_played),
        subtitle = "Continue listening",
        drawableRes = R.drawable.ic_auto_tab_recent,
        folderType = MediaMetadata.MEDIA_TYPE_FOLDER_MIXED,
        isRootTab = true
    )

    /**
     * Library root extras declaring content styles so Android Auto can render tabs correctly.
     */
    fun buildRootLibraryParams(requestParams: LibraryParams?): LibraryParams {
        val extras = Bundle(requestParams?.extras ?: Bundle()).apply {
            putInt(
                MediaConstants.EXTRAS_KEY_CONTENT_STYLE_BROWSABLE,
                MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_CATEGORY_LIST_ITEM
            )
            putInt(
                MediaConstants.EXTRAS_KEY_CONTENT_STYLE_PLAYABLE,
                MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_LIST_ITEM
            )
            // Root children are browsable tabs only (Live Radio, Quran, Podcasts, Favorites, Recent)
            putBoolean(MediaConstants.EXTRA_KEY_ROOT_CHILDREN_BROWSABLE_ONLY, true)
        }
        return LibraryParams.Builder()
            .setExtras(extras)
            .setRecent(requestParams?.isRecent == true)
            .setOffline(requestParams?.isOffline == true)
            .setSuggested(requestParams?.isSuggested == true)
            .build()
    }

    fun getChildren(parentId: String): List<MediaItem> = when (parentId) {
        MediaIds.ROOT -> rootChildren()
        MediaIds.LIVE_RADIO -> radioChildren()
        MediaIds.QURAN_RECITERS -> reciterChildren()
        MediaIds.PODCASTS -> podcastCategoryChildren()
        MediaIds.FAVORITES -> favoriteChildren()
        MediaIds.RECENTLY_PLAYED -> recentChildren()
        else -> when {
            parentId.startsWith("reciter:") -> surahChildren(parentId.removePrefix("reciter:"))
            parentId.startsWith("podcast_cat:") ->
                podcastEpisodeChildren(parentId.removePrefix("podcast_cat:"))
            else -> emptyList()
        }
    }

    fun getItem(mediaId: String): MediaItem? {
        if (mediaId == MediaIds.ROOT) return getRootItem()
        getChildren(MediaIds.ROOT).find { it.mediaId == mediaId }?.let { return it }
        listOf(
            MediaIds.LIVE_RADIO,
            MediaIds.QURAN_RECITERS,
            MediaIds.PODCASTS,
            MediaIds.FAVORITES,
            MediaIds.RECENTLY_PLAYED
        ).forEach { parent ->
            getChildren(parent).forEach { child ->
                if (child.mediaId == mediaId) return child
                if (child.mediaMetadata.isBrowsable == true) {
                    getChildren(child.mediaId).find { it.mediaId == mediaId }?.let { return it }
                }
            }
        }
        val playable = MediaCatalog.resolvePlayable(mediaId, preferences.getPodcastEpisodes())
        return playable?.let { toPlayableMediaItem(it) }
    }

    fun search(query: String): List<MediaItem> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return emptyList()

        val results = mutableListOf<MediaItem>()

        if (matches(q, "radio", "live", "islam media", "stream")) {
            results += radioChildren()
        }
        if (matches(q, "quran", "reciter", "surah", "koran")) {
            results += surahChildren("alafasy").take(5)
            results += reciterChildren()
        }
        if (matches(q, "podcast", "story", "hadith", "nasheed", "tajweed")) {
            results += podcastCategoryChildren()
        }
        if (matches(q, "favorite", "favourite", "starred")) {
            results += favoriteChildren()
        }
        if (matches(q, "recent", "history", "last")) {
            results += recentChildren()
        }

        MediaCatalog.radioStations
            .filter { it.name.lowercase().contains(q) || it.description.lowercase().contains(q) }
            .forEach { station ->
                MediaCatalog.resolvePlayable(MediaIds.radio(station.id))
                    ?.let { results += toPlayableMediaItem(it) }
            }
        MediaCatalog.reciters
            .filter { it.name.lowercase().contains(q) || it.id.contains(q) }
            .forEach { reciter ->
                results += browsable(
                    mediaId = MediaIds.reciter(reciter.id),
                    title = reciter.name,
                    subtitle = "Quran Reciter",
                    drawableRes = R.drawable.ic_auto_tab_quran,
                    folderType = MediaMetadata.MEDIA_TYPE_FOLDER_ALBUMS,
                    isRootTab = false
                )
            }
        preferences.getPodcastEpisodes()
            .filter {
                it.title.lowercase().contains(q) ||
                    it.description.lowercase().contains(q) ||
                    it.categoryId.contains(q)
            }
            .forEach { ep ->
                MediaCatalog.resolvePlayable(
                    MediaIds.podcastEpisode(ep.id),
                    preferences.getPodcastEpisodes()
                )?.let { results += toPlayableMediaItem(it) }
            }

        return results.distinctBy { it.mediaId }
    }

    fun resolveVoiceQuery(query: String): MediaItem? {
        val q = query.trim().lowercase()
        if (q.isEmpty() || matches(q, "islam media central", "islam media", "imedia")) {
            return radioChildren().firstOrNull()
        }
        if (matches(q, "radio", "live radio", "stream")) {
            return radioChildren().firstOrNull()
        }
        if (matches(q, "quran", "koran", "recitation")) {
            return getItem(MediaIds.surah("alafasy", 1))
        }
        return search(q).firstOrNull { it.mediaMetadata.isPlayable == true }
    }

    /** Top-level Auto tabs — all browsable (never playable). */
    fun rootChildren(): List<MediaItem> = listOf(
        browsable(
            MediaIds.LIVE_RADIO,
            context.getString(R.string.category_live_radio),
            "Stream stations",
            R.drawable.ic_auto_tab_radio,
            folderType = MediaMetadata.MEDIA_TYPE_FOLDER_RADIO_STATIONS,
            isRootTab = true
        ),
        browsable(
            MediaIds.QURAN_RECITERS,
            context.getString(R.string.category_quran_reciters),
            "Choose a reciter",
            R.drawable.ic_auto_tab_quran,
            folderType = MediaMetadata.MEDIA_TYPE_FOLDER_ARTISTS,
            isRootTab = true
        ),
        browsable(
            MediaIds.PODCASTS,
            context.getString(R.string.category_podcasts),
            "Categories · resume supported",
            R.drawable.ic_auto_tab_podcast,
            folderType = MediaMetadata.MEDIA_TYPE_FOLDER_PODCASTS,
            isRootTab = true
        ),
        browsable(
            MediaIds.FAVORITES,
            context.getString(R.string.category_favorites),
            "Synced with the app",
            R.drawable.ic_auto_tab_favorite,
            folderType = MediaMetadata.MEDIA_TYPE_FOLDER_MIXED,
            isRootTab = true
        ),
        browsable(
            MediaIds.RECENTLY_PLAYED,
            context.getString(R.string.category_recently_played),
            "Continue listening",
            R.drawable.ic_auto_tab_recent,
            folderType = MediaMetadata.MEDIA_TYPE_FOLDER_MIXED,
            isRootTab = true
        )
    )

    private fun radioChildren(): List<MediaItem> =
        MediaCatalog.radioStations.mapNotNull { station ->
            MediaCatalog.resolvePlayable(MediaIds.radio(station.id))?.let { toPlayableMediaItem(it) }
        }

    private fun reciterChildren(): List<MediaItem> =
        MediaCatalog.reciters.map { reciter ->
            browsable(
                mediaId = MediaIds.reciter(reciter.id),
                title = reciter.name,
                subtitle = "Tap to browse surahs",
                drawableRes = R.drawable.ic_auto_tab_quran,
                folderType = MediaMetadata.MEDIA_TYPE_FOLDER_ALBUMS,
                isRootTab = false
            )
        }

    private fun surahChildren(reciterId: String): List<MediaItem> {
        val reciter = MediaCatalog.reciters.find { it.id == reciterId } ?: return emptyList()
        val ordered = MediaCatalog.featuredSurahs +
            MediaCatalog.allSurahs.filter { s -> MediaCatalog.featuredSurahs.none { it.number == s.number } }
        return ordered.map { surah ->
            toPlayableMediaItem(
                PlayableMedia(
                    mediaId = MediaIds.surah(reciter.id, surah.number),
                    title = "${surah.number}. ${surah.name}",
                    subtitle = "${surah.englishName} · ${reciter.name}",
                    streamUrl = MediaCatalog.surahUrl(reciter, surah.number),
                    category = MediaCategory.QURAN
                )
            )
        }
    }

    private fun podcastCategoryChildren(): List<MediaItem> =
        MediaCatalog.podcastCategories.map { cat ->
            browsable(
                mediaId = MediaIds.podcastCategory(cat.id),
                title = cat.name,
                subtitle = cat.description,
                drawableRes = R.drawable.ic_auto_tab_podcast,
                folderType = MediaMetadata.MEDIA_TYPE_FOLDER_PLAYLISTS,
                isRootTab = false
            )
        }

    private fun podcastEpisodeChildren(categoryId: String): List<MediaItem> {
        val episodes = preferences.getPodcastEpisodes().filter { it.categoryId == categoryId }
        return episodes.mapNotNull { ep ->
            MediaCatalog.resolvePlayable(
                MediaIds.podcastEpisode(ep.id),
                preferences.getPodcastEpisodes()
            )?.let { item ->
                val position = preferences.getPlaybackPosition(item.mediaId)
                toPlayableMediaItem(item, resumePositionMs = position)
            }
        }
    }

    private fun favoriteChildren(): List<MediaItem> {
        // Empty list is preferred over fake nodes — Auto handles empty sections cleanly.
        return preferences.getFavoriteIds().mapNotNull { id ->
            MediaCatalog.resolvePlayable(id, preferences.getPodcastEpisodes())
                ?.let { toPlayableMediaItem(it) }
                ?: preferences.getRecentlyPlayed().find { it.mediaId == id }
                    ?.let { toPlayableMediaItem(it) }
        }
    }

    private fun recentChildren(): List<MediaItem> =
        preferences.getRecentlyPlayed().map { toPlayableMediaItem(it) }

    fun toPlayableMediaItem(
        item: PlayableMedia,
        resumePositionMs: Long = 0L
    ): MediaItem {
        val styleExtras = Bundle().apply {
            putString(EXTRA_CATEGORY, item.category.name)
            putBoolean(EXTRA_LIVE, item.isLive)
            if (resumePositionMs > 0L) putLong(EXTRA_RESUME_POSITION, resumePositionMs)
            putInt(
                MediaConstants.EXTRAS_KEY_CONTENT_STYLE_PLAYABLE,
                MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_LIST_ITEM
            )
        }
        val metadata = MediaMetadata.Builder()
            .setTitle(item.title)
            .setArtist(item.subtitle)
            .setAlbumTitle("Islam Media Central")
            .setIsBrowsable(false)
            .setIsPlayable(true)
            .setMediaType(
                if (item.isLive) MediaMetadata.MEDIA_TYPE_RADIO_STATION
                else MediaMetadata.MEDIA_TYPE_MUSIC
            )
            .setArtworkUri(item.artworkUrl?.let { Uri.parse(it) })
            .setExtras(styleExtras)
            .build()

        return MediaItem.Builder()
            .setMediaId(item.mediaId)
            .setUri(item.streamUrl)
            .setMimeType(if (item.isLive) MimeTypes.AUDIO_UNKNOWN else MimeTypes.AUDIO_MPEG)
            .setMediaMetadata(metadata)
            .setRequestMetadata(
                MediaItem.RequestMetadata.Builder()
                    .setMediaUri(Uri.parse(item.streamUrl))
                    .build()
            )
            .build()
    }

    private fun browsable(
        mediaId: String,
        title: String,
        subtitle: String,
        @DrawableRes drawableRes: Int,
        folderType: Int,
        isRootTab: Boolean
    ): MediaItem {
        val artwork = Uri.parse("android.resource://${context.packageName}/$drawableRes")
        val extras = Bundle().apply {
            putInt(
                MediaConstants.EXTRAS_KEY_CONTENT_STYLE_BROWSABLE,
                if (isRootTab) MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_CATEGORY_LIST_ITEM
                else MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_LIST_ITEM
            )
            putInt(
                MediaConstants.EXTRAS_KEY_CONTENT_STYLE_PLAYABLE,
                MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_LIST_ITEM
            )
        }
        val metadata = MediaMetadata.Builder()
            .setTitle(title)
            .setArtist(subtitle)
            .setIsBrowsable(true)
            .setIsPlayable(false)
            .setMediaType(folderType)
            .setArtworkUri(artwork)
            .setExtras(extras)
            .build()
        return MediaItem.Builder()
            .setMediaId(mediaId)
            .setMediaMetadata(metadata)
            .build()
    }

    private fun matches(query: String, vararg keywords: String): Boolean =
        keywords.any { query.contains(it) || it.contains(query) }

    companion object {
        const val EXTRA_CATEGORY = "imc_category"
        const val EXTRA_LIVE = "imc_live"
        const val EXTRA_RESUME_POSITION = "imc_resume_position"

        /** Stable IDs Android Auto must see under the library root. */
        val REQUIRED_ROOT_TAB_IDS = listOf(
            MediaIds.LIVE_RADIO,
            MediaIds.QURAN_RECITERS,
            MediaIds.PODCASTS,
            MediaIds.FAVORITES,
            MediaIds.RECENTLY_PLAYED
        )
    }
}
