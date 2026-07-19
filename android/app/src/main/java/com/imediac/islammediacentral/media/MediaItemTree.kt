package com.imediac.islammediacentral.media

import android.content.Context
import android.net.Uri
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.MimeTypes
import com.imediac.islammediacentral.R
import com.imediac.islammediacentral.data.MediaCatalog
import com.imediac.islammediacentral.data.MediaIds
import com.imediac.islammediacentral.data.MediaPreferences
import com.imediac.islammediacentral.data.PlayableMedia

/**
 * Builds the Android Auto / Media3 browse tree:
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
        drawableRes = R.drawable.ic_launcher_foreground
    )

    fun getChildren(parentId: String): List<MediaItem> = when (parentId) {
        MediaIds.ROOT -> rootChildren()
        MediaIds.LIVE_RADIO -> radioChildren()
        MediaIds.QURAN_RECITERS -> reciterChildren()
        MediaIds.PODCASTS -> podcastCategoryChildren()
        MediaIds.FAVORITES -> favoriteChildren()
        MediaIds.RECENTLY_PLAYED -> recentChildren()
        else -> when {
            parentId.startsWith("reciter:") -> surahChildren(parentId.removePrefix("reciter:"))
            parentId.startsWith("podcast_cat:") -> podcastEpisodeChildren(parentId.removePrefix("podcast_cat:"))
            else -> emptyList()
        }
    }

    fun getItem(mediaId: String): MediaItem? {
        if (mediaId == MediaIds.ROOT) return getRootItem()
        getChildren(MediaIds.ROOT).find { it.mediaId == mediaId }?.let { return it }
        // Search nested trees
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
        // Build on the fly for playable ids
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

        // Direct station / reciter / episode matches
        MediaCatalog.radioStations
            .filter { it.name.lowercase().contains(q) || it.description.lowercase().contains(q) }
            .forEach { station ->
                results += toPlayableMediaItem(
                    MediaCatalog.resolvePlayable(MediaIds.radio(station.id))!!
                )
            }
        MediaCatalog.reciters
            .filter { it.name.lowercase().contains(q) || it.id.contains(q) }
            .forEach { reciter ->
                results += browsable(
                    mediaId = MediaIds.reciter(reciter.id),
                    title = reciter.name,
                    subtitle = "Quran Reciter",
                    drawableRes = R.drawable.ic_media_quran
                )
            }
        preferences.getPodcastEpisodes()
            .filter {
                it.title.lowercase().contains(q) ||
                    it.description.lowercase().contains(q) ||
                    it.categoryId.contains(q)
            }
            .forEach { ep ->
                MediaCatalog.resolvePlayable(MediaIds.podcastEpisode(ep.id), preferences.getPodcastEpisodes())
                    ?.let { results += toPlayableMediaItem(it) }
            }

        return results.distinctBy { it.mediaId }
    }

    /** Resolve Assistant-style play commands to a concrete playable item. */
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
        val searchHits = search(q).filter { it.mediaMetadata.isPlayable == true }
        return searchHits.firstOrNull()
    }

    private fun rootChildren(): List<MediaItem> = listOf(
        browsable(
            MediaIds.LIVE_RADIO,
            context.getString(R.string.category_live_radio),
            "Stream stations",
            R.drawable.ic_media_radio
        ),
        browsable(
            MediaIds.QURAN_RECITERS,
            context.getString(R.string.category_quran_reciters),
            "Choose a reciter",
            R.drawable.ic_media_quran
        ),
        browsable(
            MediaIds.PODCASTS,
            context.getString(R.string.category_podcasts),
            "Categories · resume supported",
            R.drawable.ic_media_podcast
        ),
        browsable(
            MediaIds.FAVORITES,
            context.getString(R.string.category_favorites),
            "Synced with the app",
            R.drawable.ic_media_favorite
        ),
        browsable(
            MediaIds.RECENTLY_PLAYED,
            context.getString(R.string.category_recently_played),
            "Continue listening",
            R.drawable.ic_media_recent
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
                drawableRes = R.drawable.ic_media_quran
            )
        }

    private fun surahChildren(reciterId: String): List<MediaItem> {
        val reciter = MediaCatalog.reciters.find { it.id == reciterId } ?: return emptyList()
        // Show featured first for Auto UX, then remaining
        val ordered = MediaCatalog.featuredSurahs +
            MediaCatalog.allSurahs.filter { s -> MediaCatalog.featuredSurahs.none { it.number == s.number } }
        return ordered.map { surah ->
            val playable = PlayableMedia(
                mediaId = MediaIds.surah(reciter.id, surah.number),
                title = "${surah.number}. ${surah.name}",
                subtitle = "${surah.englishName} · ${reciter.name}",
                streamUrl = MediaCatalog.surahUrl(reciter, surah.number),
                category = com.imediac.islammediacentral.data.MediaCategory.QURAN
            )
            toPlayableMediaItem(playable)
        }
    }

    private fun podcastCategoryChildren(): List<MediaItem> =
        MediaCatalog.podcastCategories.map { cat ->
            browsable(
                mediaId = MediaIds.podcastCategory(cat.id),
                title = cat.name,
                subtitle = cat.description,
                drawableRes = R.drawable.ic_media_podcast
            )
        }

    private fun podcastEpisodeChildren(categoryId: String): List<MediaItem> {
        val episodes = preferences.getPodcastEpisodes().filter { it.categoryId == categoryId }
        return episodes.mapNotNull { ep ->
            MediaCatalog.resolvePlayable(MediaIds.podcastEpisode(ep.id), preferences.getPodcastEpisodes())
                ?.let { item ->
                    val position = preferences.getPlaybackPosition(item.mediaId)
                    toPlayableMediaItem(item, resumePositionMs = position)
                }
        }
    }

    private fun favoriteChildren(): List<MediaItem> {
        val ids = preferences.getFavoriteIds()
        if (ids.isEmpty()) {
            return listOf(
                browsable(
                    mediaId = "favorites_empty",
                    title = context.getString(R.string.empty_favorites),
                    subtitle = "",
                    drawableRes = R.drawable.ic_media_favorite
                )
            )
        }
        return ids.mapNotNull { id ->
            MediaCatalog.resolvePlayable(id, preferences.getPodcastEpisodes())
                ?.let { toPlayableMediaItem(it) }
                ?: preferences.getRecentlyPlayed().find { it.mediaId == id }?.let { toPlayableMediaItem(it) }
        }
    }

    private fun recentChildren(): List<MediaItem> {
        val recent = preferences.getRecentlyPlayed()
        if (recent.isEmpty()) {
            return listOf(
                browsable(
                    mediaId = "recent_empty",
                    title = context.getString(R.string.empty_recent),
                    subtitle = "",
                    drawableRes = R.drawable.ic_media_recent
                )
            )
        }
        return recent.map { toPlayableMediaItem(it) }
    }

    fun toPlayableMediaItem(
        item: PlayableMedia,
        resumePositionMs: Long = 0L
    ): MediaItem {
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
            .setExtras(
                android.os.Bundle().apply {
                    putString(EXTRA_CATEGORY, item.category.name)
                    putBoolean(EXTRA_LIVE, item.isLive)
                    if (resumePositionMs > 0L) putLong(EXTRA_RESUME_POSITION, resumePositionMs)
                }
            )
            .build()

        val request = MediaItem.RequestMetadata.Builder()
            .setMediaUri(Uri.parse(item.streamUrl))
            .build()

        return MediaItem.Builder()
            .setMediaId(item.mediaId)
            .setUri(item.streamUrl)
            .setMimeType(if (item.isLive) MimeTypes.AUDIO_UNKNOWN else MimeTypes.AUDIO_MPEG)
            .setMediaMetadata(metadata)
            .setRequestMetadata(request)
            .build()
    }

    private fun browsable(
        mediaId: String,
        title: String,
        subtitle: String,
        drawableRes: Int
    ): MediaItem {
        val artwork = Uri.parse("android.resource://${context.packageName}/$drawableRes")
        val metadata = MediaMetadata.Builder()
            .setTitle(title)
            .setArtist(subtitle)
            .setIsBrowsable(true)
            .setIsPlayable(false)
            .setMediaType(MediaMetadata.MEDIA_TYPE_FOLDER_MIXED)
            .setArtworkUri(artwork)
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
    }
}
