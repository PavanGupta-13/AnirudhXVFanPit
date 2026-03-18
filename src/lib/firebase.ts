import { initializeApp, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDoc,
  increment,
  Unsubscribe,
} from 'firebase/firestore'
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = (): boolean =>
  !!(firebaseConfig.apiKey && firebaseConfig.projectId)

let _app:  FirebaseApp | null = null
let _db:   Firestore   | null = null
let _auth: Auth        | null = null

function getApp(): FirebaseApp {
  if (!_app) _app = initializeApp(firebaseConfig)
  return _app
}

export const initFirebase = (): Firestore | null => {
  if (!isFirebaseConfigured()) return null
  if (_db) return _db
  try { _db = getFirestore(getApp()); return _db } catch { return null }
}

export const initAuth = (): Auth | null => {
  if (!isFirebaseConfigured()) return null
  if (_auth) return _auth
  try { _auth = getAuth(getApp()); return _auth } catch { return null }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signInWithGoogle = async (): Promise<User | null> => {
  const auth = initAuth()
  if (!auth) return null
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (e) {
    console.warn('Google sign-in failed:', e)
    return null
  }
}

export const signOut = async (): Promise<void> => {
  const auth = initAuth()
  if (auth) await firebaseSignOut(auth)
}

export const subscribeToAuthState = (cb: (user: User | null) => void): Unsubscribe => {
  const auth = initAuth()
  if (!auth) { cb(null); return () => {} }
  return onAuthStateChanged(auth, cb)
}

// ─── User profiles ────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string
  vibeName: string
  avatarColor: string
  photoURL?: string
}

export const saveUserProfile = async (db: Firestore, profile: UserProfile): Promise<void> => {
  await setDoc(doc(db, 'users', profile.uid), profile, { merge: true })
}

export const getUserProfile = async (db: Firestore, uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  uid: string
  nickname: string
  text: string
  createdAt: Date
  emojiCounts: Record<string, number>
  avatarColor: string
  photoURL?: string
}

export const sendChatMessage = async (
  db: Firestore,
  uid: string,
  nickname: string,
  text: string,
  avatarColor: string,
  photoURL?: string
): Promise<void> => {
  await addDoc(collection(db, 'messages'), {
    uid,
    nickname,
    text,
    createdAt: serverTimestamp(),
    emojiCounts: { '🔥': 0, '❤️': 0, '😭': 0, '🤯': 0 },
    avatarColor,
    photoURL: photoURL ?? null,
  })
}

export const subscribeToChatMessages = (
  db: Firestore,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        uid: d.data().uid ?? '',
        nickname: d.data().nickname,
        text: d.data().text,
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
        emojiCounts: d.data().emojiCounts ?? {},
        avatarColor: d.data().avatarColor ?? '#bf00ff',
        photoURL: d.data().photoURL ?? undefined,
      }))
    )
  })
}

export const reactToMessage = async (db: Firestore, messageId: string, emoji: string): Promise<void> => {
  await updateDoc(doc(db, 'messages', messageId), { [`emojiCounts.${emoji}`]: increment(1) })
}

// ─── Setlist ──────────────────────────────────────────────────────────────────

export const updateSongStatus = async (
  db: Firestore,
  songId: string,
  status: 'upcoming' | 'playing' | 'played'
): Promise<void> => {
  await updateDoc(doc(db, 'setlist', songId), { status })
}

export const upsertSong = async (db: Firestore, song: Record<string, unknown>): Promise<void> => {
  const id = song.id as string
  await setDoc(doc(db, 'setlist', id), song, { merge: true })
}

export const deleteSong = async (db: Firestore, songId: string): Promise<void> => {
  await deleteDoc(doc(db, 'setlist', songId))
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export const castVote = async (db: Firestore, songId: string, uid: string): Promise<void> => {
  await setDoc(doc(db, 'votes', `${uid}_${songId}`), { uid, songId, createdAt: serverTimestamp() })
  await updateDoc(doc(db, 'setlist', songId), { hypeCount: increment(1) })
}

export const removeVote = async (db: Firestore, songId: string, uid: string): Promise<void> => {
  await deleteDoc(doc(db, 'votes', `${uid}_${songId}`))
  await updateDoc(doc(db, 'setlist', songId), { hypeCount: increment(-1) })
}

export { collection, doc, onSnapshot, query, orderBy, limit }
export type { Firestore, Unsubscribe, User }
