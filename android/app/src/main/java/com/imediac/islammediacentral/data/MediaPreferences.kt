package com.imediac.islammediacentral.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Local persistence for favorites, recently played, resume positions, and Auto reconnect.
 * Survives app restarts via SharedPreferences; designed for a future Supabase sync.
 */
class MediaPreferences(context: Context) {

    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    fun getFavoriteIds(): LinkedHashSet<String> {
        val raw = prefs.getString(KEY_FAVORITES, null) ?: return linkedSetOf()
        val type = object : TypeToken<List<String>>() {}.type
        val list: List<String> = gson.fromJson(raw, type) ?: emptyList()
        return LinkedHashSet(list)
    }

    fun isFavorite(mediaId: String): Boolean = getFavoriteIds().contains(mediaId)

    fun toggleFavorite(mediaId: String): Boolean {
        val set = getFavoriteIds()
        val added = if (set.contains(mediaId)) {
            set.remove(mediaId)
            false
        } else {
            set.add(mediaId)
            true
        }
        prefs.edit().putString(KEY_FAVORITES, gson.toJson(set.toList())).apply()
        return added
    }

    fun addFavorite(mediaId: String) {
        val set = getFavoriteIds()
        if (set.add(mediaId)) {
            prefs.edit().putString(KEY_FAVORITES, gson.toJson(set.toList())).apply()
        }
    }

    fun getRecentlyPlayed(): List<PlayableMedia> {
        val raw = prefs.getString(KEY_RECENT, null) ?: return emptyList()
        val type = object : TypeToken<List<PlayableMedia>>() {}.type
        return gson.fromJson(raw, type) ?: emptyList()
    }

    /** Most recent playable item (radio, Quran, podcast, or lecture), or null. */
    fun getLastPlayed(): PlayableMedia? {
        val raw = prefs.getString(KEY_LAST_PLAYED, null)
        if (!raw.isNullOrBlank()) {
            return gson.fromJson(raw, PlayableMedia::class.java) ?: getRecentlyPlayed().firstOrNull()
        }
        return getRecentlyPlayed().firstOrNull()
    }

    /**
     * Saves [item] as the last-played entry and prepends it to Recently Played.
     * Called automatically whenever playback starts a new media item.
     */
    fun recordPlayed(item: PlayableMedia) {
        if (item.mediaId == MediaIds.CONTINUE_LISTENING || item.mediaId == MediaIds.ROOT) return
        val current = getRecentlyPlayed().toMutableList()
        current.removeAll { it.mediaId == item.mediaId }
        current.add(0, item)
        val trimmed = current.take(MAX_RECENT)
        // commit() so last-played survives process death before apply() flush
        prefs.edit()
            .putString(KEY_RECENT, gson.toJson(trimmed))
            .putString(KEY_LAST_PLAYED, gson.toJson(item))
            .commit()
    }

    fun getPlaybackPosition(mediaId: String): Long {
        if (!MediaIds.supportsResumePosition(mediaId)) return 0L
        return prefs.getLong(positionKey(mediaId), 0L)
    }

    fun savePlaybackPosition(mediaId: String, positionMs: Long) {
        // Skip live radio / continue shortcut and very short positions
        if (!MediaIds.supportsResumePosition(mediaId) || positionMs < 1_500L) return
        prefs.edit().putLong(positionKey(mediaId), positionMs).apply()
    }

    fun clearPlaybackPosition(mediaId: String) {
        prefs.edit().remove(positionKey(mediaId)).apply()
    }

    /**
     * When Android Auto disconnects mid-playback, set this so the next Auto connection
     * automatically resumes the last item.
     */
    fun setPendingAutoResume(pending: Boolean) {
        prefs.edit().putBoolean(KEY_PENDING_AUTO_RESUME, pending).commit()
    }

    fun isPendingAutoResume(): Boolean = prefs.getBoolean(KEY_PENDING_AUTO_RESUME, false)

    fun consumePendingAutoResume(): Boolean {
        if (!isPendingAutoResume()) return false
        prefs.edit().putBoolean(KEY_PENDING_AUTO_RESUME, false).commit()
        return true
    }

