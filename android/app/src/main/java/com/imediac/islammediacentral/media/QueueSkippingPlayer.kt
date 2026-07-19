package com.imediac.islammediacentral.media

import androidx.media3.common.ForwardingPlayer
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer

/**
 * Ensures Android Auto / notification / steering-wheel Next·Previous always skip to another
 * track when a playlist is loaded — including live radio (where in-item seek is a no-op).
 */
@UnstableApi
class QueueSkippingPlayer(
    private val exoPlayer: ExoPlayer
) : ForwardingPlayer(exoPlayer) {

    private fun canSkipTracks(): Boolean = mediaItemCount > 1

    override fun getAvailableCommands(): Player.Commands {
        val builder = super.getAvailableCommands().buildUpon()
        if (canSkipTracks()) {
            builder
                .add(Player.COMMAND_SEEK_TO_NEXT)
                .add(Player.COMMAND_SEEK_TO_PREVIOUS)
                .add(Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM)
                .add(Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM)
        }
        if (isCurrentMediaItemSeekable) {
            builder
                .add(Player.COMMAND_SEEK_BACK)
                .add(Player.COMMAND_SEEK_FORWARD)
                .add(Player.COMMAND_SEEK_IN_CURRENT_MEDIA_ITEM)
        }
        return builder.build()
    }

    override fun isCommandAvailable(command: @Player.Command Int): Boolean {
        return when (command) {
            Player.COMMAND_SEEK_TO_NEXT,
            Player.COMMAND_SEEK_TO_NEXT_MEDIA_ITEM -> canSkipTracks()
            Player.COMMAND_SEEK_TO_PREVIOUS,
            Player.COMMAND_SEEK_TO_PREVIOUS_MEDIA_ITEM ->
                canSkipTracks() ||
                    (isCurrentMediaItemSeekable && currentPosition > maxSeekToPreviousPosition)
            else -> super.isCommandAvailable(command)
        }
    }

    override fun hasNextMediaItem(): Boolean = canSkipTracks() || super.hasNextMediaItem()

    override fun hasPreviousMediaItem(): Boolean = canSkipTracks() || super.hasPreviousMediaItem()

    override fun seekToNext() {
        if (canSkipTracks()) {
            seekToNextMediaItem()
        } else if (isCurrentMediaItemSeekable) {
            super.seekToNext()
        }
    }

    override fun seekToPrevious() {
        when {
            // Live / unseekable: Previous must change station/track, not restart a live edge.
            canSkipTracks() && !isCurrentMediaItemSeekable -> seekToPreviousMediaItem()
            isCurrentMediaItemSeekable && currentPosition > maxSeekToPreviousPosition -> seekTo(0)
            canSkipTracks() -> seekToPreviousMediaItem()
            isCurrentMediaItemSeekable -> seekTo(0)
            else -> Unit
        }
    }

    override fun seekToNextMediaItem() {
        if (!canSkipTracks()) return
        val next = (currentMediaItemIndex + 1) % mediaItemCount
        exoPlayer.seekToDefaultPosition(next)
    }

    override fun seekToPreviousMediaItem() {
        if (!canSkipTracks()) {
            if (isCurrentMediaItemSeekable) seekTo(0)
            return
        }
        val prev = if (currentMediaItemIndex - 1 < 0) mediaItemCount - 1 else currentMediaItemIndex - 1
        exoPlayer.seekToDefaultPosition(prev)
    }
}
