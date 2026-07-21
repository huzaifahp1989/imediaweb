import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { formatDuration } from '../lib/tracks'
import { usePlayer } from '../context/PlayerContext'

export default function PlayerBar() {
  const { current, playing, position, duration, toggle, next, prev, seek } = usePlayer()
  if (!current) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{current.title}</p>
          <p className="truncate text-xs text-slate-500">{current.reciter}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={prev} className="rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Previous">
            <SkipBack size={18} />
          </button>
          <button
            type="button"
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button type="button" onClick={next} className="rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Next">
            <SkipForward size={18} />
          </button>
        </div>
        <div className="hidden min-w-[200px] flex-1 sm:block">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(position, duration || 1)}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-blue-600"
            aria-label="Seek audio position"
          />
          <div className="mt-0.5 flex justify-between text-[10px] tabular-nums text-slate-500">
            <span>{formatDuration(position)}</span>
            <span>{duration ? formatDuration(duration) : '--:--'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
