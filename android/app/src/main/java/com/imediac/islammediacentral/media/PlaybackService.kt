package com.imediac.islammediacentral.media

import android.app.PendingIntent
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionError
import androidx.media3.session.SessionResult
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import com.imediac.islammediacentral.IslamMediaApp
import com.imediac.islammediacentral.data.MediaCatalog
import com.imediac.islammediacentral.data.MediaIds
import com.imediac.islammediacentral.data.PlayableMedia
import com.imediac.islammediacentral.ui.MainActivity
import com.imediac.islammediacentral.voice.VoiceQueryHelper

/**
 * MediaLibraryService that exposes the Islam Media Central browse tree to Android Auto
 * and hosts ExoPlayer + MediaSession for playback, notifications, and Assistant.
 */
@OptIn(UnstableApi::class)
class PlaybackService : MediaLibraryService() {

    private var player: ExoPlayer? = null
    private var mediaLibrarySession: MediaLibrarySession? = null
    private lateinit var mediaTree: MediaItemTree
    private lateinit var voiceHelper: VoiceQueryHelper
    private lateinit var packageValidator: PackageValidator

    private val playerListener = object : Player.Listener {
        override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
            mediaItem?.let { recordRecent(it) }
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            if (!isPlaying) persistCurrentPosition()
        }

