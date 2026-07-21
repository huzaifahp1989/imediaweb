import TrackCard from '../components/TrackCard'
import { useLibraryExtras } from '../context/LibraryExtrasContext'

export default function Favorites() {
  const { favorites } = useLibraryExtras()
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-slate-900">Favorites</h1>
      <p className="mt-2 text-slate-600">Your saved nasheeds and talks</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {favorites.length === 0 ? (
          <p className="text-sm text-slate-500">No favorites yet. Tap the heart on any track.</p>
        ) : (
          favorites.map((track) => <TrackCard key={track.id} track={track} tracks={favorites} />)
        )}
      </div>
    </div>
  )
}
