package com.imediac.islammediacentral.media

import android.app.PendingIntent
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
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
 *
 * Continue Listening: last-played item is persisted automatically and restored with position
 * (podcasts / Quran / lectures) or by reconnecting the last live radio station.
 * When Android Auto disconnects mid-playback, the next Auto connection auto-resumes.
 */
@OptIn(UnstableApi::class)
class PlaybackService : MediaLibraryService() {

    private var player: ExoPlayer? = null
    private var mediaLibrarySession: MediaLibrarySession? = null
    private lateinit var mediaTree: MediaItemTree
    private lateinit var voiceHelper: VoiceQueryHelper
    private lateinit var packageValidator: PackageValidator

    private val mainHandler = Handler(Looper.getMainLooper())
    private val positionPersistRunnable = object : Runnable {
        override fun run() {
            persistCurrentPosition()
            if (player?.isPlaying == true) {
                mainHandler.postDelayed(this, POSITION_SAVE_INTERVAL_MS)
            }
        }
    }

    private val playerListener = object : Player.Listener {
        override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
            mediaItem?.let { recordRecent(it) }
            notifyContinueListeningChanged()
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            if (!isPlaying) {
                persistCurrentPosition()
                mainHandler.removeCallbacks(positionPersistRunnable)
            } else {
                mainHandler.removeCallbacks(positionPersistRunnable)
                mainHandler.postDelayed(positionPersistRunnable, POSITION_SAVE_INTERVAL_MS)
            }
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
        mainHandler.removeCallbacks(positionPersistRunnable)
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
        val resolvedId = resolveMediaId(mediaId)
        if (p.currentPosition > 0) {
            IslamMediaApp.instance.mediaPreferences.savePlaybackPosition(resolvedId, p.currentPosition)
        }
    }

    private fun resolveMediaId(mediaId: String): String {
        if (mediaId != MediaIds.CONTINUE_LISTENING) return mediaId
        return mediaTree.resolveContinueListening()?.mediaId ?: mediaId
    }

    private fun recordRecent(mediaItem: MediaItem) {
        val mediaId = resolveMediaId(mediaItem.mediaId)
        if (mediaId == MediaIds.CONTINUE_LISTENING || mediaId == MediaIds.ROOT) return
        val playable = MediaCatalog.resolvePlayable(
            mediaId,
            IslamMediaApp.instance.mediaPreferences.getPodcastEpisodes(),
            IslamMediaApp.instance.mediaPreferences.getLectures()
        ) ?: PlayableMedia(
            mediaId = mediaId,
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
        notifyContinueListeningChanged()
    }

    private fun notifyContinueListeningChanged() {
        mediaLibrarySession?.notifyChildrenChanged(
            MediaIds.ROOT,
            /* itemCount= */ Int.MAX_VALUE,
            /* params= */ null
        )
        mediaLibrarySession?.notifyChildrenChanged(
            MediaIds.CONTINUE_LISTENING,
            /* itemCount= */ Int.MAX_VALUE,
            /* params= */ null
        )
    }

    private fun playMediaId(mediaId: String, playWhenReady: Boolean = true): Boolean {
        val resolvedId = if (mediaId == MediaIds.CONTINUE_LISTENING) {
            mediaTree.resolveContinueListening()?.mediaId ?: return false
        } else {
            mediaId
        }
        val item = mediaTree.getItem(resolvedId) ?: return false
        if (item.mediaMetadata.isPlayable != true) return false
        val p = player ?: return false
        val resume = if (MediaIds.supportsResumePosition(resolvedId)) {
            item.mediaMetadata.extras
                ?.getLong(MediaItemTree.EXTRA_RESUME_POSITION, 0L)
                ?.takeIf { it > 0L }
                ?: IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(resolvedId)
        } else {
            0L
        }

        p.setMediaItem(item, /* startPositionMs = */ resume)
        p.prepare()
        p.playWhenReady = playWhenReady
        return true
    }

    /** Resume last played content (radio reconnect or position restore). */
    fun resumeLastPlayed(playWhenReady: Boolean = true): Boolean {
        val last = mediaTree.resolveContinueListening() ?: return false
        return playMediaId(last.mediaId, playWhenReady)
    }

    private fun maybeAutoResumeAfterAutoReconnect(controller: MediaSession.ControllerInfo) {
        if (!packageValidator.isAndroidAutoPackage(controller.packageName)) return
        val prefs = IslamMediaApp.instance.mediaPreferences
        if (!prefs.consumePendingAutoResume()) return
        mainHandler.post {
            val p = player
            if (p != null && p.isPlaying) {
                Log.i(TAG, "Skipping Auto reconnect resume — already playing")
                return@post
            }
            val resumed = resumeLastPlayed(playWhenReady = true)
            Log.i(TAG, "Android Auto reconnected — auto-resume last played success=$resumed")
        }
    }

    private fun markPendingAutoResumeIfNeeded(controller: MediaSession.ControllerInfo) {
        if (!packageValidator.isAndroidAutoPackage(controller.packageName)) return
        val p = player ?: return
        val hadContent = p.mediaItemCount > 0 && p.currentMediaItem != null
        val wasActive = p.isPlaying || p.playWhenReady
        if (!hadContent || !wasActive) return
        persistCurrentPosition()
        IslamMediaApp.instance.mediaPreferences.setPendingAutoResume(true)
        Log.i(TAG, "Android Auto disconnected during playback — will auto-resume on reconnect")
    }

    private inner class LibrarySessionCallback : MediaLibrarySession.Callback {

        private val customFavorite = SessionCommand(COMMAND_TOGGLE_FAVORITE, Bundle.EMPTY)
        private val customResumeLast = SessionCommand(COMMAND_RESUME_LAST, Bundle.EMPTY)

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
                .add(customResumeLast)
                .add(SessionCommand(COMMAND_STOP, Bundle.EMPTY))
                .build()
            maybeAutoResumeAfterAutoReconnect(controller)
            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailableSessionCommands(sessionCommands)
                .build()
        }

        override fun onDisconnected(
            session: MediaSession,
            controller: MediaSession.ControllerInfo
        ) {
            markPendingAutoResumeIfNeeded(controller)
            super.onDisconnected(session, controller)
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
            // Auto "continue listening" / recent root
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
                when {
                    item.mediaId == MediaIds.CONTINUE_LISTENING -> {
                        val last = mediaTree.resolveContinueListening()
                        if (last != null) {
                            mediaTree.toPlayableMediaItem(last, mediaTree.resumePositionMs(last.mediaId))
                        } else if (item.localConfiguration != null) {
                            item
                        } else {
                            mediaTree.getItem(item.mediaId) ?: item
                        }
                    }
                    item.localConfiguration != null -> item
                    else -> mediaTree.getItem(item.mediaId) ?: item
                }
            }
            val firstId = resolved.getOrNull(startIndex)?.mediaId
            val resume = when {
                startPositionMs != C.TIME_UNSET -> startPositionMs
                firstId != null && MediaIds.supportsResumePosition(firstId) ->
                    IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(firstId)
                else -> 0L
            }
            return Futures.immediateFuture(
                MediaSession.MediaItemsWithStartPosition(resolved, startIndex, resume)
            )
        }

