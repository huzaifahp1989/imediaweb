package com.imediac.islammediacentral.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Local persistence for favorites, recently played, and podcast resume positions.
 * Designed so a future Supabase sync can read/write the same keys without changing Auto UI.
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

    fun recordPlayed(item: PlayableMedia) {
        val current = getRecentlyPlayed().toMutableList()
        current.removeAll { it.mediaId == item.mediaId }
        current.add(0, item)
        val trimmed = current.take(MAX_RECENT)
        prefs.edit().putString(KEY_RECENT, gson.toJson(trimmed)).apply()
    }

    fun getPlaybackPosition(mediaId: String): Long =
        prefs.getLong(positionKey(mediaId), 0L)

    fun savePlaybackPosition(mediaId: String, positionMs: Long) {
        // Skip live radio and very short positions
        if (mediaId.startsWith("radio:") || positionMs < 1_500L) return
        prefs.edit().putLong(positionKey(mediaId), positionMs).apply()
    }

    fun clearPlaybackPosition(mediaId: String) {
        prefs.edit().remove(positionKey(mediaId)).apply()
    }

    fun getPodcastEpisodes(): List<PodcastEpisode> {
        val raw = prefs.getString(KEY_PODCASTS, null)
        if (raw.isNullOrBlank()) return MediaCatalog.seedPodcasts
        val type = object : TypeToken<List<PodcastEpisode>>() {}.type
        return gson.fromJson(raw, type) ?: MediaCatalog.seedPodcasts
    }

    /** Import / replace podcast catalog (e.g. from Base44 AudioContent or Supabase). */
    fun importPodcastCatalog(episodes: List<PodcastEpisode>) {
        prefs.edit().putString(KEY_PODCASTS, gson.toJson(episodes)).apply()
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
        private const val KEY_PODCASTS = "podcast_catalog"
        private const val MAX_RECENT = 40
    }
}
