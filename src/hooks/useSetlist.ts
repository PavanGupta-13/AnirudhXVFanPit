import { useState, useCallback, useEffect } from 'react'
import { INITIAL_SETLIST, Song, SongStatus } from '../data/setlist'
import { initFirebase, updateSongStatus, upsertSong, deleteSong, castVote, removeVote } from '../lib/firebase'
import { AuthUser } from '../contexts/AuthContext'

const LS_KEY      = 'anirudh_xv_setlist'
const LS_VOTES    = 'anirudh_xv_votes'
const LS_ADMIN    = 'anirudh_xv_is_admin'

function loadFromStorage(): Song[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as Song[]
  } catch {/* */}
  return INITIAL_SETLIST
}

function loadVotes(): Set<string> {
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
  const [songs, setSongs]     = useState<Song[]>(loadFromStorage)
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem(LS_ADMIN) === '1')
  const [votedIds, setVotedIds] = useState<Set<string>>(loadVotes)

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(songs)) } catch {/* */}
  }, [songs])

  useEffect(() => {
    try { localStorage.setItem(LS_VOTES, JSON.stringify([...votedIds])) } catch {/* */}
  }, [votedIds])

  // ── Status update (admin live mode) ──────────────────────────────────────
  const updateStatus = useCallback((id: string, status: SongStatus) => {
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
    const db = initFirebase()
    if (db) updateSongStatus(db, id, status).catch(console.warn)
  }, [])

  // ── Hype vote / unvote ────────────────────────────────────────────────────
  const toggleVote = useCallback(async (songId: string) => {
    const uid = authUser?.uid ?? `anon_${Date.now()}`
    const alreadyVoted = votedIds.has(songId)
    const db = initFirebase()

    if (alreadyVoted) {
      setVotedIds((prev) => { const s = new Set(prev); s.delete(songId); return s })
      setSongs((prev) => prev.map((s) => s.id === songId ? { ...s, hypeCount: Math.max(0, s.hypeCount - 1) } : s))
      if (db) removeVote(db, songId, uid).catch(console.warn)
    } else {
      setVotedIds((prev) => new Set(prev).add(songId))
      setSongs((prev) => prev.map((s) => s.id === songId ? { ...s, hypeCount: s.hypeCount + 1 } : s))
      if (db) castVote(db, songId, uid).catch(console.warn)
    }
  }, [authUser, votedIds])

  // ── Admin: add song ───────────────────────────────────────────────────────
  const addSong = useCallback((song: Omit<Song, 'id' | 'hypeCount' | 'status'>) => {
    const id = `custom_${Date.now()}`
    const newSong: Song = { ...song, id, hypeCount: 0, status: 'upcoming' }
    setSongs((prev) => [...prev, newSong].sort((a, b) => a.positionGuess - b.positionGuess))
    const db = initFirebase()
    if (db) upsertSong(db, newSong as unknown as Record<string, unknown>).catch(console.warn)
  }, [])

  // ── Admin: edit song ──────────────────────────────────────────────────────
  const editSong = useCallback((id: string, patch: Partial<Omit<Song, 'id'>>) => {
    setSongs((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s))
    const db = initFirebase()
    if (db) upsertSong(db, { id, ...patch } as Record<string, unknown>).catch(console.warn)
  }, [])

  // ── Admin: remove song ────────────────────────────────────────────────────
  const removeSong = useCallback((id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id))
    const db = initFirebase()
    if (db) deleteSong(db, id).catch(console.warn)
  }, [])

  // ── Admin unlock ──────────────────────────────────────────────────────────
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
