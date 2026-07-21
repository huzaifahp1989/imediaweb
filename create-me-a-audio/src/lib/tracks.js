import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage, COLLECTIONS } from './firebase'

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function isAudioFile(file) {
  if (file.type?.startsWith('audio/')) return true
  return /\.(mp3|wav|m4a|aac|ogg|opus|webm|flac)$/i.test(file.name)
}

async function getAllViews() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.views))
    const map = {}
    snap.docs.forEach((d) => {
      map[d.id] = d.data().count || 0
    })
    return map
  } catch (e) {
    console.error('[Views] Error getting all views:', e)
    return {}
  }
}

async function getAllVotes() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.votes))
    const map = {}
    snap.docs.forEach((d) => {
      map[d.id] = d.data().count || 0
    })
    return map
  } catch (e) {
    console.error('[Votes] Error getting all votes:', e)
    return {}
  }
}

export function subscribeVotes(onChange) {
  return onSnapshot(
    collection(db, COLLECTIONS.votes),
    (snap) => {
      const map = {}
      snap.forEach((d) => {
        map[d.id] = d.data().count || 0
      })
      onChange(map)
    },
    (err) => console.error('[Votes] Live subscription error:', err),
  )
}

function mapKidsCategory(raw) {
  const t = String(raw || '').toLowerCase()
  if (t === 'quran') return 'kids-quran'
  if (t === 'nasheed' || t === 'nasheeds') return 'kids-nasheeds'
  if (t === 'talk' || t === 'talks') return 'kids-talks'
  return 'kids-stories'
}

export async function loadTracks() {
  const tracksQ = query(collection(db, COLLECTIONS.tracks), orderBy('uploadedAt', 'desc'))
  const kidsQ = query(
    collection(db, COLLECTIONS.kidsSubmissions),
    where('status', '==', 'approved'),
  )
  const userQ = query(
    collection(db, COLLECTIONS.userSubmissions),
    where('status', '==', 'approved'),
  )

  const [trackSnap, kidsSnap, userSnap, views, votes] = await Promise.all([
    getDocs(tracksQ),
    getDocs(kidsQ),
    getDocs(userQ),
    getAllViews(),
    getAllVotes(),
  ])

  const library = trackSnap.docs.map((d) => {
    const t = d.data()
    return {
      ...t,
      views: views[d.id] || t.views || 0,
      votes: votes[d.id] || t.votes || 0,
    }
  })

  const kids = kidsSnap.docs.map((d) => {
    const t = d.data()
    const id = `kids-${d.id}`
    const uploadedAt = t.reviewedAt || t.submittedAt || Date.now()
    return {
      id,
      title: t.title,
      category: mapKidsCategory(t.category || 'story'),
      reciter: t.username || 'Kids',
      fileName: t.fileName || d.id,
      fileSize: t.fileSize || 0,
      duration: t.duration,
      mimeType: 'audio/webm',
      uploadedAt,
      audioUrl: t.audioUrl,
      views: views[id] || 0,
      votes: votes[id] || 0,
    }
  })

  const users = userSnap.docs.map((d) => {
    const t = d.data()
    const id = `user-${d.id}`
    const uploadedAt = t.reviewedAt || t.submittedAt || Date.now()
    return {
      id,
      title: t.title,
      category: t.category,
      reciter: t.reciter || t.contributorName || 'Contributor',
      fileName: t.fileName || d.id,
      fileSize: t.fileSize || 0,
      duration: t.duration,
      mimeType: t.audioUrl?.endsWith('.mp3') ? 'audio/mpeg' : 'audio/webm',
      uploadedAt,
      audioUrl: t.audioUrl,
      topic: t.topic,
      views: views[id] || 0,
      votes: votes[id] || 0,
    }
  })

  return [...users, ...kids, ...library].sort((a, b) => b.uploadedAt - a.uploadedAt)
}

