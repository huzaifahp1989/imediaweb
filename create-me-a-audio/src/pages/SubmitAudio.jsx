import { useState } from 'react'
import { CATEGORY_LABELS } from '../lib/categories'
import { probeDuration, submitUserAudio } from '../lib/tracks'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'

export default function SubmitAudio() {
  const [title, setTitle] = useState('')
  const [reciter, setReciter] = useState('')
  const [category, setCategory] = useState('nasheeds')
  const [topic, setTopic] = useState('')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    setStatus('')
    try {
      const id = crypto.randomUUID()
      const path = `submissions/${id}-${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const audioUrl = await getDownloadURL(storageRef)
      const duration = await probeDuration(file)
      await submitUserAudio({
        title,
        reciter,
        category,
        topic,
        fileName: file.name,
        fileSize: file.size,
        audioUrl,
        duration,
        contributorName: reciter,
      })
      setStatus('Submitted for approval. JazakAllah khair!')
      setTitle('')
      setReciter('')
      setTopic('')
      setFile(null)
    } catch (err) {
      setStatus(err.message || 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-slate-900">Submit Audio</h1>
      <p className="mt-2 text-slate-600">Contribute a track for review before it appears in the library.</p>
      <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border px-3 py-2 text-sm" />
        <input required value={reciter} onChange={(e) => setReciter(e.target.value)} placeholder="Your name / reciter" className="w-full rounded-xl border px-3 py-2 text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm">
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (optional)" className="w-full rounded-xl border px-3 py-2 text-sm" />
        <input required type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        <button disabled={busy} type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? 'Submitting…' : 'Submit for approval'}
        </button>
        {status && <p className="text-sm text-slate-600">{status}</p>}
      </form>
    </div>
  )
}
