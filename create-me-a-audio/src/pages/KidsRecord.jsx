import { useEffect, useRef, useState } from 'react'
import { probeDuration, submitKidsRecording } from '../lib/tracks'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../lib/firebase'

export default function KidsRecord() {
  const [username, setUsername] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('quran')
  const [recording, setRecording] = useState(false)
  const [blob, setBlob] = useState(null)
  const [status, setStatus] = useState('')
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => () => mediaRef.current?.stream?.getTracks?.().forEach((t) => t.stop()), [])

  async function start() {
    setStatus('')
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: 'audio/webm' }))
      stream.getTracks().forEach((t) => t.stop())
    }
    mediaRef.current = recorder
    recorder.start()
    setRecording(true)
  }

  function stop() {
    mediaRef.current?.stop()
    setRecording(false)
  }

  async function submit() {
    if (!blob || !username.trim() || !title.trim()) {
      setStatus('Name, title, and a recording are required.')
      return
    }
    setStatus('Uploading…')
    try {
      const id = crypto.randomUUID()
      const file = new File([blob], `${title || 'kids'}.webm`, { type: 'audio/webm' })
      const storageRef = ref(storage, `kids/${id}-${file.name}`)
      await uploadBytes(storageRef, file)
      const audioUrl = await getDownloadURL(storageRef)
      const duration = await probeDuration(file)
      await submitKidsRecording({
        username: username.trim(),
        title: title.trim(),
        category,
        audioUrl,
        fileName: file.name,
        fileSize: file.size,
        duration,
      })
      setStatus('Submitted for kids approval!')
      setBlob(null)
      setTitle('')
    } catch (e) {
      setStatus(e.message || 'Submit failed')
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-slate-900">Kids Record</h1>
      <p className="mt-2 text-slate-600">Record a short clip for kids approval.</p>
      <div className="mt-6 max-w-xl space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Kids username" className="w-full rounded-xl border px-3 py-2 text-sm" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border px-3 py-2 text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm">
          <option value="quran">Quran</option>
          <option value="nasheed">Nasheed</option>
          <option value="talk">Talk</option>
          <option value="story">Story</option>
        </select>
        <div className="flex gap-2">
          {!recording ? (
            <button type="button" onClick={start} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
              Start recording
            </button>
          ) : (
            <button type="button" onClick={stop} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
              Stop
            </button>
          )}
          <button type="button" disabled={!blob} onClick={submit} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Submit
          </button>
        </div>
        {blob && <audio controls src={URL.createObjectURL(blob)} className="w-full" />}
        {status && <p className="text-sm text-slate-600">{status}</p>}
      </div>
    </div>
  )
}
