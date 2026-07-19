package com.imediac.islammediacentral.voice

import android.content.Context
import android.content.Intent
import com.imediac.islammediacentral.media.PlaybackService

/**
 * Helper for launching playback from Assistant / deep links without duplicating resolve logic.
 */
object AssistantPlayback {
    fun playFromSearch(context: Context, query: String) {
        context.startService(
            Intent(context, PlaybackService::class.java).apply {
                action = "android.media.action.MEDIA_PLAY_FROM_SEARCH"
                putExtra(android.app.SearchManager.QUERY, query)
            }
        )
    }
}
