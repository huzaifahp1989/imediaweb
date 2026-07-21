import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../lib/categories'
import PlayerBar from './PlayerBar'
import PlaylistManager from './PlaylistManager'

export default function Layout() {
  return (
    <div className="app-shell min-h-screen pb-28">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3">
          <NavLink to="/" className="shrink-0 font-display text-lg font-bold text-blue-800">
            Islamic Audio Library
          </NavLink>
          <nav className="flex min-w-0 flex-1 gap-1">
            {NAV_ITEMS.filter((item) => item.to !== '/').map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
        <div className="mt-10">
          <PlaylistManager />
        </div>
      </main>

      <PlayerBar />
    </div>
  )
}
