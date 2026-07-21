import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  deleteTrack,
  editTrack,
  importTrackFromUrl,
  isAudioFile,
  loadTracks,
  probeDuration,
  subscribeVotes,
  uploadTrack,
} from '../lib/tracks'

const AudioLibraryContext = createContext(null)

export function AudioLibraryProvider({ children }) {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setTracks(await loadTracks())
    } catch (e) {
      console.error('[AudioLibrary] Failed to load tracks:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    return subscribeVotes((votes) => {
      setTracks((prev) =>
        prev.map((t) => ({
          ...t,
          votes: votes[t.id] === undefined ? t.votes ?? 0 : votes[t.id],
        })),
      )
    })
  }, [])

  const handleUpload = useCallback(async (file, meta) => {
    setUploadError(null)
    if (!isAudioFile(file)) {
      setUploadError('Please select a valid audio file.')
      return false
    }
    if (!meta.title?.trim()) {
      setUploadError('Please enter a title.')
      return false
    }
    setUploading(true)
    try {
      const duration = await probeDuration(file)
      const track = await uploadTrack(file, { ...meta, duration })
      setTracks((prev) => [track, ...prev])
      return true
    } catch (e) {
      setUploadError(e?.message || 'Upload failed. Please try again.')
      return false
    } finally {
      setUploading(false)
    }
  }, [])

  const handleImport = useCallback(async (meta) => {
    setUploadError(null)
    if (!meta.audioUrl) {
      setUploadError('Missing audio URL from import.')
      return false
    }
    if (!meta.title?.trim()) {
      setUploadError('Please enter a title.')
      return false
    }
    if (!meta.reciter?.trim()) {
      setUploadError('Please choose a reciter / artist / speaker.')
      return false
    }
    setUploading(true)
    try {
      const track = await importTrackFromUrl(meta)
      setTracks((prev) => [track, ...prev])
      return true
    } catch (e) {
      setUploadError(e?.message || 'Import failed. Please try again.')
      return false
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDelete = useCallback(async (id) => {
    const track = tracks.find((t) => t.id === id)
    if (!track) return
    await deleteTrack(track)
    setTracks((prev) => prev.filter((t) => t.id !== id))
  }, [tracks])

  const handleEdit = useCallback(async (id, updates) => {
    await editTrack(id, updates)
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const getByCategory = useCallback(
    (category) => tracks.filter((t) => t.category === category),
    [tracks],
  )

  const value = useMemo(
    () => ({
      tracks,
      loading,
      uploading,
      uploadError,
      refresh,
      uploadTrack: handleUpload,
      importTrackFromUrl: handleImport,
      deleteTrackById: handleDelete,
      editTrack: handleEdit,
      getByCategory,
      incrementTrackView: (id, next) => {
        setTracks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, views: next || (t.views || 0) + 1 } : t)),
        )
      },
      updateTrackVote: (id, next) => {
        setTracks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, votes: Math.max(0, next) } : t)),
        )
      },
    }),
    [
      tracks,
      loading,
      uploading,
      uploadError,
      refresh,
      handleUpload,
      handleImport,
      handleDelete,
      handleEdit,
      getByCategory,
    ],
  )

  return <AudioLibraryContext.Provider value={value}>{children}</AudioLibraryContext.Provider>
}

export function useAudioLibrary() {
  const ctx = useContext(AudioLibraryContext)
  if (!ctx) throw new Error('useAudioLibrary must be used inside AudioLibraryProvider')
  return ctx
}
