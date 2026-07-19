package com.imediac.islammediacentral.data

import com.imediac.islammediacentral.BuildConfig

/**
 * Catalog shared with Android Auto.
 * Radio + Quran sources align with the Islam Media Central web app
 * (Layout.jsx radioUrl, FullQuran.jsx reciters, AudioNew.jsx categories).
 */
object MediaCatalog {

    val radioStations: List<RadioStation> = listOf(
        RadioStation(
            id = "imc_live",
            name = "Islam Media Central Live",
            description = "Islamic Radio 24/7",
            streamUrl = BuildConfig.DEFAULT_RADIO_URL,
            artworkUrl = null
        ),
        RadioStation(
            id = "mp3quran_main",
            name = "MP3 Quran Radio",
            description = "Continuous Quran recitation",
            streamUrl = "https://backup.qurango.net/radio/tarateel",
            artworkUrl = null
        ),
        RadioStation(
            id = "mp3quran_alafasy",
            name = "Quran Radio · Alafasy",
            description = "Mishary Rashid Alafasy stream",
            streamUrl = "https://backup.qurango.net/radio/mishary_alafasy",
            artworkUrl = null
        ),
        RadioStation(
            id = "mp3quran_sudais",
            name = "Quran Radio · As-Sudais",
            description = "Abdur-Rahman As-Sudais stream",
            streamUrl = "https://backup.qurango.net/radio/abdulrahman_alsudaes",
            artworkUrl = null
        ),
        RadioStation(
            id = "mp3quran_husary",
            name = "Quran Radio · Al-Husary",
            description = "Mahmoud Khalil Al-Husary stream",
            streamUrl = "https://backup.qurango.net/radio/mahmoud_khalil_al_hussary",
            artworkUrl = null
        )
    )

    val reciters: List<QuranReciter> = listOf(
        QuranReciter(
            id = "alafasy",
            name = "Mishary Rashid Alafasy",
            baseUrl = "https://server8.mp3quran.net/afs/"
        ),
        QuranReciter(
            id = "sudais",
            name = "Abdur-Rahman As-Sudais",
            baseUrl = "https://server11.mp3quran.net/sds/"
        ),
        QuranReciter(
            id = "basit",
            name = "Abdul Basit",
            baseUrl = "https://server7.mp3quran.net/basit/"
        ),
        QuranReciter(
            id = "husary",
            name = "Mahmoud Khalil Al-Husary",
            baseUrl = "https://server13.mp3quran.net/husr/"
        )
    )

    /** Popular surahs mirrored from FullQuran.jsx + complete 1–114 helper. */
    val featuredSurahs: List<QuranSurah> = listOf(
        QuranSurah(1, "Al-Fatihah", "The Opening", 7),
        QuranSurah(2, "Al-Baqarah", "The Cow", 286),
        QuranSurah(18, "Al-Kahf", "The Cave", 110),
        QuranSurah(36, "Ya-Sin", "Ya-Sin", 83),
        QuranSurah(55, "Ar-Rahman", "The Beneficent", 78),
        QuranSurah(67, "Al-Mulk", "The Sovereignty", 30),
        QuranSurah(112, "Al-Ikhlas", "The Sincerity", 4),
        QuranSurah(113, "Al-Falaq", "The Daybreak", 5),
        QuranSurah(114, "An-Nas", "Mankind", 6)
    )

    val allSurahs: List<QuranSurah> = (1..114).map { n ->
        featuredSurahs.find { it.number == n }
            ?: QuranSurah(n, "Surah $n", "Surah $n", 0)
    }

    val podcastCategories: List<PodcastCategory> = listOf(
        PodcastCategory("story", "Stories", "Islamic stories for all ages"),
        PodcastCategory("hadith", "Hadith", "Prophetic traditions"),
        PodcastCategory("history", "History", "Islamic history lessons"),
        PodcastCategory("nasheed", "Nasheeds", "Vocal Islamic songs"),
        PodcastCategory("tajweed", "Tajweed", "Quranic pronunciation"),
        PodcastCategory("fiqh", "Fiqh", "Islamic jurisprudence basics"),
        PodcastCategory("quran", "Quran Lessons", "Tafsir and reflection")
    )

