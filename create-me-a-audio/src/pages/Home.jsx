import { Link } from 'react-router-dom'
import { BookOpen, Headphones, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BROWSE_CATEGORIES } from '../lib/categories'
import { useAudioLibrary } from '../context/AudioLibraryContext'
import TrackCard from '../components/TrackCard'

export default function Home() {
  const { tracks, loading } = useAudioLibrary()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const featured = useMemo(() => tracks.slice(0, 6), [tracks])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return tracks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.reciter?.toLowerCase().includes(q) ||
        t.topic?.toLowerCase().includes(q),
    )
  }, [tracks, query])

  return (
    <div>
      <section className="hero-panel relative overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white md:px-10 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.35),transparent_40%)]" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span>📖</span>
            Islamic Audio Library
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight drop-shadow md:text-5xl">
            Listen to the Voice of <span className="text-sky-200">Islam</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-50">
            Explore Quran recitations, nasheeds, Islamic talks and children&apos;s audio — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/quran"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-md transition hover:bg-sky-50"
            >
              Start Listening <Headphones size={18} />
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <Search size={18} /> Search library
            </button>
          </div>
        </div>
      </section>

      {searchOpen && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, reciter, topic..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filtered.slice(0, 12).map((track, index) => (
              <TrackCard key={track.id} track={track} tracks={filtered} index={index} />
            ))}
            {query && filtered.length === 0 && (
              <p className="text-sm text-slate-500">No matches for “{query}”.</p>
            )}
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="rounded-lg bg-sky-100 p-2 text-sky-600">
            <BookOpen size={18} />
          </span>
          Browse Categories
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BROWSE_CATEGORIES.map((cat) => (
            <Link
              key={cat.to}
              to={cat.to}
              className={`group rounded-2xl border ${cat.border} ${cat.bg} p-4 transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${cat.gradient} p-2.5 text-white shadow`}>
                <Headphones size={18} />
              </div>
              <h3 className={`font-bold ${cat.text}`}>{cat.label}</h3>
              <p className="mt-1 text-sm text-slate-600">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Recently added</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading library…</p>
        ) : featured.length === 0 ? (
          <p className="text-sm text-slate-500">No tracks yet. Upload from Admin or Record.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((track) => (
              <TrackCard key={track.id} track={track} tracks={featured} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
