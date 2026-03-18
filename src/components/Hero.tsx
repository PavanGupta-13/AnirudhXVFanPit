import React, { useRef, useState } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import { useAuth } from '../contexts/AuthContext'
import Countdown from './Countdown'
import AuthModal from './AuthModal'

// Inline Google icon
const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

// Floating music note SVG
const MusicNote: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="absolute pointer-events-none opacity-20 w-6 h-6 animate-music-note"
    style={style}
  >
    <path d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
)

interface Props {
  onOpenSetlist: () => void
  onOpenChat: () => void
}

const Hero: React.FC<Props> = ({ onOpenSetlist, onOpenChat }) => {
  const { isLive } = useCountdown()
  const { user, firebaseAvailable } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <section
      ref={heroRef}
      id="home"
      className={`relative min-h-[100dvh] flex flex-col items-center justify-center pt-8 pb-28 px-4 overflow-hidden ${isLive ? 'bg-concert-live' : 'bg-concert'}`}
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="particle w-80 h-80 rounded-full blur-3xl -top-20 -left-20"
          style={{
            background: 'radial-gradient(circle, rgba(191,0,255,0.18) 0%, transparent 70%)',
            '--duration': '8s',
            '--delay': '0s',
          } as React.CSSProperties}
        />
        <div
          className="particle w-72 h-72 rounded-full blur-3xl top-1/3 -right-16"
          style={{
            background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)',
            '--duration': '10s',
            '--delay': '2s',
          } as React.CSSProperties}
        />
        <div
          className="particle w-96 h-96 rounded-full blur-3xl bottom-10 left-1/4"
          style={{
            background: 'radial-gradient(circle, rgba(0,102,255,0.12) 0%, transparent 70%)',
            '--duration': '12s',
            '--delay': '4s',
          } as React.CSSProperties}
        />

        {/* Floating music notes */}
        <MusicNote style={{ top: '12%', left: '8%', color: '#bf00ff', animationDelay: '0s' }} />
        <MusicNote style={{ top: '20%', right: '10%', color: '#00e5ff', animationDelay: '1.5s', width: 32, height: 32 }} />
        <MusicNote style={{ top: '55%', left: '5%', color: '#0066ff', animationDelay: '3s' }} />
        <MusicNote style={{ top: '70%', right: '8%', color: '#bf00ff', animationDelay: '0.8s', width: 20, height: 20 }} />
        <MusicNote style={{ bottom: '20%', left: '15%', color: '#00e5ff', animationDelay: '2.5s', width: 28, height: 28 }} />
      </div>

      {/* Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg mx-auto animate-fade-in">
        {/* Badge + auth strip */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(191,0,255,0.15)', border: '1px solid rgba(191,0,255,0.4)', color: '#bf00ff' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Fan Companion · Unofficial
          </div>

          {/* Sign-in / user strip */}
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-display font-semibold transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
            >
              {firebaseAvailable
                ? <><GoogleIcon /> Sign in with Google to chat &amp; vote</>
                : <>👋 Pick a name to chat &amp; vote</>}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
            >
              {user.photoURL
                ? <img src={user.photoURL} className="w-4 h-4 rounded-full" alt="" />
                : <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: user.avatarColor }}>{user.vibeName[0]?.toUpperCase()}</span>
              }
              Signed in as <span className="text-white/70 font-semibold">{user.vibeName}</span>
            </div>
          )}
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

        {/* Main title */}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-2 text-shadow-neon">
          <span className="neon-text">Rockstar</span>
          <br />
          <span className="text-white">Anirudh</span>
          {' '}
          <span className="neon-text-gold">XV</span>
        </h1>

        {/* Subtitle */}
        <p className="font-display font-semibold text-lg sm:text-xl text-white/80 mb-1">
          Hyderabad 🎤
        </p>
        <p
          className="font-display font-semibold text-sm sm:text-base mb-2"
          style={{ background: 'linear-gradient(135deg, #bf00ff, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          15 Years With You
        </p>
        <p className="text-white/50 text-xs sm:text-sm font-body mb-2">
          Gachibowli Outdoor Stadium
        </p>
        <p className="text-white/70 text-sm font-display font-medium mb-8">
          📅 March 21, 2026 · 6:00 pm – 10:00 pm IST
        </p>

        {/* Equalizer bars decoration */}
        <div className="flex items-end justify-center gap-1 h-6 mb-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="equalizer-bar"
              style={{
                height: `${Math.random() * 16 + 4}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.6 + Math.random() * 0.6}s`,
              }}
            />
          ))}
        </div>

        {/* Countdown */}
        <Countdown onOpenSetlist={onOpenSetlist} onOpenChat={onOpenChat} />
      </div>

      {/* Scroll indicator */}
      {/* <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce pointer-events-none">
        <span className="text-xs font-display text-white/60">scroll to explore</span>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div> */}
    </section>
  )
}

export default Hero
