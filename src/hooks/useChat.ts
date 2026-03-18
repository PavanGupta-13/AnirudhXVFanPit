import { useState, useEffect, useCallback } from 'react'
import {
  initFirebase,
  sendChatMessage,
  subscribeToChatMessages,
  reactToMessage,
  ChatMessage,
} from '../lib/firebase'
import { filterText, truncateMessage } from '../lib/profanity'
import { AuthUser } from '../contexts/AuthContext'

const LS_MESSAGES = 'anirudh_xv_messages'

function localMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LS_MESSAGES)
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[]
      return parsed.map((m) => ({ ...m, createdAt: new Date(m.createdAt) }))
    }
  } catch {/* ignore */}
  return []
}

export function useChat(authUser: AuthUser | null) {
  const [messages, setMessages]     = useState<ChatMessage[]>(localMessages)
  const [isConnected, setConnected] = useState(false)

  useEffect(() => {
    const db = initFirebase()
    if (!db) { setConnected(false); return }
    setConnected(true)
    const unsub = subscribeToChatMessages(db, setMessages)
    return unsub
  }, [])

  useEffect(() => {
    if (!isConnected) {
      try { localStorage.setItem(LS_MESSAGES, JSON.stringify(messages)) } catch {/* */}
    }
  }, [messages, isConnected])

  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!authUser || !text.trim()) return false
    const clean = truncateMessage(filterText(text))
    const db = initFirebase()
    if (db) {
      try {
        await sendChatMessage(db, authUser.uid, authUser.vibeName, clean, authUser.avatarColor, authUser.photoURL)
        return true
      } catch (e) { console.warn('send failed:', e) }
    }
    // Local fallback
    const msg: ChatMessage = {
      id: Date.now().toString(),
      uid: authUser.uid,
      nickname: authUser.vibeName,
      text: clean,
      createdAt: new Date(),
      emojiCounts: { '🔥': 0, '❤️': 0, '😭': 0, '🤯': 0 },
      avatarColor: authUser.avatarColor,
      photoURL: authUser.photoURL,
    }
    setMessages((prev) => [msg, ...prev].slice(0, 50))
    return true
  }, [authUser])

  const reactEmoji = useCallback(async (messageId: string, emoji: string) => {
    const db = initFirebase()
    if (db) {
      await reactToMessage(db, messageId, emoji).catch(console.warn)
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, emojiCounts: { ...m.emojiCounts, [emoji]: (m.emojiCounts[emoji] ?? 0) + 1 } }
            : m
        )
      )
    }
  }, [])

  return { messages, sendMessage, reactEmoji, isConnected }
}