        override fun onPlaybackResumption(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val recent = mediaTree.resolveContinueListening()
            val item = recent?.let {
                mediaTree.toPlayableMediaItem(
                    it,
                    if (it.isLive) 0L
                    else IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(it.mediaId)
                )
            } ?: mediaTree.getItem(MediaIds.radio("imc_live"))
                ?: mediaTree.getRootItem()
            val position = recent?.let {
                if (it.isLive) 0L
                else IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(it.mediaId)
            } ?: 0L
            // Clear pending flag — system resumption fulfills the Auto reconnect contract
            IslamMediaApp.instance.mediaPreferences.setPendingAutoResume(false)
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
                        val resolved = resolveMediaId(mediaId)
                        IslamMediaApp.instance.mediaPreferences.toggleFavorite(resolved)
                        mediaLibrarySession?.notifyChildrenChanged(
                            MediaIds.FAVORITES,
                            Int.MAX_VALUE,
                            null
                        )
                    }
                    return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
                }
                COMMAND_RESUME_LAST -> {
                    val ok = resumeLastPlayed(playWhenReady = true)
                    return Futures.immediateFuture(
                        SessionResult(
                            if (ok) SessionResult.RESULT_SUCCESS
                            else SessionResult.RESULT_ERROR_NOT_SUPPORTED
                        )
                    )
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
        private const val POSITION_SAVE_INTERVAL_MS = 15_000L
        const val COMMAND_TOGGLE_FAVORITE = "imc.toggle_favorite"
        const val COMMAND_RESUME_LAST = "imc.resume_last"
        const val COMMAND_STOP = "imc.stop"
        const val EXTRA_MEDIA_ID = "media_id"
        const val ACTION_PLAY_MEDIA_ID = "com.imediac.islammediacentral.action.PLAY_MEDIA_ID"
        const val ACTION_RESUME_LAST = "com.imediac.islammediacentral.action.RESUME_LAST"
        const val ACTION_PLAY_FROM_SEARCH = "com.imediac.islammediacentral.action.PLAY_FROM_SEARCH"
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PLAY_MEDIA_ID -> {
                val mediaId = intent.getStringExtra(EXTRA_MEDIA_ID)
                if (mediaId != null) playMediaId(mediaId)
            }
            ACTION_RESUME_LAST -> {
                resumeLastPlayed(playWhenReady = true)
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
