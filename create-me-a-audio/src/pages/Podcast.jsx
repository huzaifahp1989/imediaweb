import { useEffect, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'

export default function Podcast() {
  const [episodes, setEpisodes] = useState([])
  const [error, setError] = useState('')
  const { playTrack } = usePlayer()

  useEffect(() => {
    fetch('/api/podcast-rss')
      .then((r) => r.json())
      .then((data) => setEpisodes(data.episodes || []))
      .catch(() => setError('Could not load podcast episodes.'))
  }, [])

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-slate-900">Podcast</h1>
      <p className="mt-2 text-slate-600">Short Islamic reminders and talks</p>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      <div className="mt-6 space-y-3">
        {episodes.map((ep) => (
          <button
            key={ep.id}
            type="button"
            onClick={() =>
              playTrack({
                id: ep.id,
                title: ep.title,
                reciter: 'Podcast',
                category: 'talks',
                audioUrl: ep.audioUrl,
                duration: undefined,
              })
            }
            className="block w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200"
          >
            <h3 className="font-semibold text-slate-900">{ep.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{ep.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
