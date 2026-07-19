package com.imediac.islammediacentral.data

/**
 * Shared media models used by the Android Auto browse tree and ExoPlayer queue.
 * Content mirrors Islam Media Central web sources (radio, Quran reciters, audio library).
 */
data class RadioStation(
    val id: String,
    val name: String,
    val description: String,
    val streamUrl: String,
    val artworkUrl: String? = null
)

data class QuranReciter(
    val id: String,
    val name: String,
    val baseUrl: String,
    val artworkUrl: String? = null
)

data class QuranSurah(
    val number: Int,
    val name: String,
    val englishName: String,
    val verses: Int
)

data class PodcastCategory(
    val id: String,
    val name: String,
    val description: String
)

data class PodcastEpisode(
    val id: String,
    val categoryId: String,
    val title: String,
    val description: String,
    val streamUrl: String,
    val artworkUrl: String? = null,
    val durationMs: Long = 0L
)

data class PlayableMedia(
    val mediaId: String,
    val title: String,
    val subtitle: String,
    val streamUrl: String,
    val artworkUrl: String? = null,
    val isLive: Boolean = false,
    val category: MediaCategory = MediaCategory.UNKNOWN
)

enum class MediaCategory {
    RADIO,
    QURAN,
    PODCAST,
    LECTURE,
    FAVORITE,
    RECENT,
    UNKNOWN
}

object MediaIds {
    const val ROOT = "root"
    /** Playable shortcut — resumes the last Live Radio / Quran / Podcast / Lecture. */
    const val CONTINUE_LISTENING = "continue_listening"
    const val LIVE_RADIO = "live_radio"
    const val QURAN_RECITERS = "quran_reciters"
    const val PODCASTS = "podcasts"
    const val LECTURES = "lectures"
    const val FAVORITES = "favorites"
    const val RECENTLY_PLAYED = "recently_played"

    fun radio(id: String) = "radio:$id"
    fun reciter(id: String) = "reciter:$id"
    fun surah(reciterId: String, number: Int) = "surah:$reciterId:$number"
    fun podcastCategory(id: String) = "podcast_cat:$id"
    fun podcastEpisode(id: String) = "podcast:$id"
    fun lecture(id: String) = "lecture:$id"

    fun isPlayable(mediaId: String): Boolean =
        mediaId == CONTINUE_LISTENING ||
            mediaId.startsWith("radio:") ||
            mediaId.startsWith("surah:") ||
            mediaId.startsWith("podcast:") ||
            mediaId.startsWith("lecture:")

    /** Podcasts, Quran tracks, and lectures restore a saved position; live radio does not. */
    fun supportsResumePosition(mediaId: String): Boolean =
        mediaId.startsWith("surah:") ||
            mediaId.startsWith("podcast:") ||
            mediaId.startsWith("lecture:")
}