    /**
     * Seed podcast episodes using the same mp3quran CDN URLs featured on the web Multimedia page.
     * Replace / extend via [MediaPreferences.importPodcastCatalog] when syncing Base44 AudioContent.
     */
    val seedPodcasts: List<PodcastEpisode> = listOf(
        PodcastEpisode(
            id = "quran_fatiha",
            categoryId = "quran",
            title = "Surah Al-Fatihah",
            description = "Mishary Rashid Alafasy",
            streamUrl = "https://server8.mp3quran.net/afs/001.mp3"
        ),
        PodcastEpisode(
            id = "quran_yasin",
            categoryId = "quran",
            title = "Surah Ya-Sin",
            description = "Mishary Rashid Alafasy",
            streamUrl = "https://server8.mp3quran.net/afs/036.mp3"
        ),
        PodcastEpisode(
            id = "quran_mulk",
            categoryId = "quran",
            title = "Surah Al-Mulk",
            description = "Mishary Rashid Alafasy",
            streamUrl = "https://server8.mp3quran.net/afs/067.mp3"
        ),
        PodcastEpisode(
            id = "quran_rahman",
            categoryId = "quran",
            title = "Surah Ar-Rahman",
            description = "Mishary Rashid Alafasy",
            streamUrl = "https://server8.mp3quran.net/afs/055.mp3"
        ),
        PodcastEpisode(
            id = "quran_kahf",
            categoryId = "quran",
            title = "Surah Al-Kahf",
            description = "Mishary Rashid Alafasy",
            streamUrl = "https://server8.mp3quran.net/afs/018.mp3"
        ),
        PodcastEpisode(
            id = "story_intro",
            categoryId = "story",
            title = "Stories of the Prophets · Intro",
            description = "Sample story episode — replace with AudioContent feed",
            streamUrl = "https://server8.mp3quran.net/afs/001.mp3"
        ),
        PodcastEpisode(
            id = "hadith_sample",
            categoryId = "hadith",
            title = "Hadith of the Day",
            description = "Sample hadith episode — replace with AudioContent feed",
            streamUrl = "https://server8.mp3quran.net/afs/112.mp3"
        ),
        PodcastEpisode(
            id = "tajweed_basics",
            categoryId = "tajweed",
            title = "Tajweed Basics",
            description = "Sample tajweed lesson",
            streamUrl = "https://server8.mp3quran.net/afs/113.mp3"
        )
    )

    fun surahUrl(reciter: QuranReciter, surahNumber: Int): String {
        val padded = surahNumber.toString().padStart(3, '0')
        return "${reciter.baseUrl}$padded.mp3"
    }

    fun resolvePlayable(mediaId: String, podcasts: List<PodcastEpisode> = seedPodcasts): PlayableMedia? {
        when {
            mediaId.startsWith("radio:") -> {
                val id = mediaId.removePrefix("radio:")
                val station = radioStations.find { it.id == id } ?: return null
                return PlayableMedia(
                    mediaId = mediaId,
                    title = station.name,
                    subtitle = station.description,
                    streamUrl = station.streamUrl,
                    artworkUrl = station.artworkUrl,
                    isLive = true,
                    category = MediaCategory.RADIO
                )
            }
            mediaId.startsWith("surah:") -> {
                val parts = mediaId.split(":")
                if (parts.size < 3) return null
                val reciterId = parts[1]
                val number = parts[2].toIntOrNull() ?: return null
                val reciter = reciters.find { it.id == reciterId } ?: return null
                val surah = allSurahs.find { it.number == number } ?: return null
                return PlayableMedia(
                    mediaId = mediaId,
                    title = "${surah.name} · ${reciter.name}",
                    subtitle = surah.englishName,
                    streamUrl = surahUrl(reciter, number),
                    artworkUrl = reciter.artworkUrl,
                    isLive = false,
                    category = MediaCategory.QURAN
                )
            }
            mediaId.startsWith("podcast:") -> {
                val id = mediaId.removePrefix("podcast:")
                val episode = podcasts.find { it.id == id } ?: return null
                return PlayableMedia(
                    mediaId = mediaId,
                    title = episode.title,
                    subtitle = episode.description,
                    streamUrl = episode.streamUrl,
                    artworkUrl = episode.artworkUrl,
                    isLive = false,
                    category = MediaCategory.PODCAST
                )
            }
        }
        return null
    }
}
