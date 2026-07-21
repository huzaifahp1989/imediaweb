import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const FAVORITES_KEY = 'audio-favorites-v1'
const PLAYLISTS_KEY = 'audio-player-saved-playlists'

const LibraryExtrasContext = createContext(null)

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function LibraryExtrasProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readJson(FAVORITES_KEY, []))
  const [playlist, setPlaylist] = useState([])
  const [savedPlaylists, setSavedPlaylists] = useState(() => readJson(PLAYLISTS_KEY, []))

  const toggleFavorite = useCallback((track) => {
    setFavorites((prev) => {
      const exists = prev.some((t) => t.id === track.id)
      const next = exists ? prev.filter((t) => t.id !== track.id) : [{ ...track }, ...prev]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((id) => favorites.some((t) => t.id === id), [favorites])

  const addToPlaylist = useCallback((track) => {
    setPlaylist((prev) => (prev.some((t) => t.id === track.id) ? prev : [...prev, track]))
  }, [])

  const removeFromPlaylist = useCallback((id) => {
    setPlaylist((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearPlaylist = useCallback(() => setPlaylist([]), [])

  const savePlaylist = useCallback((name) => {
    if (!name?.trim() || !playlist.length) return
    setSavedPlaylists((prev) => {
      const next = [
        { id: crypto.randomUUID(), name: name.trim(), tracks: playlist, savedAt: Date.now() },
        ...prev,
      ]
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(next))
      return next
    })
  }, [playlist])

  const loadPlaylist = useCallback((id) => {
    const found = savedPlaylists.find((p) => p.id === id)
    if (found) setPlaylist(found.tracks || [])
  }, [savedPlaylists])

  const deleteSavedPlaylist = useCallback((id) => {
    setSavedPlaylists((prev) => {
      const next = prev.filter((p) => p.id !== id)
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      favorites,
      playlist,
      savedPlaylists,
      toggleFavorite,
      isFavorite,
      addToPlaylist,
      removeFromPlaylist,
      clearPlaylist,
      savePlaylist,
      loadPlaylist,
      deleteSavedPlaylist,
    }),
    [
      favorites,
      playlist,
      savedPlaylists,
      toggleFavorite,
      isFavorite,
      addToPlaylist,
      removeFromPlaylist,
      clearPlaylist,
      savePlaylist,
      loadPlaylist,
      deleteSavedPlaylist,
    ],
  )

  return (
    <LibraryExtrasContext.Provider value={value}>{children}</LibraryExtrasContext.Provider>
  )
}

export function useLibraryExtras() {
  const ctx = useContext(LibraryExtrasContext)
  if (!ctx) throw new Error('useLibraryExtras must be used inside LibraryExtrasProvider')
  return ctx
}
