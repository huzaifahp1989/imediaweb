package com.imediac.islammediacentral.data

import android.content.Context
import android.util.Log
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import com.imediac.islammediacentral.BuildConfig
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/**
 * Imports public stream catalogs into [MediaPreferences] for Android Auto.
 *
 * Sources (public / anonymous):
 * - create-me-a-audio.vercel.app → Supabase `podcasts` (approved)
 * - traet2lhw4m4.vercel.app → bundled assets (live radio, Quran radio, talks)
 */
class MediaSyncRepository(
    private val context: Context,
    private val preferences: MediaPreferences
) {

    private val gson = Gson()
    private val executor = Executors.newSingleThreadExecutor()

    /** Seed assets once, then refresh remote audio library when online. */
    fun syncPublicCatalogsAsync(onComplete: (() -> Unit)? = null) {
        executor.execute {
            try {
                seedFromAssetsIfNeeded()
                syncAudioLibraryFromSupabase()
                Log.i(TAG, "Public stream catalogs synced for Android Auto")
            } catch (e: Exception) {
                Log.w(TAG, "Catalog sync failed — using bundled seeds", e)
            } finally {
                onComplete?.invoke()
            }
        }
    }

    fun seedFromAssetsIfNeeded() {
        val liveFromSite = AssetCatalogLoader.loadLiveStations(context)
        val liveMerged = (liveFromSite + MediaCatalog.radioStations).distinctBy { it.id }
        if (liveMerged.isNotEmpty()) {
            preferences.importLiveStations(liveMerged)
        }

        val quranRadio = AssetCatalogLoader.loadQuranRadioStreams(context)
        if (quranRadio.isNotEmpty()) {
            preferences.importQuranRadioStreams(quranRadio)
        }

        val talks = AssetCatalogLoader.loadTalks(context)
        if (talks.isNotEmpty()) {
            preferences.importLectureCatalog(talks)
        }

        // Bundled create-me-a-audio library until remote Supabase sync refreshes it
        val seed = AssetCatalogLoader.loadAudioLibrarySeed(context)
        if (seed.isNotEmpty() && preferences.getPodcastEpisodes().size < seed.size) {
            preferences.importPodcastCatalog(seed)
        }
    }

    fun applyRemoteFavorites(mediaIds: Collection<String>) {
        preferences.mergeFavoriteIds(mediaIds)
    }

    fun applyRemotePodcasts(episodes: List<PodcastEpisode>) {
        preferences.importPodcastCatalog(episodes)
    }

    fun applyRemoteLectures(lectures: List<PodcastEpisode>) {
        preferences.importLectureCatalog(lectures)
    }

    /**
     * Pulls approved public tracks from the Islamic Audio Library Supabase project
     * (same backend as https://create-me-a-audio.vercel.app/).
     */
    fun syncAudioLibraryFromSupabase(): Int {
        val base = BuildConfig.AUDIO_LIBRARY_SUPABASE_URL.trimEnd('/')
        val key = BuildConfig.AUDIO_LIBRARY_SUPABASE_ANON_KEY
        if (base.isBlank() || key.isBlank()) return 0

        val endpoint =
            "$base/rest/v1/podcasts?select=*&status=eq.approved&order=created_date.desc&limit=500"
        val conn = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            connectTimeout = 12_000
            readTimeout = 20_000
            setRequestProperty("apikey", key)
            setRequestProperty("Authorization", "Bearer $key")
            setRequestProperty("Accept", "application/json")
        }
        try {
            if (conn.responseCode !in 200..299) {
                Log.w(TAG, "Supabase podcasts HTTP ${conn.responseCode}")
                return 0
            }
            val body = conn.inputStream.bufferedReader().use { it.readText() }
            val rows = gson.fromJson(body, Array<AudioLibraryRow>::class.java)?.toList().orEmpty()
            val episodes = rows.mapNotNull { it.toEpisode() }
            if (episodes.isNotEmpty()) {
                preferences.importPodcastCatalog(episodes)
            }
            return episodes.size
        } finally {
            conn.disconnect()
        }
    }

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

    fun mapLectureRow(row: Map<String, Any?>): PodcastEpisode? {
        val mapped = mapAudioContentRow(row) ?: return null
        return mapped.copy(categoryId = "lecture")
    }

    private data class AudioLibraryRow(
        val id: String?,
        val title: String?,
        val description: String?,
        @SerializedName("audio_url") val audioUrl: String?,
        @SerializedName("host_name") val hostName: String?,
        val speaker: String?,
        val category: String?,
        val duration: Double?,
        @SerializedName("image_url") val imageUrl: String?,
        val status: String?
    ) {
        fun toEpisode(): PodcastEpisode? {
            val mediaUrl = audioUrl?.takeIf { it.isNotBlank() } ?: return null
            val id = id?.takeIf { it.isNotBlank() } ?: return null
            val catName = category?.trim().orEmpty().ifBlank { "General" }
            val catId = catName.lowercase()
                .replace(Regex("[^a-z0-9]+"), "-")
                .trim('-')
                .ifBlank { "general" }
            return PodcastEpisode(
                id = id,
                categoryId = catId,
                title = title?.takeIf { it.isNotBlank() } ?: "Untitled",
                description = (speaker ?: hostName ?: description ?: catName).take(160),
                streamUrl = mediaUrl,
                artworkUrl = imageUrl,
                durationMs = ((duration ?: 0.0) * 1000L).toLong()
            )
        }
    }

    companion object {
        private const val TAG = "ImcMediaSync"
    }
}
