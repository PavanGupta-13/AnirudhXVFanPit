import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Hero from './components/Hero'
import Setlist from './components/Setlist'
import Chat from './components/Chat'
import VibeMeter from './components/VibeMeter'
import BottomNav from './components/BottomNav'
import InfoSection from './components/InfoSection'
import { useSetlist } from './hooks/useSetlist'
import { useChat } from './hooks/useChat'

const SelfieCam = lazy(() => import('./components/SelfieCam'))

type Section = 'home' | 'setlist' | 'chat' | 'camera'

// Inner app that can access AuthContext
function AppInner() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>('home')
  const { playedCount, songs } = useSetlist(user)
  const { messages } = useChat(user)
  const mainRef = useRef<HTMLDivElement>(null)
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAppReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleNavChange = (section: Section) => {
    setActiveSection(section)
    if (section === 'camera') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(section)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
            const id = entry.target.id as Section
            if (['home', 'setlist', 'chat'].includes(id)) setActiveSection(id as Section)
          }
        })
      },
      { threshold: 0.35, rootMargin: '-5% 0px -5% 0px' }
    )
    ;['home', 'setlist', 'chat'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const showCamera = activeSection === 'camera'

  return (
    <div
      ref={mainRef}
      className={`min-h-[100dvh] transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Vibe meter — fixed top */}
      {!showCamera && (
        <div className="fixed top-0 left-0 right-0 z-40" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
          <VibeMeter
            messageCount={messages.length}
            playedCount={playedCount}
            totalSongs={songs.length}
          />
        </div>
      )}

      {showCamera ? (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-dark-900">
              <div className="text-white/50 font-display animate-pulse">Loading camera…</div>
            </div>
          }
        >
          <SelfieCam />
        </Suspense>
      ) : (
        <main style={{ paddingTop: 80 }}>
          <Hero
            onOpenSetlist={() => handleNavChange('setlist')}
            onOpenChat={() => handleNavChange('chat')}
          />
          <Setlist />
          <Chat />
          <InfoSection />
        </main>
      )}

      <BottomNav active={activeSection} onChange={handleNavChange} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
