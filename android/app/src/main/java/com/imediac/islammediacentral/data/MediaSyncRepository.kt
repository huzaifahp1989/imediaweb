package com.imediac.islammediacentral.data

/**
 * Optional bridge to import AudioContent / favorites from the Islam Media Central backend
 * (Base44 or Supabase) without coupling the MediaLibraryService to network I/O at browse time.
 *
 * Call from the phone app after login; Android Auto then reads the cached catalog via MediaPreferences.
 */
class MediaSyncRepository(
    private val preferences: MediaPreferences
) {

    fun applyRemoteFavorites(mediaIds: Collection<String>) {
        preferences.mergeFavoriteIds(mediaIds)
    }

    fun applyRemotePodcasts(episodes: List<PodcastEpisode>) {
        preferences.importPodcastCatalog(episodes)
    }

    /**
     * Maps a Base44/Supabase AudioContent-like map into [PodcastEpisode].
     * Expected keys: id, title, description, mp3_url / stream_url, category, cover_image, duration
     */
    fun mapAudioContentRow(row: Map<String, Any?>): PodcastEpisode? {
        val id = row["id"]?.toString() ?: return null
        val url = (row["mp3_url"] ?: row["stream_url"] ?: row["audio_url"])?.toString()
        if (url.isNullOrBlank()) return null
        val durationSeconds = (row["duration"] as? Number)?.toLong() ?: 0L
        return PodcastEpisode(
            id = id,
            categoryId = row["category"]?.toString() ?: "story",
            title = row["title"]?.toString() ?: "Untitled",
            description = row["description"]?.toString().orEmpty(),
            streamUrl = url,
            artworkUrl = row["cover_image"]?.toString(),
            durationMs = durationSeconds * 1000L
        )
    }
}
