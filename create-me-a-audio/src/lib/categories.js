export const CATEGORY_LABELS = {
  quran: 'Quran',
  nasheeds: 'Nasheeds',
  talks: 'Talks',
  audiobooks: 'Audiobooks',
  hadith: 'Hadith',
  dua: 'Dua',
  'kids-stories': 'Kids Stories',
  'kids-quran': 'Kids Quran',
  'kids-nasheeds': 'Kids Nasheeds',
  'kids-talks': 'Kids Talks',
}

export const BROWSE_CATEGORIES = [
  {
    to: '/quran',
    label: 'Quran',
    desc: 'Holy recitations by world-renowned reciters',
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    category: 'quran',
  },
  {
    to: '/nasheeds',
    label: 'Nasheeds',
    desc: 'Beautiful Islamic vocal performances',
    gradient: 'from-violet-500 to-indigo-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    category: 'nasheeds',
  },
  {
    to: '/talks',
    label: 'Talks',
    desc: 'Inspiring lectures and khutbahs',
    gradient: 'from-sky-500 to-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    category: 'talks',
  },
  {
    to: '/favorites',
    label: 'Favorites',
    desc: 'Your saved nasheeds and talks',
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    category: null,
  },
  {
    to: '/audiobooks',
    label: 'Audiobooks',
    desc: 'Islamic books with text support',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    category: 'audiobooks',
  },
  {
    to: '/hadith',
    label: 'Hadith',
    desc: 'Collections with full text',
    gradient: 'from-emerald-600 to-green-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    category: 'hadith',
  },
  {
    to: '/dua',
    label: 'Dua',
    desc: 'Daily adhkar and supplications',
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    category: 'dua',
  },
  {
    to: '/kids-recordings',
    label: 'Kids Recordings',
    desc: "Kids' approved recordings",
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    category: 'kids',
  },
]

export const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/quran', label: 'Quran' },
  { to: '/nasheeds', label: 'Nasheeds' },
  { to: '/talks', label: 'Talks' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/podcast', label: 'Podcast' },
  { to: '/audiobooks', label: 'Books' },
  { to: '/hadith', label: 'Hadith' },
  { to: '/dua', label: 'Dua' },
  { to: '/kids-recordings', label: 'Kids' },
  { to: '/kids-record', label: 'K.Record' },
  { to: '/analytics', label: 'Stats' },
  { to: '/record', label: 'Record' },
  { to: '/admin', label: 'Admin' },
]

export function matchesKidsCategory(category) {
  return String(category || '').startsWith('kids-')
}

export function filterByRouteCategory(tracks, categoryKey) {
  if (!categoryKey) return tracks
  if (categoryKey === 'kids') return tracks.filter((t) => matchesKidsCategory(t.category))
  return tracks.filter((t) => t.category === categoryKey)
}
