import { Heart, ListPlus, Pause, Play } from 'lucide-react'
import { formatDuration } from '../lib/tracks'
import { CATEGORY_LABELS } from '../lib/categories'
import { usePlayer } from '../context/PlayerContext'
import { useLibraryExtras } from '../context/LibraryExtrasContext'

export default function TrackCard({ track, tracks }) {
  const { current, playing, playTrack, toggle } = usePlayer()
  const { isFavorite, toggleFavorite, addToPlaylist } = useLibraryExtras()
  const active = current?.id === track.id
  const fav = isFavorite(track.id)

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => (active ? toggle() : playTrack(track, tracks))}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow"
          aria-label={active && playing ? 'Pause' : 'Play'}
        >
          {active && playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900">{track.title}</h3>
          <p className="truncate text-sm text-slate-500">
            {track.reciter || 'Unknown'} · {CATEGORY_LABELS[track.category] || track.category}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {Number.isFinite(track.duration) && <span>{formatDuration(track.duration)}</span>}
            <span>{track.views || 0} plays</span>
            <span>{track.votes || 0} votes</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={() => toggleFavorite(track)}
            className={`rounded-lg p-2 ${fav ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:bg-slate-100'}`}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={() => addToPlaylist(track)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Add to playlist"
          >
            <ListPlus size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}