async function uploadFile(file, path) {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function uploadTrack(file, meta) {
  const id = crypto.randomUUID()
  const path = `audio/${id}-${file.name}`
  const audioUrl = await uploadFile(file, path)
  const track = {
    id,
    title: meta.title,
    category: meta.category,
    reciter: meta.reciter,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt: Date.now(),
    audioUrl,
    views: 0,
  }
  if (meta.topic) track.topic = meta.topic
  if (meta.duration !== undefined) track.duration = meta.duration
  if (meta.text) track.text = meta.text
  if (meta.imageFile?.type?.startsWith('image/')) {
    track.imageUrl = await uploadFile(meta.imageFile, `images/${id}-${meta.imageFile.name}`)
    track.imageFileName = meta.imageFile.name
  }
  await setDoc(doc(db, COLLECTIONS.tracks, id), track)
  return track
}

export async function importTrackFromUrl(meta) {
  const id = crypto.randomUUID()
  const track = {
    id,
    title: meta.title,
    category: meta.category,
    reciter: meta.reciter,
    fileName: meta.fileName,
    fileSize: meta.fileSize,
    mimeType: meta.mimeType,
    uploadedAt: Date.now(),
    audioUrl: meta.audioUrl,
    views: 0,
  }
  if (meta.topic) track.topic = meta.topic
  if (Number.isFinite(meta.duration)) track.duration = meta.duration
  if (meta.imageUrl) track.imageUrl = meta.imageUrl
  await setDoc(doc(db, COLLECTIONS.tracks, id), track)
  return track
}

export async function editTrack(id, updates) {
  const snap = await getDocs(collection(db, COLLECTIONS.tracks))
  for (const d of snap.docs) {
    if (d.data().id === id) {
      await updateDoc(doc(db, COLLECTIONS.tracks, d.id), updates)
      return
    }
  }
  throw new Error('Track not found')
}

export async function deleteTrack(track) {
  if (track.audioUrl) {
    try {
      const path = `audio/${track.id}-${track.fileName}`
      await deleteObject(ref(storage, path))
    } catch (e) {
      console.error('Failed to delete from storage:', e)
    }
  }
  const snap = await getDocs(collection(db, COLLECTIONS.tracks))
  for (const d of snap.docs) {
    if (d.data().id === track.id) {
      await deleteDoc(doc(db, COLLECTIONS.tracks, d.id))
    }
  }
}

export async function incrementView(trackId) {
  const refDoc = doc(db, COLLECTIONS.views, trackId)
  try {
    const snap = await getDocs(query(collection(db, COLLECTIONS.views)))
    const existing = snap.docs.find((d) => d.id === trackId)
    const count = (existing?.data()?.count || 0) + 1
    await setDoc(refDoc, { count }, { merge: true })
    return count
  } catch (e) {
    console.error('[Views] increment failed', e)
    return null
  }
}

export async function toggleVote(trackId, nextCount) {
  await setDoc(doc(db, COLLECTIONS.votes, trackId), { count: Math.max(0, nextCount) }, { merge: true })
}

export async function submitUserAudio(payload) {
  const id = crypto.randomUUID()
  await setDoc(doc(db, COLLECTIONS.userSubmissions, id), {
    ...payload,
    status: 'pending',
    submittedAt: Date.now(),
  })
  return id
}

export async function submitKidsRecording(payload) {
  const id = crypto.randomUUID()
  await setDoc(doc(db, COLLECTIONS.kidsSubmissions, id), {
    ...payload,
    status: 'pending',
    submittedAt: Date.now(),
  })
  return id
}

export async function requestNasheed(payload) {
  const id = crypto.randomUUID()
  await setDoc(doc(db, COLLECTIONS.nasheedRequests, id), {
    ...payload,
    createdAt: Date.now(),
  })
  return id
}

export async function probeDuration(fileOrUrl) {
  return new Promise((resolve) => {
    const audio = new Audio()
    const src = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl)
    audio.src = src
    const cleanup = () => {
      if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(src)
    }
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
      cleanup()
    })
    audio.addEventListener('error', () => {
      resolve(undefined)
      cleanup()
    })
    setTimeout(() => {
      resolve(undefined)
      cleanup()
    }, 8000)
  })
}
