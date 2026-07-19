package com.imediac.islammediacentral.ui

import android.content.ComponentName
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.annotation.OptIn
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import com.imediac.islammediacentral.IslamMediaApp
import com.imediac.islammediacentral.R
import com.imediac.islammediacentral.data.MediaCategory
import com.imediac.islammediacentral.data.MediaIds
import com.imediac.islammediacentral.databinding.ActivityMainBinding
import com.imediac.islammediacentral.media.PlaybackService

/**
 * Thin phone UI that drives the same MediaLibraryService / ExoPlayer used by Android Auto.
 * Existing login / Supabase flows in the web app remain unchanged — this is additive.
 */
@OptIn(UnstableApi::class)
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller: MediaController? = null

    private val playerListener = object : Player.Listener {
        override fun onEvents(player: Player, events: Player.Events) {
            updateNowPlaying()
            updateLastPlayedHint()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnResumeLast.setOnClickListener { resumeLastPlayed() }
        binding.btnPlayRadio.setOnClickListener {
            playMediaId(MediaIds.radio("imc_live"))
        }
        binding.btnPlayQuran.setOnClickListener {
            playMediaId(MediaIds.surah("alafasy", 1))
        }
        binding.btnPlayPause.setOnClickListener {
            val c = controller ?: return@setOnClickListener
            if (c.isPlaying) c.pause() else c.play()
        }

        updateLastPlayedHint()
        handleVoiceIntent(intent)
    }

    override fun onStart() {
        super.onStart()
        val sessionToken = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        controllerFuture = MediaController.Builder(this, sessionToken).buildAsync()
        controllerFuture?.addListener({
            controller = controllerFuture?.get()
            controller?.addListener(playerListener)
            updateNowPlaying()
            updateLastPlayedHint()
            handleVoiceIntent(intent)
        }, MoreExecutors.directExecutor())
    }

    override fun onStop() {
        controller?.removeListener(playerListener)
        controllerFuture?.let { MediaController.releaseFuture(it) }
        controller = null
        super.onStop()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleVoiceIntent(intent)
    }

    private fun handleVoiceIntent(intent: Intent?) {
        if (intent == null) return
        when (intent.action) {
            Intent.ACTION_MEDIA_BUTTON,
            "android.media.action.MEDIA_PLAY_FROM_SEARCH" -> {
                val query = intent.getStringExtra(android.app.SearchManager.QUERY).orEmpty()
                startService(
                    Intent(this, PlaybackService::class.java).apply {
                        action = "android.media.action.MEDIA_PLAY_FROM_SEARCH"
                        putExtra(android.app.SearchManager.QUERY, query)
                    }
                )
            }
        }
    }

    private fun resumeLastPlayed() {
        val last = IslamMediaApp.instance.mediaPreferences.getLastPlayed()
        if (last == null) {
            Toast.makeText(this, R.string.toast_nothing_to_resume, Toast.LENGTH_SHORT).show()
            return
        }
        Toast.makeText(this, R.string.toast_resuming, Toast.LENGTH_SHORT).show()
        val c = controller
        if (c == null) {
            startService(
                Intent(this, PlaybackService::class.java).apply {
                    action = PlaybackService.ACTION_RESUME_LAST
                }
            )
            return
        }
        // Prefer the Continue Listening shortcut so resume position extras are applied
        val item = MediaItem.Builder().setMediaId(MediaIds.CONTINUE_LISTENING).build()
        c.setMediaItem(item)
        c.prepare()
        c.play()
    }

    private fun playMediaId(mediaId: String) {
        val c = controller
        if (c == null) {
            startService(
                Intent(this, PlaybackService::class.java).apply {
                    action = PlaybackService.ACTION_PLAY_MEDIA_ID
                    putExtra(PlaybackService.EXTRA_MEDIA_ID, mediaId)
                }
            )
            Toast.makeText(this, "Starting playback…", Toast.LENGTH_SHORT).show()
            return
        }
        val item = MediaItem.Builder().setMediaId(mediaId).build()
        c.setMediaItem(item)
        c.prepare()
        c.play()
    }

    private fun updateNowPlaying() {
        val c = controller
        val title = c?.mediaMetadata?.title?.toString()
        val artist = c?.mediaMetadata?.artist?.toString()
        binding.nowPlaying.text = when {
            title.isNullOrBlank() -> getString(R.string.status_idle)
            c?.isPlaying == true -> "Playing: $title${if (!artist.isNullOrBlank()) " — $artist" else ""}"
            else -> "Paused: $title"
        }
    }

    private fun updateLastPlayedHint() {
        val last = IslamMediaApp.instance.mediaPreferences.getLastPlayed()
        if (last == null) {
            binding.lastPlayedHint.text = getString(R.string.empty_continue_listening)
            binding.btnResumeLast.isEnabled = false
            return
        }
        binding.btnResumeLast.isEnabled = true
        val type = when (last.category) {
            MediaCategory.RADIO -> "Live Radio"
            MediaCategory.QURAN -> "Quran"
            MediaCategory.PODCAST -> "Podcast"
            MediaCategory.LECTURE -> "Lecture"
            else -> "Audio"
        }
        val position = IslamMediaApp.instance.mediaPreferences.getPlaybackPosition(last.mediaId)
        val positionHint = if (position > 0L) {
            val totalSec = position / 1000
            val min = totalSec / 60
            val sec = totalSec % 60
            " · at %d:%02d".format(min, sec)
        } else {
            ""
        }
        binding.lastPlayedHint.text = getString(
            R.string.continue_listening_subtitle
        ) + ": $type — ${last.title}$positionHint"
    }
}
