import { Link } from 'react-router-dom'

export default function Record() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-slate-900">Record</h1>
      <p className="mt-2 text-slate-600">
        Use Kids Record for child submissions, or Submit Audio / Admin for library uploads.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link to="/kids-record" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 font-semibold text-amber-800">
          Kids Record
        </Link>
        <Link to="/submit-audio" className="rounded-2xl border border-sky-200 bg-sky-50 p-5 font-semibold text-sky-800">
          Submit Audio
        </Link>
        <Link to="/admin" className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-800">
          Admin upload
        </Link>
      </div>
    </div>
  )
}
