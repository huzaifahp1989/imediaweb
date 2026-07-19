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
 * Root children (Continue Listening first):
 * Continue Listening · Live Radio · Quran Reciters · Podcasts · Lectures · Favorites · Recently Played
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
        subtitle = context.getString(R.string.continue_listening_subtitle),
        drawableRes = R.drawable.ic_auto_tab_recent,
        folderType = MediaMetadata.MEDIA_TYPE_FOLDER_MIXED,
        isRootTab = true
    )

    /**
     * Library root extras declaring content styles so Android Auto can render tabs correctly.
     * Root may include a playable Continue Listening shortcut, so browsable-only is false.
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
            putBoolean(MediaConstants.EXTRA_KEY_ROOT_CHILDREN_BROWSABLE_ONLY, false)
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
        MediaIds.CONTINUE_LISTENING -> continueListeningChildren()
        MediaIds.LIVE_RADIO -> radioChildren()
        MediaIds.QURAN_RECITERS -> reciterChildren()
        MediaIds.PODCASTS -> podcastCategoryChildren()
        MediaIds.LECTURES -> lectureChildren()
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
        if (mediaId == MediaIds.CONTINUE_LISTENING) return buildContinueListeningItem()
        getChildren(MediaIds.ROOT).find { it.mediaId == mediaId }?.let { return it }
        listOf(
            MediaIds.LIVE_RADIO,
            MediaIds.QURAN_RECITERS,
            MediaIds.PODCASTS,
            MediaIds.LECTURES,
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
        val playable = resolvePlayable(mediaId)
        return playable?.let { toPlayableMediaItem(it, resumePositionFor(it)) }
    }

    /**
     * Resolves the Continue Listening shortcut to the real last-played [PlayableMedia],
     * or null when nothing has been played yet.
     */
    fun resolveContinueListening(): PlayableMedia? = preferences.getLastPlayed()?.let { last ->
        resolvePlayable(last.mediaId) ?: last
    }

    fun search(query: String): List<MediaItem> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return emptyList()

        val results = mutableListOf<MediaItem>()

        if (matches(q, "continue", "resume", "last played", "listen again")) {
            buildContinueListeningItem().let { results += it }
            results += continueListeningChildren()
        }
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
        if (matches(q, "lecture", "khutbah", "talk", "bayaan")) {
            results += lectureChildren()
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
                resolvePlayable(MediaIds.radio(station.id))
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
                resolvePlayable(MediaIds.podcastEpisode(ep.id))
                    ?.let { results += toPlayableMediaItem(it, resumePositionFor(it)) }
            }
        preferences.getLectures()
            .filter {
                it.title.lowercase().contains(q) || it.description.lowercase().contains(q)
            }
            .forEach { lecture ->
                resolvePlayable(MediaIds.lecture(lecture.id))
                    ?.let { results += toPlayableMediaItem(it, resumePositionFor(it)) }
            }

        return results.distinctBy { it.mediaId }
    }

    fun resolveVoiceQuery(query: String): MediaItem? {
        val q = query.trim().lowercase()
        if (matches(q, "continue", "resume", "last played", "continue listening")) {
            return buildContinueListeningItem().takeIf { it.mediaMetadata.isPlayable == true }
                ?: continueListeningChildren().firstOrNull()
        }
        if (q.isEmpty() || matches(q, "islam media central", "islam media", "imedia")) {
            return radioChildren().firstOrNull()
        }
        if (matches(q, "radio", "live radio", "stream")) {
            return radioChildren().firstOrNull()
        }
        if (matches(q, "quran", "koran", "recitation")) {
            return getItem(MediaIds.surah("alafasy", 1))
        }
        if (matches(q, "lecture", "khutbah")) {
            return lectureChildren().firstOrNull()
        }
        return search(q).firstOrNull { it.mediaMetadata.isPlayable == true }
    }

    /**
     * Top-level Auto items — Continue Listening is always first.
     * When there is a last-played item it is playable; otherwise a browsable empty placeholder.
     */
    fun rootChildren(): List<MediaItem> = listOf(
        buildContinueListeningItem(),
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
            MediaIds.LECTURES,
            context.getString(R.string.category_lectures),
            "Talks · resume supported",
            R.drawable.ic_auto_tab_lecture,
            folderType = MediaMetadata.MEDIA_TYPE_FOLDER_PLAYLISTS,
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
            context.getString(R.string.continue_listening_subtitle),
            R.drawable.ic_auto_tab_recent,
            folderType = MediaMetadata.MEDIA_TYPE_FOLDER_MIXED,
            isRootTab = true
        )
    )

    fun buildContinueListeningItem(): MediaItem {
        val last = resolveContinueListening()
        if (last == null) {
            return browsable(
                mediaId = MediaIds.CONTINUE_LISTENING,
                title = context.getString(R.string.category_continue_listening),
                subtitle = context.getString(R.string.empty_continue_listening),
                drawableRes = R.drawable.ic_auto_tab_continue,
                folderType = MediaMetadata.MEDIA_TYPE_FOLDER_MIXED,
                isRootTab = true
            )
        }
        val resumeMs = resumePositionFor(last)
        val typeLabel = when (last.category) {
            MediaCategory.RADIO -> "Live Radio"
            MediaCategory.QURAN -> "Quran"
            MediaCategory.PODCAST -> "Podcast"
            MediaCategory.LECTURE -> "Lecture"
            else -> "Resume"
        }
        val subtitle = buildString {
            append(typeLabel)
            append(" · ")
            append(last.title)
            if (resumeMs > 0L) append(" · resume")
        }
        val styleExtras = Bundle().apply {
            putString(EXTRA_CATEGORY, last.category.name)
            putBoolean(EXTRA_LIVE, last.isLive)
            putString(EXTRA_RESOLVED_MEDIA_ID, last.mediaId)
            if (resumeMs > 0L) putLong(EXTRA_RESUME_POSITION, resumeMs)
            putInt(
                MediaConstants.EXTRAS_KEY_CONTENT_STYLE_PLAYABLE,
                MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_LIST_ITEM
            )
        }
        val artwork = last.artworkUrl?.let { Uri.parse(it) }
            ?: Uri.parse("android.resource://${context.packageName}/${R.drawable.ic_auto_tab_continue}")
        val metadata = MediaMetadata.Builder()
            .setTitle(context.getString(R.string.category_continue_listening))
            .setArtist(subtitle)
            .setAlbumTitle("Islam Media Central")
            .setIsBrowsable(false)
            .setIsPlayable(true)
            .setMediaType(
                if (last.isLive) MediaMetadata.MEDIA_TYPE_RADIO_STATION
                else MediaMetadata.MEDIA_TYPE_MUSIC
            )
            .setArtworkUri(artwork)
            .setExtras(styleExtras)
            .build()
        return MediaItem.Builder()
            .setMediaId(MediaIds.CONTINUE_LISTENING)
            .setUri(last.streamUrl)
            .setMimeType(if (last.isLive) MimeTypes.AUDIO_UNKNOWN else MimeTypes.AUDIO_MPEG)
            .setMediaMetadata(metadata)
            .setRequestMetadata(
                MediaItem.RequestMetadata.Builder()
                    .setMediaUri(Uri.parse(last.streamUrl))
                    .build()
            )
            .build()
    }

    private fun continueListeningChildren(): List<MediaItem> {
        val last = resolveContinueListening() ?: return emptyList()
        return listOf(toPlayableMediaItem(last, resumePositionFor(last)))
    }

    private fun radioChildren(): List<MediaItem> =
        MediaCatalog.radioStations.mapNotNull { station ->
            resolvePlayable(MediaIds.radio(station.id))?.let { toPlayableMediaItem(it) }
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
            val playable = PlayableMedia(
                mediaId = MediaIds.surah(reciter.id, surah.number),
                title = "${surah.number}. ${surah.name}",
                subtitle = "${surah.englishName} · ${reciter.name}",
                streamUrl = MediaCatalog.surahUrl(reciter, surah.number),
                category = MediaCategory.QURAN
            )
            toPlayableMediaItem(playable, resumePositionFor(playable))
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
            resolvePlayable(MediaIds.podcastEpisode(ep.id))?.let { item ->
                toPlayableMediaItem(item, resumePositionFor(item))
            }
        }
    }

    private fun lectureChildren(): List<MediaItem> =
        preferences.getLectures().mapNotNull { lecture ->
            resolvePlayable(MediaIds.lecture(lecture.id))?.let { item ->
                toPlayableMediaItem(item, resumePositionFor(item))
            }
        }

    private fun favoriteChildren(): List<MediaItem> {
        return preferences.getFavoriteIds().mapNotNull { id ->
            resolvePlayable(id)?.let { toPlayableMediaItem(it, resumePositionFor(it)) }
                ?: preferences.getRecentlyPlayed().find { it.mediaId == id }
                    ?.let { toPlayableMediaItem(it, resumePositionFor(it)) }
        }
    }

    private fun recentChildren(): List<MediaItem> =
        preferences.getRecentlyPlayed().map { toPlayableMediaItem(it, resumePositionFor(it)) }

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

    fun resumePositionMs(mediaId: String): Long {
        if (!MediaIds.supportsResumePosition(mediaId)) return 0L
        return preferences.getPlaybackPosition(mediaId)
    }

    private fun resumePositionFor(item: PlayableMedia): Long {
        if (item.isLive) return 0L
        return resumePositionMs(item.mediaId)
    }

    private fun resolvePlayable(mediaId: String): PlayableMedia? =
        MediaCatalog.resolvePlayable(
            mediaId,
            preferences.getPodcastEpisodes(),
            preferences.getLectures()
        )

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
        const val EXTRA_RESOLVED_MEDIA_ID = "imc_resolved_media_id"

        /** Stable IDs Android Auto must see under the library root (Continue Listening first). */
        val REQUIRED_ROOT_TAB_IDS = listOf(
            MediaIds.CONTINUE_LISTENING,
            MediaIds.LIVE_RADIO,
            MediaIds.QURAN_RECITERS,
            MediaIds.PODCASTS,
            MediaIds.LECTURES,
            MediaIds.FAVORITES,
            MediaIds.RECENTLY_PLAYED
        )
    }
}
