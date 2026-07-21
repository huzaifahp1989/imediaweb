package com.imediac.islammediacentral.voice

import androidx.media3.common.MediaItem
import com.imediac.islammediacentral.media.MediaItemTree

/**
 * Maps Google Assistant / Android Auto voice queries to playable [MediaItem]s.
 *
 * Examples:
 * - "Play Islam Media Central"
 * - "Play Radio Seerah"
 * - "Play Quran"
 * - "Play Nasheed"
 * - "Continue listening"
 */
class VoiceQueryHelper(
    private val mediaTree: MediaItemTree
) {
    fun resolve(query: String): MediaItem? = mediaTree.resolveVoiceQuery(query)

    fun resolvePlayableQueue(query: String): Pair<List<MediaItem>, Int>? {
        val hit = resolve(query) ?: return null
        return mediaTree.buildQueueAround(hit.mediaId)
    }
}