        override fun onPlaybackStateChanged(playbackState: Int) {
            if (playbackState == Player.STATE_ENDED) {
                val id = player?.currentMediaItem?.mediaId ?: return
                IslamMediaApp.instance.mediaPreferences.clearPlaybackPosition(id)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        val prefs = IslamMediaApp.instance.mediaPreferences
        mediaTree = MediaItemTree(this, prefs)
        voiceHelper = VoiceQueryHelper(mediaTree)
        packageValidator = PackageValidator(this)

        val exoPlayer = ExoPlayer.Builder(this)
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(C.USAGE_MEDIA)
                    .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
                    .build(),
                /* handleAudioFocus = */ true
            )
            .setHandleAudioBecomingNoisy(true)
            .setWakeMode(C.WAKE_MODE_NETWORK)
            .build()
            .also { it.addListener(playerListener) }

        player = exoPlayer

        val sessionActivity = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        mediaLibrarySession = MediaLibrarySession.Builder(this, exoPlayer, LibrarySessionCallback())
            .setId("imc_media_session")
            .setSessionActivity(sessionActivity)
            .build()

        Log.i(TAG, "MediaLibraryService ready for Android Auto browse + playback")
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? {
        // Always expose the session so Auto / Assistant can connect; authorization
        // for library browsing is enforced in the callback.
        return mediaLibrarySession
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        val p = player
        if (p == null || !p.playWhenReady || p.mediaItemCount == 0) {
            stopSelf()
        }
    }

    override fun onDestroy() {
        persistCurrentPosition()
        mediaLibrarySession?.run {
            release()
            mediaLibrarySession = null
        }
        player?.run {
            removeListener(playerListener)
            release()
            player = null
        }
        super.onDestroy()
    }

    private fun persistCurrentPosition() {
        val p = player ?: return
        val mediaId = p.currentMediaItem?.mediaId ?: return
        if (p.duration > 0 && p.currentPosition > 0) {
            IslamMediaApp.instance.mediaPreferences.savePlaybackPosition(mediaId, p.currentPosition)
        }
    }

    private fun recordRecent(mediaItem: MediaItem) {
        val playable = MediaCatalog.resolvePlayable(
            mediaItem.mediaId,
            IslamMediaApp.instance.mediaPreferences.getPodcastEpisodes()
        ) ?: PlayableMedia(
            mediaId = mediaItem.mediaId,
            title = mediaItem.mediaMetadata.title?.toString() ?: "Islam Media Central",
            subtitle = mediaItem.mediaMetadata.artist?.toString() ?: "",
            streamUrl = mediaItem.localConfiguration?.uri?.toString()
                ?: mediaItem.requestMetadata.mediaUri?.toString().orEmpty()
        )
        IslamMediaApp.instance.mediaPreferences.recordPlayed(playable)
        mediaLibrarySession?.notifyChildrenChanged(
            MediaIds.RECENTLY_PLAYED,
            /* itemCount= */ Int.MAX_VALUE,
            /* params= */ null
        )
    }

    private fun playMediaId(mediaId: String, playWhenReady: Boolean = true): Boolean {
        val item = mediaTree.getItem(mediaId) ?: return false
        if (item.mediaMetadata.isPlayable != true) return false
        val p = player ?: return false
        val resume = item.mediaMetadata.extras
            ?.getLong(MediaItemTree.EXTRA_RESUME_POSITION, 0L)
            ?: IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(mediaId)

        p.setMediaItem(item, /* startPositionMs = */ if (resume > 0) resume else 0L)
        p.prepare()
        p.playWhenReady = playWhenReady
        return true
    }

    private inner class LibrarySessionCallback : MediaLibrarySession.Callback {

        private val customFavorite = SessionCommand(COMMAND_TOGGLE_FAVORITE, Bundle.EMPTY)

        override fun onConnect(
            session: MediaSession,
            controller: MediaSession.ControllerInfo
        ): MediaSession.ConnectionResult {
            if (!packageValidator.isAllowed(controller.packageName, controller.uid)) {
                Log.w(TAG, "Rejecting media session connection from ${controller.packageName}")
                return MediaSession.ConnectionResult.reject()
            }
            val sessionCommands = MediaSession.ConnectionResult.DEFAULT_SESSION_AND_LIBRARY_COMMANDS
                .buildUpon()
                .add(customFavorite)
                .add(SessionCommand(COMMAND_STOP, Bundle.EMPTY))
                .build()
            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailableSessionCommands(sessionCommands)
                .build()
        }

        override fun onGetLibraryRoot(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<MediaItem>> {
            if (!packageValidator.isAllowed(browser.packageName, browser.uid)) {
                Log.w(TAG, "Denying library root to ${browser.packageName}")
                return Futures.immediateFuture(LibraryResult.ofError(SessionError.ERROR_NOT_SUPPORTED))
            }
            // Auto "continue listening" requests a recent root
            val root = if (params?.isRecent == true) {
                mediaTree.getRecentRootItem()
            } else {
                mediaTree.getRootItem()
            }
            val responseParams = mediaTree.buildRootLibraryParams(params)
            Log.i(TAG, "Serving library root=${root.mediaId} to ${browser.packageName}")
            return Futures.immediateFuture(LibraryResult.ofItem(root, responseParams))
        }

        override fun onGetChildren(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            parentId: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
            // Android Auto does not paginate — return the full child list.
            val children = mediaTree.getChildren(parentId)
            Log.d(TAG, "onGetChildren parent=$parentId count=${children.size} caller=${browser.packageName}")
            return Futures.immediateFuture(
                LibraryResult.ofItemList(ImmutableList.copyOf(children), params)
            )
        }

        override fun onGetItem(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            mediaId: String
        ): ListenableFuture<LibraryResult<MediaItem>> {
            val item = mediaTree.getItem(mediaId)
            return if (item != null) {
                Futures.immediateFuture(LibraryResult.ofItem(item, null))
            } else {
                Futures.immediateFuture(LibraryResult.ofError(SessionError.ERROR_BAD_VALUE))
            }
        }

        override fun onSubscribe(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            parentId: String,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<Void>> {
            // Acknowledge subscription so Auto receives notifyChildrenChanged updates.
            val children = mediaTree.getChildren(parentId)
            session.notifyChildrenChanged(browser, parentId, children.size, params)
            return Futures.immediateFuture(LibraryResult.ofVoid())
        }

        override fun onUnsubscribe(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            parentId: String
        ): ListenableFuture<LibraryResult<Void>> {
            return Futures.immediateFuture(LibraryResult.ofVoid())
        }

        override fun onSearch(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            query: String,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<Void>> {
            val results = mediaTree.search(query)
            session.notifySearchResultChanged(browser, query, results.size, params)
            return Futures.immediateFuture(LibraryResult.ofVoid())
        }

        override fun onGetSearchResult(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            query: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
            val results = mediaTree.search(query)
            return Futures.immediateFuture(
                LibraryResult.ofItemList(ImmutableList.copyOf(results), params)
            )
        }

        override fun onSetMediaItems(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo,
            mediaItems: MutableList<MediaItem>,
            startIndex: Int,
            startPositionMs: Long
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val resolved = mediaItems.map { item ->
                if (item.localConfiguration != null) item
                else mediaTree.getItem(item.mediaId) ?: item
            }
            val firstId = resolved.getOrNull(startIndex)?.mediaId
            val resume = if (startPositionMs == C.TIME_UNSET && firstId != null) {
                IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(firstId)
            } else {
                startPositionMs
            }
            return Futures.immediateFuture(
                MediaSession.MediaItemsWithStartPosition(resolved, startIndex, resume)
            )
        }

        override fun onPlaybackResumption(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val recent = IslamMediaApp.instance.mediaPreferences.getRecentlyPlayed().firstOrNull()
            val item = recent?.let { mediaTree.toPlayableMediaItem(it) }
                ?: mediaTree.getItem(MediaIds.radio("imc_live"))
                ?: mediaTree.getRootItem()
            val position = recent?.let {
                IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(it.mediaId)
            } ?: 0L
            return Futures.immediateFuture(
                MediaSession.MediaItemsWithStartPosition(listOf(item), 0, position)
            )
        }

        override fun onCustomCommand(
            session: MediaSession,
            controller: MediaSession.ControllerInfo,
            customCommand: SessionCommand,
            args: Bundle
        ): ListenableFuture<SessionResult> {
            when (customCommand.customAction) {
                COMMAND_TOGGLE_FAVORITE -> {
                    val mediaId = player?.currentMediaItem?.mediaId
                        ?: args.getString(EXTRA_MEDIA_ID)
                    if (mediaId != null) {
                        IslamMediaApp.instance.mediaPreferences.toggleFavorite(mediaId)
                        mediaLibrarySession?.notifyChildrenChanged(
                            MediaIds.FAVORITES,
                            Int.MAX_VALUE,
                            null
                        )
                    }
                    return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
                COMMAND_STOP -> {
                    player?.stop()
                    player?.clearMediaItems()
                    return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
            }
            return Futures.immediateFuture(SessionResult(SessionResult.RESULT_ERROR_NOT_SUPPORTED))
        }

        @Deprecated("Deprecated in Media3; kept for Auto / Assistant compatibility")
        override fun onPlayerCommandRequest(
            session: MediaSession,
            controller: MediaSession.ControllerInfo,
            playerCommand: Int
        ): Int = SessionResult.RESULT_SUCCESS
    }

    companion object {
        private const val TAG = "ImcPlaybackService"
        const val COMMAND_TOGGLE_FAVORITE = "imc.toggle_favorite"
        const val COMMAND_STOP = "imc.stop"
        const val EXTRA_MEDIA_ID = "media_id"
        const val ACTION_PLAY_MEDIA_ID = "com.imediac.islammediacentral.action.PLAY_MEDIA_ID"
        const val ACTION_PLAY_FROM_SEARCH = "com.imediac.islammediacentral.action.PLAY_FROM_SEARCH"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PLAY_MEDIA_ID -> {
                val mediaId = intent.getStringExtra(EXTRA_MEDIA_ID)
                if (mediaId != null) playMediaId(mediaId)
            }
            Intent.ACTION_SEARCH, "android.media.action.MEDIA_PLAY_FROM_SEARCH" -> {
                val query = intent.getStringExtra(android.app.SearchManager.QUERY).orEmpty()
                val item = voiceHelper.resolve(query)
                if (item != null) playMediaId(item.mediaId)
            }
        }
        return super.onStartCommand(intent, flags, startId)
    }
}
