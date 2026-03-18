import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  UserProfile,
  subscribeToAuthState,
  signInWithGoogle,
  signOut,
  initFirebase,
  saveUserProfile,
  getUserProfile,
  isFirebaseConfigured,
} from '../lib/firebase'

const AVATAR_COLORS = ['#bf00ff', '#00e5ff', '#ff0080', '#0066ff', '#ffee00', '#00ff88', '#ff6400']
const randomColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

// ─── Local (no-Firebase) user ─────────────────────────────────────────────────
const LS_LOCAL_USER = 'anirudh_xv_local_user'

interface LocalUser {
  uid: string
  vibeName: string
  avatarColor: string
}

function getLocalUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(LS_LOCAL_USER)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveLocalUser(u: LocalUser) {
  localStorage.setItem(LS_LOCAL_USER, JSON.stringify(u))
}

// ─── Context shape ────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string
  vibeName: string
  avatarColor: string
  photoURL?: string
  email?: string
  isAnonymous: boolean  // true = local-only (no Firebase Auth)
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  needsVibeName: boolean           // signed in but vibeName not set yet
  firebaseAvailable: boolean
  signInGoogle: () => Promise<void>
  logout: () => Promise<void>
  setVibeName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]         = useState<AuthUser | null>(null)
  const [loading, setLoading]   = useState(true)
  const [needsVibeName, setNeedsVibeName] = useState(false)
  const firebaseAvailable = isFirebaseConfigured()

  useEffect(() => {
    if (firebaseAvailable) {
      // Firebase auth flow
      const unsub = subscribeToAuthState(async (fbUser) => {
        if (fbUser) {
          const db = initFirebase()
          let profile: UserProfile | null = null
          if (db) profile = await getUserProfile(db, fbUser.uid)

          if (profile?.vibeName) {
            setUser({
              uid: fbUser.uid,
              vibeName: profile.vibeName,
              avatarColor: profile.avatarColor,
              photoURL: fbUser.photoURL ?? undefined,
              email: fbUser.email ?? undefined,
              isAnonymous: false,
            })
            setNeedsVibeName(false)
          } else {
            // Signed in but no vibe name yet
            setUser({
              uid: fbUser.uid,
              vibeName: fbUser.displayName ?? '',
              avatarColor: profile?.avatarColor ?? randomColor(),
              photoURL: fbUser.photoURL ?? undefined,
              email: fbUser.email ?? undefined,
              isAnonymous: false,
            })
            setNeedsVibeName(true)
          }
        } else {
          setUser(null)
          setNeedsVibeName(false)
        }
        setLoading(false)
      })
      return unsub
    } else {
      // Local mode – use localStorage user
      const local = getLocalUser()
      if (local) {
        setUser({ ...local, isAnonymous: true })
        setNeedsVibeName(false)
      }
      setLoading(false)
    }
  }, [firebaseAvailable])

  const signInGoogle = useCallback(async () => {
    setLoading(true)
    await signInWithGoogle()
    // onAuthStateChanged will handle the rest
  }, [])

  const logout = useCallback(async () => {
    if (firebaseAvailable) {
      await signOut()
    } else {
      localStorage.removeItem(LS_LOCAL_USER)
      setUser(null)
    }
  }, [firebaseAvailable])

  const setVibeName = useCallback(async (name: string) => {
    const color = user?.avatarColor || randomColor()
    const uid   = user?.uid || `local_${Date.now()}`

    const updated: AuthUser = {
      uid,
      vibeName: name,
      avatarColor: color,
      photoURL: user?.photoURL,
      email: user?.email,
      isAnonymous: user?.isAnonymous ?? true,
    }

    if (firebaseAvailable && user && !user.isAnonymous) {
      const db = initFirebase()
      if (db) await saveUserProfile(db, { uid, vibeName: name, avatarColor: color, photoURL: user.photoURL })
    } else {
      // Local / guest mode
      const local: LocalUser = { uid, vibeName: name, avatarColor: color }
      saveLocalUser(local)
    }
    setUser(updated)
    setNeedsVibeName(false)
  }, [user, firebaseAvailable])

  return (
    <AuthContext.Provider value={{ user, loading, needsVibeName, firebaseAvailable, signInGoogle, logout, setVibeName }}>
      {children}
    </AuthContext.Provider>
  )
}