    fun getPodcastEpisodes(): List<PodcastEpisode> {
        val raw = prefs.getString(KEY_PODCASTS, null)
        if (raw.isNullOrBlank()) return MediaCatalog.seedPodcasts
        val type = object : TypeToken<List<PodcastEpisode>>() {}.type
        return gson.fromJson(raw, type) ?: MediaCatalog.seedPodcasts
    }

    fun getLectures(): List<PodcastEpisode> {
        val raw = prefs.getString(KEY_LECTURES, null)
        if (raw.isNullOrBlank()) return MediaCatalog.seedLectures
        val type = object : TypeToken<List<PodcastEpisode>>() {}.type
        return gson.fromJson(raw, type) ?: MediaCatalog.seedLectures
    }

    fun getLiveStations(): List<RadioStation> {
        val raw = prefs.getString(KEY_LIVE_STATIONS, null)
        if (raw.isNullOrBlank()) return MediaCatalog.radioStations
        val type = object : TypeToken<List<RadioStation>>() {}.type
        return gson.fromJson(raw, type) ?: MediaCatalog.radioStations
    }

    fun getQuranRadioStreams(): List<RadioStation> {
        val raw = prefs.getString(KEY_QURAN_RADIO, null) ?: return emptyList()
        val type = object : TypeToken<List<RadioStation>>() {}.type
        return gson.fromJson(raw, type) ?: emptyList()
    }

    /** Categories derived from the synced Audio Library episodes. */
    fun getAudioLibraryCategories(): List<PodcastCategory> {
        val episodes = getPodcastEpisodes()
        return episodes
            .map { it.categoryId }
            .distinct()
            .sorted()
            .map { id ->
                val label = id.split('-').joinToString(" ") { part ->
                    part.replaceFirstChar { ch -> ch.uppercaseChar() }
                }
                PodcastCategory(
                    id = id,
                    name = label,
                    description = "From Islamic Audio Library"
                )
            }
            .ifEmpty { MediaCatalog.podcastCategories }
    }

    /** Import / replace podcast catalog (e.g. from Base44 AudioContent or Supabase). */
    fun importPodcastCatalog(episodes: List<PodcastEpisode>) {
        prefs.edit().putString(KEY_PODCASTS, gson.toJson(episodes)).apply()
    }

    fun importLectureCatalog(lectures: List<PodcastEpisode>) {
        prefs.edit().putString(KEY_LECTURES, gson.toJson(lectures)).apply()
    }

    fun importLiveStations(stations: List<RadioStation>) {
        prefs.edit().putString(KEY_LIVE_STATIONS, gson.toJson(stations)).apply()
    }

    fun importQuranRadioStreams(stations: List<RadioStation>) {
        prefs.edit().putString(KEY_QURAN_RADIO, gson.toJson(stations)).apply()
    }

    /** Sync favorite IDs from the main app / Supabase without wiping local-only entries. */
    fun mergeFavoriteIds(remoteIds: Collection<String>) {
        val set = getFavoriteIds()
        var changed = false
        remoteIds.forEach {
            if (set.add(it)) changed = true
        }
        if (changed) {
            prefs.edit().putString(KEY_FAVORITES, gson.toJson(set.toList())).apply()
        }
    }

    private fun positionKey(mediaId: String) = "pos:$mediaId"

    companion object {
        private const val PREFS_NAME = "imc_media_prefs"
        private const val KEY_FAVORITES = "favorites"
        private const val KEY_RECENT = "recently_played"
        private const val KEY_LAST_PLAYED = "last_played"
        private const val KEY_PODCASTS = "podcast_catalog"
        private const val KEY_LECTURES = "lecture_catalog"
        private const val KEY_LIVE_STATIONS = "live_stations"
        private const val KEY_QURAN_RADIO = "quran_radio_streams"
        private const val KEY_PENDING_AUTO_RESUME = "pending_auto_resume"
        private const val MAX_RECENT = 40
    }
}
