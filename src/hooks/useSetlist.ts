import { useState, useCallback, useEffect } from 'react'
import { INITIAL_SETLIST, Song, SongStatus } from '../data/setlist'
import {
  initFirebase,
  isFirebaseConfigured,
  updateSongStatus,
  upsertSong,
  deleteSong,
  castVote,
  removeVote,
  subscribeToSetlist,
  seedSetlistIfEmpty,
  subscribeToUserVotes,
} from '../lib/firebase'
import { AuthUser } from '../contexts/AuthContext'

const LS_VOTES = 'anirudh_xv_votes'
const LS_ADMIN = 'anirudh_xv_is_admin'

function loadLocalVotes(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_VOTES)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {/* */}
  return new Set()
}

// Concert starts March 21 2026 18:00 IST = 12:30 UTC
const CONCERT_START = new Date('2026-03-21T12:30:00.000Z')
export const isPredictedMode = () => new Date() < CONCERT_START

export function useSetlist(authUser: AuthUser | null) {
  const firebaseMode = isFirebaseConfigured()
  // Always start with INITIAL_SETLIST so UI is never blank while Firestore loads
  const [songs, setSongs]     = useState<Song[]>(INITIAL_SETLIST)
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(LS_ADMIN) === '1')
  const [votedIds, setVotedIds] = useState<Set<string>>(loadLocalVotes)

  // ── Real-time setlist from Firestore ────────────────────────────────────────
  useEffect(() => {
    if (!firebaseMode) return
    const db = initFirebase()
    if (!db) return

    const unsub = subscribeToSetlist(db, (raw) => {
      const fetched = raw as unknown as Song[]
      // Only replace local data when Firestore actually has songs
      if (fetched.length > 0) {
        setSongs(fetched.sort((a, b) => a.positionGuess - b.positionGuess))
      }
    })
    return unsub
  }, [firebaseMode])

  // ── Seed Firestore when first authenticated user connects ───────────────────
  useEffect(() => {
    if (!firebaseMode || !authUser || authUser.isAnonymous) return
    const db = initFirebase()
    if (!db) return
    seedSetlistIfEmpty(db, INITIAL_SETLIST as unknown as Record<string, unknown>[]).catch(console.warn)
  }, [firebaseMode, authUser?.uid])

  // ── Real-time user votes from Firestore (only for Firebase-auth users) ──────
  useEffect(() => {
    if (!firebaseMode || !authUser || authUser.isAnonymous) return
    const db = initFirebase()
    if (!db) return

    const unsub = subscribeToUserVotes(db, authUser.uid, (ids) => {
      setVotedIds(new Set(ids))
    })
    return unsub
  }, [firebaseMode, authUser?.uid, authUser?.isAnonymous])

  // Persist local votes to localStorage (guest / no-Firebase mode)
  useEffect(() => {
    if (firebaseMode && authUser && !authUser.isAnonymous) return
    try { localStorage.setItem(LS_VOTES, JSON.stringify([...votedIds])) } catch {/* */}
  }, [votedIds, firebaseMode, authUser])

  // ── Status update (admin live mode) ─────────────────────────────────────────
  const updateStatus = useCallback((id: string, status: SongStatus) => {
    const db = initFirebase()
    if (db) {
      updateSongStatus(db, id, status).catch(console.warn)
    } else {
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
    }
  }, [])

  // ── Hype vote / unvote ───────────────────────────────────────────────────────
  const toggleVote = useCallback(async (songId: string) => {
    const uid = authUser?.uid ?? `anon_${Date.now()}`
    const alreadyVoted = votedIds.has(songId)
    const db = initFirebase()

    if (db && authUser && !authUser.isAnonymous) {
      // Optimistic hype count update; subscription will reconcile
      setSongs((prev) => prev.map((s) =>
        s.id === songId
          ? { ...s, hypeCount: alreadyVoted ? Math.max(0, s.hypeCount - 1) : s.hypeCount + 1 }
          : s
      ))
      if (alreadyVoted) {
        removeVote(db, songId, uid).catch(console.warn)
      } else {
        castVote(db, songId, uid).catch(console.warn)
      }
      // votedIds updated by subscribeToUserVotes subscription
    } else {
      // Local / guest mode
      if (alreadyVoted) {
        setVotedIds((prev) => { const s = new Set(prev); s.delete(songId); return s })
        setSongs((prev) => prev.map((s) => s.id === songId ? { ...s, hypeCount: Math.max(0, s.hypeCount - 1) } : s))
      } else {
        setVotedIds((prev) => new Set(prev).add(songId))
        setSongs((prev) => prev.map((s) => s.id === songId ? { ...s, hypeCount: s.hypeCount + 1 } : s))
      }
    }
  }, [authUser, votedIds])

  // ── Admin: add song ──────────────────────────────────────────────────────────
  const addSong = useCallback((song: Omit<Song, 'id' | 'hypeCount' | 'status'>) => {
    const id = `custom_${Date.now()}`
    const newSong: Song = { ...song, id, hypeCount: 0, status: 'upcoming' }
    const db = initFirebase()
    if (db) {
      upsertSong(db, newSong as unknown as Record<string, unknown>).catch(console.warn)
    } else {
      setSongs((prev) => [...prev, newSong].sort((a, b) => a.positionGuess - b.positionGuess))
    }
  }, [])

  // ── Admin: edit song ─────────────────────────────────────────────────────────
  const editSong = useCallback((id: string, patch: Partial<Omit<Song, 'id'>>) => {
    const db = initFirebase()
    if (db) {
      upsertSong(db, { id, ...patch } as Record<string, unknown>).catch(console.warn)
    } else {
      setSongs((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s))
    }
  }, [])

  // ── Admin: remove song ───────────────────────────────────────────────────────
  const removeSong = useCallback((id: string) => {
    const db = initFirebase()
    if (db) {
      deleteSong(db, id).catch(console.warn)
    } else {
      setSongs((prev) => prev.filter((s) => s.id !== id))
    }
  }, [])

  // ── Admin unlock ─────────────────────────────────────────────────────────────
  const checkAdmin = useCallback((code: string) => {
    const adminCode = import.meta.env.VITE_ADMIN_CODE ?? 'anirudh2026'
    if (code === adminCode) {
      setIsAdmin(true)
      localStorage.setItem(LS_ADMIN, '1')
      return true
    }
    return false
  }, [])

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false)
    localStorage.removeItem(LS_ADMIN)
  }, [])

  const playingNow  = songs.find((s) => s.status === 'playing')
  const playedCount = songs.filter((s) => s.status === 'played').length
  const predicted   = isPredictedMode()

  return {
    songs, updateStatus, toggleVote, votedIds,
    addSong, editSong, removeSong,
    isAdmin, checkAdmin, logoutAdmin,
    playingNow, playedCount, predicted,
  }
}
