import React, { useState } from 'react'
import { useSetlist } from '../hooks/useSetlist'
import { useAuth } from '../contexts/AuthContext'
import { MOOD_COLORS, MOOD_LABELS, Song, SongStatus, MoodTag } from '../data/setlist'
import confetti from 'canvas-confetti'

type Tab = 'all' | 'played' | 'upcoming'

// ── Equalizer (playing-now indicator) ────────────────────────────────────────
const Equalizer: React.FC = () => (
  <div className="flex items-end gap-0.5 h-5 ml-1 shrink-0">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="equalizer-bar" style={{ height: `${8 + i * 2}px` }} />
    ))}
  </div>
)

// ── Song edit / add modal ─────────────────────────────────────────────────────
interface SongFormData {
  title: string
  movie: string
  year: string
  moodTag: MoodTag
  positionGuess: string
}

const EMPTY_FORM: SongFormData = { title: '', movie: '', year: '2024', moodTag: 'banger', positionGuess: '99' }

interface SongFormProps {
  initial?: SongFormData
  onSave: (data: SongFormData) => void
  onCancel: () => void
  mode: 'add' | 'edit'
}

const SongForm: React.FC<SongFormProps> = ({ initial = EMPTY_FORM, onSave, onCancel, mode }) => {
  const [form, setForm] = useState<SongFormData>(initial)
  const set = (k: keyof SongFormData, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const moods: MoodTag[] = ['banger', 'feels', 'mass', 'nostalgic', 'hype']

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onCancel}
    >
      <div className="glass-card p-5 w-full max-w-sm animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-lg mb-4 neon-text">
          {mode === 'add' ? '+ Add Song' : '✏️ Edit Song'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 font-display uppercase tracking-widest block mb-1">Song Title *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Vaathi Coming" maxLength={60}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-neon-purple text-sm font-body" />
          </div>
          <div>
            <label className="text-xs text-white/40 font-display uppercase tracking-widest block mb-1">Movie / Album *</label>
            <input value={form.movie} onChange={(e) => set('movie', e.target.value)}
              placeholder="e.g. Master" maxLength={40}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-neon-purple text-sm font-body" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/40 font-display uppercase tracking-widest block mb-1">Year</label>
              <input value={form.year} onChange={(e) => set('year', e.target.value)}
                type="number" min={2010} max={2026}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-purple text-sm font-body" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-white/40 font-display uppercase tracking-widest block mb-1">Position</label>
              <input value={form.positionGuess} onChange={(e) => set('positionGuess', e.target.value)}
                type="number" min={1} max={99}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-neon-purple text-sm font-body" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 font-display uppercase tracking-widest block mb-2">Mood</label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button key={m} onClick={() => set('moodTag', m)}
                  className={`text-xs font-display font-semibold px-3 py-1.5 rounded-full transition-all ${
                    form.moodTag === m ? MOOD_COLORS[m] : 'bg-white/5 text-white/40 border border-white/10'
                  }`}>
                  {MOOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={() => form.title && form.movie && onSave(form)}
            disabled={!form.title || !form.movie}
            className="btn-primary flex-1 text-white font-display font-bold py-3 text-sm disabled:opacity-40">
            {mode === 'add' ? 'Add Song' : 'Save Changes'}
          </button>
          <button onClick={onCancel} className="btn-neon flex-1 text-white font-display font-bold py-3 text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Song card ─────────────────────────────────────────────────────────────────
interface SongCardProps {
  song: Song
  isAdmin: boolean
  predicted: boolean
  voted: boolean
  onStatusChange: (id: string, status: SongStatus) => void
  onVote: (id: string) => void
  onEdit: (song: Song) => void
  onDelete: (id: string) => void
  rank: number  // vote rank in predicted mode
}

const SongCard: React.FC<SongCardProps> = ({
  song, isAdmin, predicted, voted,
  onStatusChange, onVote, onEdit, onDelete, rank,
}) => {
  const isPlaying = song.status === 'playing'
  const isPlayed  = song.status === 'played'

  const handleMarkPlayed = () => {
    onStatusChange(song.id, 'played')
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#bf00ff', '#00e5ff', '#ff0080', '#ffee00'], ticks: 150 })
  }

  return (
    <div
      className="glass-card px-4 py-3 transition-all duration-300"
      style={{
        opacity: isPlayed ? 0.55 : 1,
        borderColor: isPlaying ? 'rgba(74,222,128,0.5)' : predicted && rank <= 3 ? 'rgba(255,238,0,0.2)' : undefined,
        boxShadow: isPlaying ? '0 0 20px rgba(74,222,128,0.2)' : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Position / rank badge */}
        <div className="w-7 shrink-0 text-center mt-0.5">
          {predicted ? (
            <span className={`text-sm font-display font-bold ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-white/60' : rank === 3 ? 'text-orange-400' : 'text-white/25'}`}>
              {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `${rank}`}
            </span>
          ) : (
            <span className="text-xs font-mono font-semibold" style={{ color: isPlaying ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
              {String(song.positionGuess).padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`font-display font-semibold text-sm truncate ${isPlaying ? 'status-playing' : isPlayed ? 'status-played' : 'text-white'}`}>
              {song.title}
            </span>
            {isPlaying && <Equalizer />}
            {isPlayed && <span className="text-green-400">✓</span>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/40 font-body">{song.movie} · {song.year}</span>
            <span className={`text-[10px] font-display font-semibold px-2 py-0.5 rounded-full ${MOOD_COLORS[song.moodTag]}`}>
              {MOOD_LABELS[song.moodTag]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Vote / hype button */}
          <button
            onClick={() => onVote(song.id)}
            className={`flex items-center gap-1 text-xs font-display font-bold px-3 py-1.5 rounded-full transition-all duration-200 active:scale-90 ${
              voted
                ? 'text-white shadow-neon-purple'
                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
            }`}
            style={voted ? { background: 'linear-gradient(135deg, #bf00ff, #0066ff)', border: 'none' } : {}}
          >
            🔥 {song.hypeCount}
          </button>

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(song)}
                className="text-[10px] font-display px-2 py-1 rounded-full border border-white/15 text-white/40 hover:text-white transition-all active:scale-90">
                ✏️
              </button>
              {!predicted && (
                <>
                  {!isPlayed && (
                    <button
                      onClick={() => onStatusChange(song.id, isPlaying ? 'upcoming' : 'playing')}
                      className="text-[10px] font-display px-2 py-1 rounded-full border transition-all active:scale-90"
                      style={isPlaying
                        ? { color: '#4ade80', borderColor: 'rgba(74,222,128,0.5)' }
                        : { color: '#00e5ff', borderColor: 'rgba(0,229,255,0.3)' }
                      }>
                      {isPlaying ? '▶' : '▶'}
                    </button>
                  )}
                  {isPlaying && (
                    <button onClick={handleMarkPlayed}
                      className="text-[10px] font-display px-2 py-1 rounded-full border border-white/20 text-white/60 transition-all active:scale-90">
                      ✓
                    </button>
                  )}
                </>
              )}
              <button onClick={() => onDelete(song.id)}
                className="text-[10px] font-display px-2 py-1 rounded-full border border-red-500/30 text-red-400/70 hover:text-red-400 transition-all active:scale-90">
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const Setlist: React.FC = () => {
  const { user } = useAuth()
  const { songs, updateStatus, toggleVote, votedIds, addSong, editSong, removeSong,
    isAdmin, checkAdmin, logoutAdmin, playedCount, predicted } = useSetlist(user)

  const [tab, setTab] = useState<Tab>('all')
  const [adminPrompt, setAdminPrompt] = useState(false)
  const [adminInput, setAdminInput]   = useState('')
  const [adminError, setAdminError]   = useState(false)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Sort songs by hype count in predicted mode, else by position
  const sortedSongs = [...songs].sort((a, b) => {
    if (predicted) return b.hypeCount - a.hypeCount
    const order = { playing: 0, upcoming: 1, played: 2 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return a.positionGuess - b.positionGuess
  })

  const filteredSongs = sortedSongs.filter((s) => {
    if (tab === 'played')   return s.status === 'played'
    if (tab === 'upcoming') return s.status !== 'played'
    return true
  })

  // Map song id → rank in predicted mode
  const rankMap = new Map(sortedSongs.map((s, i) => [s.id, i + 1]))

  const handleAdminSubmit = () => {
    if (checkAdmin(adminInput)) { setAdminPrompt(false); setAdminInput(''); setAdminError(false) }
    else setAdminError(true)
  }

  const handleAddSong = (form: SongFormData) => {
    addSong({
      title: form.title,
      movie: form.movie,
      year: parseInt(form.year) || 2024,
      moodTag: form.moodTag,
      positionGuess: parseInt(form.positionGuess) || 99,
    })
    setShowAddForm(false)
  }

  const handleEditSong = (form: SongFormData) => {
    if (!editingId) return
    editSong(editingId, {
      title: form.title,
      movie: form.movie,
      year: parseInt(form.year) || 2024,
      moodTag: form.moodTag,
      positionGuess: parseInt(form.positionGuess) || 99,
    })
    setEditingId(null)
  }

  const editingSong = editingId ? songs.find((s) => s.id === editingId) : null

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all',      label: 'All',      count: songs.length },
    { id: 'played',   label: 'Played',   count: songs.filter(s => s.status === 'played').length },
    { id: 'upcoming', label: 'Upcoming', count: songs.filter(s => s.status !== 'played').length },
  ]

  return (
    <section id="setlist" className="min-h-screen px-4 pt-8 pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 py-4 -mx-4 px-4 mb-4"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,20,0.98) 80%, transparent)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display font-extrabold text-2xl text-white">Setlist Tracker</h2>
              {predicted && (
                <span className="text-xs font-display font-bold px-2.5 py-1 rounded-full animate-pulse-neon"
                  style={{ background: 'rgba(191,0,255,0.2)', border: '1px solid rgba(191,0,255,0.4)', color: '#bf00ff' }}>
                  PREDICTED
                </span>
              )}
            </div>
            {predicted
              ? <p className="text-xs text-white/40 font-body">Vote for what you want to hear! 🗳️</p>
              : <p className="text-xs text-white/40 font-body">{playedCount}/{songs.length} songs played</p>
            }
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button onClick={() => setShowAddForm(true)}
                  className="text-xs font-display font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={{ background: 'rgba(191,0,255,0.2)', border: '1px solid rgba(191,0,255,0.4)', color: '#bf00ff' }}>
                  + Add
                </button>
                <button onClick={logoutAdmin}
                  className="text-xs font-display text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded">
                  🔓 Exit
                </button>
              </>
            )}
            {!isAdmin && (
              <button onClick={() => setAdminPrompt(true)}
                className="text-xs font-display text-white/20 hover:text-white/40 transition-colors px-2 py-1 rounded">
                ⚙️
              </button>
            )}
          </div>
        </div>

        {/* Tabs — only show in live mode */}
        {!predicted && (
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`font-display font-semibold text-xs px-4 py-2 rounded-full transition-all duration-200 active:scale-95 ${
                  tab === t.id
                    ? 'bg-neon-purple text-white shadow-neon-purple'
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}>
                {t.label} <span className="opacity-60 ml-0.5">({t.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Predicted mode: top voters CTA */}
        {predicted && (
          <div className="flex items-center gap-2 mt-2 text-xs text-white/30 font-body">
            <span>🔥 Most hyped songs rise to the top</span>
            {!user && <span className="text-neon-cyan">· Sign in to vote</span>}
          </div>
        )}
      </div>

      {/* Song list */}
      <div className="flex flex-col gap-3 animate-fade-in">
        {filteredSongs.length === 0 && (
          <p className="text-center text-white/30 py-12 font-display">No songs in this category.</p>
        )}
        {filteredSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            isAdmin={isAdmin}
            predicted={predicted}
            voted={votedIds.has(song.id)}
            onStatusChange={updateStatus}
            onVote={toggleVote}
            onEdit={(s) => setEditingId(s.id)}
            onDelete={removeSong}
            rank={rankMap.get(song.id) ?? 99}
          />
        ))}
      </div>

      {/* Admin unlock modal */}
      {adminPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setAdminPrompt(false)}>
          <div className="glass-card p-6 w-full max-w-xs animate-bounce-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg mb-1 neon-text">Admin Access</h3>
            <p className="text-xs text-white/40 font-body mb-4">Enter the admin code to manage the setlist</p>
            <input type="password" placeholder="Admin code" value={adminInput}
              onChange={(e) => { setAdminInput(e.target.value); setAdminError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-purple text-sm font-body mb-3" />
            {adminError && <p className="text-red-400 text-xs mb-3">Incorrect code.</p>}
            <button onClick={handleAdminSubmit} className="btn-primary w-full text-white font-display font-bold py-3 text-sm">
              Unlock Admin
            </button>
          </div>
        </div>
      )}

      {/* Add song form */}
      {showAddForm && <SongForm mode="add" onSave={handleAddSong} onCancel={() => setShowAddForm(false)} />}

      {/* Edit song form */}
      {editingSong && (
        <SongForm
          mode="edit"
          initial={{
            title: editingSong.title,
            movie: editingSong.movie,
            year: String(editingSong.year),
            moodTag: editingSong.moodTag,
            positionGuess: String(editingSong.positionGuess),
          }}
          onSave={handleEditSong}
          onCancel={() => setEditingId(null)}
        />
      )}
    </section>
  )
}

export default Setlist
