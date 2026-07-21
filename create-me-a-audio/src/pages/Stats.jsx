import { useMemo } from 'react'
import { CATEGORY_LABELS } from '../lib/categories'
import { useAudioLibrary } from '../context/AudioLibraryContext'
import { usePlayer } from '../context/PlayerContext'

export default function Stats() {
  const { tracks, loading } = useAudioLibrary()
  const { recent } = usePlayer()

  const byCategory = useMemo(() => {
    const map = {}
    for (const t of tracks) {
      map[t.category] = (map[t.category] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [tracks])

  const topPlayed = useMemo(
    () => [...tracks].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10),
    [tracks],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Stats</h1>
        <p className="mt-2 text-slate-600">Library totals and your recently played tracks.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Tracks</p>
          <p className="text-3xl font-bold text-slate-900">{loading ? '…' : tracks.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total plays</p>
          <p className="text-3xl font-bold text-slate-900">
            {tracks.reduce((sum, t) => sum + (t.views || 0), 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Recently played</p>
          <p className="text-3xl font-bold text-slate-900">{recent.length}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">By category</h2>
        <ul className="space-y-2">
          {byCategory.map(([cat, count]) => (
            <li key={cat} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
              <span>{CATEGORY_LABELS[cat] || cat}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Most played</h2>
        <ul className="space-y-2">
          {topPlayed.map((t) => (
            <li key={t.id} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
              <span className="truncate">{t.title}</span>
              <span className="shrink-0 font-semibold">{t.views || 0}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
