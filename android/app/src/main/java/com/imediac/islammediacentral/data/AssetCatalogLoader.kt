package com.imediac.islammediacentral.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Loads bundled stream catalogs shipped from:
 * - https://traet2lhw4m4.vercel.app/ (live radio, Quran radio, talks)
 * - https://create-me-a-audio.vercel.app/ (Islamic Audio Library seed)
 *
 * Public URLs — anyone with the app can play them offline of the sync.
 */
object AssetCatalogLoader {

    private val gson = Gson()

    fun loadLiveStations(context: Context): List<RadioStation> =
        readList(context, "imc_live_stations.json")

    fun loadQuranRadioStreams(context: Context): List<RadioStation> =
        readList(context, "quran_radio_streams.json")

    fun loadTalks(context: Context): List<PodcastEpisode> =
        readList(context, "imc_talks.json")

    fun loadAudioLibrarySeed(context: Context): List<PodcastEpisode> =
        readList(context, "audio_library_seed.json")

    private inline fun <reified T> readList(context: Context, assetName: String): List<T> {
        return try {
            context.assets.open(assetName).bufferedReader().use { reader ->
                val type = object : TypeToken<List<T>>() {}.type
                gson.fromJson(reader, type) ?: emptyList()
            }
        } catch (_: Exception) {
            emptyList()
        }
    }
}
