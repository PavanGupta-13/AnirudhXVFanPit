# Rockstar Anirudh XV – Fan Companion App 🎵

> **15 Years With You** · Fan-made digital companion for the Hyderabad concert
> March 21, 2026 · 6:00 pm – 10:00 pm IST · Gachibowli Outdoor Stadium

---

## Features

| Feature | Description |
|---|---|
| ⏱️ Live Countdown | Real-time timer to concert start, auto-switches to "LIVE NOW" |
| 🎵 Setlist Tracker | 25 predicted songs, hype votes, admin live-update |
| 💬 Fan Chat | Anonymous real-time chat with emoji reactions |
| 📸 AR Selfie Filter | WebRTC camera + 3 filter modes + snap & download |
| 📊 Vibe Meter | Crowd energy bar based on chat + played songs |
| 📱 PWA | Install to home screen, works offline (shell) |

---

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- A Firebase project (free tier is fine)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd Concert-App
npm install        # or: bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase credentials (see below).

### 3. Run dev server

```bash
npm run dev        # or: bun dev
```

Open [http://localhost:5173](http://localhost:5173) on your phone or browser.

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (free Spark plan works)
3. Add a **Web App** — copy the config values into `.env`
4. Enable **Firestore Database** → Start in **Native mode**
5. Set Firestore **Security Rules** (paste below):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{msg} {
      allow read: if true;
      allow create: if request.resource.data.text.size() < 301
                    && request.resource.data.nickname.size() < 21;
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['emojiCounts']);
    }
    match /setlist/{song} {
      allow read: if true;
      allow write: if false; // admin writes via server/trusted client
    }
  }
}
```

> **Without Firebase configured**, the app falls back gracefully:
> Chat stores messages locally in `localStorage`, and the setlist is local-only.

---

## Admin Setlist Control

1. In any setlist view, tap the ⚙️ icon top-right
2. Enter the admin code (set via `VITE_ADMIN_CODE` in `.env`, default: `anirudh2026`)
3. Use ▶ to mark a song as "Playing Now", then "Done" to mark it played
4. Other visitors see real-time updates (requires Firebase)

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Preview locally:

```bash
npm run preview
```

---

## Deploy

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

- Set environment variables in Vercel dashboard → Project → Settings → Environment Variables
- Copy all `VITE_*` keys from `.env`

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build
```

Add env vars in: Netlify → Site → Environment variables

### Netlify `_redirects` (SPA routing)

Create `public/_redirects`:
```
/*  /index.html  200
```

---

## Project Structure

```
src/
├── components/
│   ├── Hero.tsx          # Hero section + background animations
│   ├── Countdown.tsx     # Live countdown timer component
│   ├── Setlist.tsx       # Setlist tracker with admin controls
│   ├── Chat.tsx          # Real-time fan chat
│   ├── SelfieCam.tsx     # WebRTC camera + AR filter overlay
│   ├── BottomNav.tsx     # Fixed mobile navigation bar
│   ├── VibeMeter.tsx     # Crowd energy meter
│   └── InfoSection.tsx   # Venue info + footer
├── hooks/
│   ├── useCountdown.ts   # Countdown logic
│   ├── useSetlist.ts     # Setlist state + Firebase sync
│   └── useChat.ts        # Chat messages + Firebase sync
├── data/
│   └── setlist.ts        # Initial song list (25 songs)
├── lib/
│   ├── firebase.ts       # Firebase init + Firestore helpers
│   └── profanity.ts      # Client-side message filter
├── App.tsx               # Root component + section routing
├── main.tsx              # React entry point
└── index.css             # Tailwind + custom glassmorphism styles
```

---

## Tech Stack

- **React 18** + **Vite 5** + **TypeScript**
- **Tailwind CSS 3** with custom neon/glass theme
- **Firebase Firestore** for real-time chat + optional setlist sync
- **WebRTC `getUserMedia`** for in-browser camera
- **canvas-confetti** for song-played celebrations
- **vite-plugin-pwa** for PWA/offline support

---

## Disclaimer

*This is an unofficial, fan-made companion app and is not affiliated with, endorsed by, or connected to any official event organizer, Anirudh Ravichander, or his management.*
