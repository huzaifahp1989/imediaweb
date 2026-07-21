import { useState } from 'react'
import { useLibraryExtras } from '../context/LibraryExtrasContext'
import { usePlayer } from '../context/PlayerContext'

export default function PlaylistManager() {
  const {
    playlist,
    savedPlaylists,
    clearPlaylist,
    removeFromPlaylist,
    savePlaylist,
    loadPlaylist,
    deleteSavedPlaylist,
  } = useLibraryExtras()
  const { playFromList } = usePlayer()
  const [name, setName] = useState('')

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Playlist Manager</h2>
          <p className="text-sm text-slate-500">Add tracks from any list and save playlists for later.</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              savePlaylist(name)
              setName('')
            }}
            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Current playlist</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">{playlist.length} tracks</span>
              <button type="button" onClick={clearPlaylist} className="text-rose-600">
                Clear
              </button>
              {playlist.length > 0 && (
                <button
                  type="button"
                  onClick={() => playFromList(playlist, 0)}
                  className="font-semibold text-blue-700"
                >
                  Play
                </button>
              )}
            </div>
          </div>
          {playlist.length === 0 ? (
            <p className="text-sm text-slate-500">Add tracks to the playlist from any track list.</p>
          ) : (
            <ul className="space-y-2">
              {playlist.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="truncate">{t.title}</span>
                  <button type="button" onClick={() => removeFromPlaylist(t.id)} className="text-slate-400">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Saved playlists <span className="font-normal text-slate-500">{savedPlaylists.length} saved</span>
          </h3>
          {savedPlaylists.length === 0 ? (
            <p className="text-sm text-slate-500">Save a playlist and reload it later on any page.</p>
          ) : (
            <ul className="space-y-2">
              {savedPlaylists.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <button type="button" onClick={() => loadPlaylist(p.id)} className="truncate text-left font-medium text-blue-700">
                    {p.name}
                  </button>
                  <button type="button" onClick={() => deleteSavedPlaylist(p.id)} className="text-slate-400">
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
