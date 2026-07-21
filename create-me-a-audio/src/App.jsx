import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AudioLibraryProvider } from './context/AudioLibraryContext'
import { PlayerProvider } from './context/PlayerContext'
import { LibraryExtrasProvider } from './context/LibraryExtrasContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import Favorites from './pages/Favorites'
import Podcast from './pages/Podcast'
import Admin from './pages/Admin'
import SubmitAudio from './pages/SubmitAudio'
import KidsRecord from './pages/KidsRecord'
import Stats from './pages/Stats'
import Record from './pages/Record'

export default function App() {
  return (
    <AudioLibraryProvider>
      <PlayerProvider>
        <LibraryExtrasProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route
                  path="quran"
                  element={
                    <CategoryPage
                      category="quran"
                      title="Quran"
                      description="Holy recitations by world-renowned reciters"
                    />
                  }
                />
                <Route
                  path="nasheeds"
                  element={
                    <CategoryPage
                      category="nasheeds"
                      title="Nasheeds"
                      description="Beautiful Islamic vocal performances"
                    />
                  }
                />
                <Route
                  path="talks"
                  element={
                    <CategoryPage
                      category="talks"
                      title="Talks"
                      description="Inspiring lectures and khutbahs"
                    />
                  }
                />
                <Route
                  path="audiobooks"
                  element={
                    <CategoryPage
                      category="audiobooks"
                      title="Audiobooks"
                      description="Islamic books with text support"
                    />
                  }
                />
                <Route
                  path="hadith"
                  element={
                    <CategoryPage
                      category="hadith"
                      title="Hadith"
                      description="Collections with full text"
                    />
                  }
                />
                <Route
                  path="dua"
                  element={
                    <CategoryPage category="dua" title="Dua" description="Daily adhkar and supplications" />
                  }
                />
                <Route
                  path="kids-recordings"
                  element={
                    <CategoryPage
                      category="kids"
                      title="Kids Recordings"
                      description="Kids' approved recordings"
                    />
                  }
                />
                <Route path="favorites" element={<Favorites />} />
                <Route path="podcast" element={<Podcast />} />
                <Route path="analytics" element={<Stats />} />
                <Route path="record" element={<Record />} />
                <Route path="kids-record" element={<KidsRecord />} />
                <Route path="submit-audio" element={<SubmitAudio />} />
                <Route path="admin" element={<Admin />} />
                <Route path="car" element={<Navigate to="/" replace />} />
                <Route path="kids-approval" element={<Admin />} />
                <Route path="user-submissions-approval" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LibraryExtrasProvider>
      </PlayerProvider>
    </AudioLibraryProvider>
  )
}
