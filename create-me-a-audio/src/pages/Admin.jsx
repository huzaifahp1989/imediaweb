import { useState } from 'react'
import { CATEGORY_LABELS } from '../lib/categories'
import { useAudioLibrary } from '../context/AudioLibraryContext'

const UPLOAD_CATEGORIES = Object.keys(CATEGORY_LABELS)

export default function Admin() {
  const { tracks, loading, uploading, uploadError, uploadTrack, deleteTrackById, refresh } =
    useAudioLibrary()
  const [title, setTitle] = useState('')
  const [reciter, setReciter] = useState('')
  const [category, setCategory] = useState('nasheeds')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setMessage('')
    const ok = await uploadTrack(file, { title, reciter, category })
    if (ok) {
      setMessage('Uploaded successfully.')
      setTitle('')
      setReciter('')
      setFile(null)
      e.target.reset?.()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Admin</h1>
        <p className="mt-2 text-slate-600">Upload and manage library tracks (Firebase project audio-68d1f).</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          required
          value={reciter}
          onChange={(e) => setReciter(e.target.value)}
          placeholder="Reciter / artist / speaker"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          {UPLOAD_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <input
          required
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Upload track'}
        </button>
        {(uploadError || message) && (
          <p className={`text-sm ${uploadError ? 'text-rose-600' : 'text-emerald-600'}`}>
            {uploadError || message}
          </p>
        )}
      </form>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Library ({tracks.length})</h2>
          <button type="button" onClick={refresh} className="text-sm font-semibold text-blue-700">
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <ul className="space-y-2">
            {tracks.slice(0, 50).map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
                <span className="truncate">
                  {t.title} <span className="text-slate-400">· {t.category}</span>
                </span>
                <button type="button" onClick={() => deleteTrackById(t.id)} className="text-rose-600">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
