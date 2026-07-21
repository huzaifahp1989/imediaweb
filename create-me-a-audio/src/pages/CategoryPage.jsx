import { useMemo } from 'react'
import { filterByRouteCategory, CATEGORY_LABELS } from '../lib/categories'
import { useAudioLibrary } from '../context/AudioLibraryContext'
import TrackCard from '../components/TrackCard'

export default function CategoryPage({ category, title, description }) {
  const { tracks, loading } = useAudioLibrary()
  const list = useMemo(() => filterByRouteCategory(tracks, category), [tracks, category])
  const heading = title || CATEGORY_LABELS[category] || category

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">{heading}</h1>
        {description && <p className="mt-2 text-slate-600">{description}</p>}
        <p className="mt-1 text-sm text-slate-500">{list.length} tracks</p>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500">No tracks in this category yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((track) => (
            <TrackCard key={track.id} track={track} tracks={list} />
          ))}
        </div>
      )}
    </div>
  )
}
