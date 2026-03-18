import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../hooks/useChat'
import AuthModal from './AuthModal'

const EMOJI_REACTIONS = ['🔥', '❤️', '😭', '🤯']
const QUICK_EMOJIS   = ['🔥', '❤️', '😭', '🤯', '🎵', '✨', '🎤', '💜']
const MAX_LENGTH = 300

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 5)    return 'just now'
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

const Chat: React.FC = () => {
  const { user, needsVibeName, logout } = useAuth()
  const { messages, sendMessage, reactEmoji, isConnected } = useChat(user)

  const [text, setText]               = useState('')
  const [sending, setSending]         = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAuthModal, setShowAuthModal]     = useState(false)
  const [showUserMenu, setShowUserMenu]       = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = useCallback(async () => {
    if (!text.trim() || sending || !user) return
    setSending(true)
    const ok = await sendMessage(text)
    if (ok) { setText(''); inputRef.current?.focus() }
    setSending(false)
  }, [text, sending, sendMessage, user])

  const handleEmojiPick = (emoji: string) => {
    setText((t) => t + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  // Not logged in at all
  if (!user) {
    return (
      <section id="chat" className="flex flex-col min-h-screen px-0 pt-8 pb-28">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card p-6 w-full max-w-xs text-center animate-bounce-in">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Fan Chat</h3>
            <p className="text-white/50 text-sm font-body mb-6">
              Sign in or pick a vibe name to chat live with fellow fans!
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary w-full text-white font-display font-bold py-3 text-sm"
            >
              Join the Chat 🎤
            </button>
          </div>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </section>
    )
  }

  // Needs vibe name (just signed in with Google)
  if (needsVibeName) {
    return (
      <section id="chat" className="flex flex-col min-h-screen px-0 pt-8 pb-28">
        <AuthModal forceVibeName />
      </section>
    )
  }

  return (
    <section id="chat" className="flex flex-col min-h-screen px-0 pt-8 pb-28">
      {/* Header */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white">Fan Chat</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span className="text-xs text-white/40 font-body">
                {isConnected ? 'Live · Real-time' : 'Local mode'}
              </span>
            </div>
          </div>

          {/* User avatar + menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu((p) => !p)}
              className="flex items-center gap-2 active:scale-95 transition-all"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-9 h-9 rounded-full border-2 border-neon-purple/50" />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-bold border-2 border-transparent"
                  style={{ background: user.avatarColor, borderColor: `${user.avatarColor}66` }}
                >
                  {getInitials(user.vibeName)}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-display font-semibold text-white leading-tight">{user.vibeName}</p>
                {!user.isAnonymous && <p className="text-[10px] text-white/30">Google</p>}
              </div>
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 top-12 w-40 glass-card py-2 z-20 animate-bounce-in"
                style={{ borderRadius: 14 }}
              >
                <button
                  onClick={() => { logout(); setShowUserMenu(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm font-display text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-divider mx-4 mb-4" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎵</div>
            <p className="text-white/30 font-body text-sm">Be the first to drop a message!</p>
          </div>
        )}

        {[...messages].reverse().map((msg) => {
          const isSelf = msg.uid === user.uid
          return (
            <div key={msg.id} className={`flex gap-2 animate-slide-up ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {msg.photoURL ? (
                <img src={msg.photoURL} alt={msg.nickname} className="w-8 h-8 rounded-full shrink-0 object-cover" style={{ minWidth: 32 }} />
              ) : (
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-display font-bold"
                  style={{ background: msg.avatarColor, minWidth: 32 }}
                >
                  {getInitials(msg.nickname)}
                </div>
              )}

              <div className={`max-w-[75%] flex flex-col gap-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                {!isSelf && (
                  <span className="text-xs text-white/40 font-display ml-1">{msg.nickname}</span>
                )}
                <div className={isSelf ? 'chat-bubble-self' : 'chat-bubble-other'} style={{ padding: '10px 14px' }}>
                  <p className="text-sm font-body text-white leading-relaxed break-words">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-2 flex-wrap ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[10px] text-white/25 font-mono">{timeAgo(msg.createdAt)}</span>
                  <div className="flex gap-1 flex-wrap">
                    {EMOJI_REACTIONS.map((emoji) => {
                      const count = msg.emojiCounts[emoji] ?? 0
                      return (
                        <button
                          key={emoji}
                          onClick={() => reactEmoji(msg.id, emoji)}
                          className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 transition-all active:scale-90 border border-white/5"
                        >
                          {emoji}{count > 0 && <span className="ml-0.5 text-white/50">{count}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="px-4 pt-3 pb-2" style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)' }}>
        {showEmojiPicker && (
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1 animate-slide-up">
            {QUICK_EMOJIS.map((e) => (
              <button key={e} onClick={() => handleEmojiPick(e)}
                className="text-xl shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                {e}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button onClick={() => setShowEmojiPicker((p) => !p)}
            className="w-10 h-10 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg active:scale-90 transition-all">
            😊
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Drop your vibe…"
              maxLength={MAX_LENGTH}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-purple text-sm font-body transition-all"
            />
            {text.length > 250 && (
              <span className="absolute right-3 bottom-3 text-[10px] text-white/30 font-mono">{MAX_LENGTH - text.length}</span>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center active:scale-90 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #bf00ff, #0066ff)', boxShadow: '0 0 15px rgba(191,0,255,0.4)' }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

export default Chat
