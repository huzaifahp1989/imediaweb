import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { incrementView } from '../lib/tracks'

const RECENT_KEY = 'audio-recently-played-v1'
const PROGRESS_KEY = 'audio-progress-v1'
const MAX_RECENT = 16

const PlayerContext = createContext(null)

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [queue, setQueue] = useState([])
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [recent, setRecent] = useState(() => readJson(RECENT_KEY, []))

  const current = index >= 0 ? queue[index] : null

  const remember = useCallback((track) => {
    const next = [
      {
        id: track.id,
        title: track.title,
        reciter: track.reciter,
        category: track.category,
        topic: track.topic,
        audioUrl: track.audioUrl,
        fileName: track.fileName,
        fileSize: track.fileSize,
        mimeType: track.mimeType || 'audio/mpeg',
        duration: track.duration,
        playedAt: Date.now(),
      },
      ...readJson(RECENT_KEY, []).filter((t) => t.id !== track.id),
    ].slice(0, MAX_RECENT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    setRecent(next)
  }, [])

  const playFromList = useCallback(
    (tracks, startIndex = 0) => {
      if (!tracks?.length) return
      setQueue(tracks)
      setIndex(startIndex)
      setPlaying(true)
      remember(tracks[startIndex])
      incrementView(tracks[startIndex].id).catch(() => {})
    },
    [remember],
  )

  const playTrack = useCallback(
    (track, list = null) => {
      if (list?.length) {
        const i = list.findIndex((t) => t.id === track.id)
        playFromList(list, i >= 0 ? i : 0)
        return
      }
      playFromList([track], 0)
    },
    [playFromList],
  )

  const toggle = useCallback(() => setPlaying((p) => !p), [])
  const next = useCallback(() => {
    setIndex((i) => {
      if (i < 0 || i >= queue.length - 1) return i
      const n = i + 1
      remember(queue[n])
      return n
    })
    setPlaying(true)
  }, [queue, remember])
  const prev = useCallback(() => {
    setIndex((i) => {
      if (i <= 0) return i
      const n = i - 1
      remember(queue[n])
      return n
    })
    setPlaying(true)
  }, [queue, remember])

  const seek = useCallback((value) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setPosition(value)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current?.audioUrl) return
    if (audio.src !== current.audioUrl) {
      audio.src = current.audioUrl
      const progress = readJson(PROGRESS_KEY, {})[current.id]
      const onMeta = () => {
        if (progress?.position && progress.position > 8) {
          audio.currentTime = progress.position
          setPosition(progress.position)
        }
      }
      audio.addEventListener('loadedmetadata', onMeta, { once: true })
    }
    if (playing) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [current, playing])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      setPosition(audio.currentTime)
      setDuration(audio.duration || 0)
      if (current?.id && Number.isFinite(audio.duration) && audio.duration > 0) {
        const map = readJson(PROGRESS_KEY, {})
        const remaining = audio.duration - audio.currentTime
        if (audio.currentTime < 8 || remaining < 12) {
          if (map[current.id]) {
            delete map[current.id]
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
          }
        } else {
          map[current.id] = {
            position: audio.currentTime,
            duration: audio.duration,
            updatedAt: Date.now(),
          }
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(map))
        }
      }
    }
    const onEnded = () => next()
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
    }
  }, [current, next])

  const value = useMemo(
    () => ({
      current,
      queue,
      playing,
      position,
      duration,
      recent,
      playTrack,
      playFromList,
      toggle,
      next,
      prev,
      seek,
      audioRef,
    }),
    [current, queue, playing, position, duration, recent, playTrack, playFromList, toggle, next, prev, seek],
  )

  return (
    <PlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider')
  return ctx
}
