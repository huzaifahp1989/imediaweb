package com.imediac.islammediacentral.voice

import androidx.media3.common.MediaItem
import com.imediac.islammediacentral.media.MediaItemTree

/**
 * Maps Google Assistant / voice queries to playable MediaItems.
 *
 * Supported examples:
 * - "Play Islam Media Central"
 * - "Play Quran"
 * - "Play Radio"
 */
class VoiceQueryHelper(
    private val mediaTree: MediaItemTree
) {
    fun resolve(query: String): MediaItem? = mediaTree.resolveVoiceQuery(query)
}
