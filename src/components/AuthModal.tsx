import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  onClose?: () => void
  forceVibeName?: boolean  // skip straight to vibe name step
}

const AuthModal: React.FC<Props> = ({ onClose, forceVibeName }) => {
  const { signInGoogle, setVibeName, needsVibeName, firebaseAvailable, user, loading } = useAuth()
  const [vibeInput, setVibeInput] = useState(user?.vibeName || '')
  const [signingIn, setSigningIn] = useState(false)
  const [step, setStep] = useState<'auth' | 'vibename'>(
    forceVibeName || needsVibeName ? 'vibename' : 'auth'
  )
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    setError('')
    await signInGoogle()
    // After sign-in, AuthContext sets needsVibeName; component re-renders
    setStep('vibename')
    setSigningIn(false)
  }

  const handleLocalContinue = async () => {
    if (!vibeInput.trim()) return
    await setVibeName(vibeInput.trim())
    onClose?.()
  }

  const handleVibeSubmit = async () => {
    if (!vibeInput.trim()) return
    await setVibeName(vibeInput.trim())
    onClose?.()
  }

  // If user just finished Google auth and needs a vibe name
  const showVibeName = step === 'vibename' || needsVibeName

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div className="glass-card p-6 w-full max-w-sm animate-bounce-in">

        {!showVibeName ? (
          /* ── Step 1: Sign-in options ── */
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎤</div>
              <h2 className="font-display font-extrabold text-xl text-white mb-1">Join the Concert</h2>
              <p className="text-white/50 text-sm font-body">Sign in to chat with fans and vote on the setlist</p>
            </div>

            {firebaseAvailable && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={signingIn || loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-display font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 mb-3"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                  }}
                >
                  {signingIn ? (
                    <span className="animate-pulse">Signing in…</span>
                  ) : (
                    <>
                      {/* Google G icon */}
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30 font-body">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              </>
            )}

            {/* Anonymous / local option */}
            <div>
              <p className="text-xs text-white/40 font-body text-center mb-3">
                {firebaseAvailable ? 'Continue without an account' : 'Enter a vibe name to join'}
              </p>
              <input
                type="text"
                placeholder="e.g. HydBanger99"
                maxLength={20}
                value={vibeInput}
                onChange={(e) => { setVibeInput(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleLocalContinue()}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-purple text-sm font-body mb-3"
              />
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <button
                onClick={handleLocalContinue}
                disabled={!vibeInput.trim()}
                className="btn-neon w-full text-white font-display font-bold py-3 text-sm disabled:opacity-40"
              >
                Join as Guest 👋
              </button>
            </div>
          </>
        ) : (
          /* ── Step 2: Set vibe name (post-Google-auth) ── */
          <>
            <div className="text-center mb-6">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-neon-purple" />
              ) : (
                <div className="text-4xl mb-3">✨</div>
              )}
              <h2 className="font-display font-extrabold text-xl text-white mb-1">Choose your vibe name</h2>
              <p className="text-white/50 text-sm font-body">How should other fans see you?</p>
            </div>
            <input
              type="text"
              placeholder="e.g. RockstarFan_Hyd"
              maxLength={20}
              value={vibeInput}
              autoFocus
              onChange={(e) => setVibeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVibeSubmit()}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-purple text-sm font-body mb-4"
            />
            <button
              onClick={handleVibeSubmit}
              disabled={!vibeInput.trim()}
              className="btn-primary w-full text-white font-display font-bold py-3 text-sm disabled:opacity-40"
            >
              Let's Go 🎵
            </button>
          </>
        )}

        <p className="text-[10px] text-white/20 font-body text-center mt-4">
          Unofficial fan app · Your data is never sold
        </p>
      </div>
    </div>
  )
}

export default AuthModal
