import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const serviceAccount = require('./serviceAccountKey.json')

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// ─── ADD YOUR SONGS HERE ───────────────────────────────────────────────────────
const songs = [
  {
    hypeCount: 0,
    id: "1",
    moodTag: "hype",
    movie: "Bigil",
    positionGuess: 1,
    status: "released",
    title: "Bigil Title Track",
    year: 2019
  },
  {
    hypeCount: 0,
    id: "2",
    moodTag: "hype",
    movie: "Vikram",
    positionGuess: 2,
    status: "released",
    title: "Vikram Title Track",
    year: 2022
  },
  {
    hypeCount: 0,
    id: "3",
    moodTag: "hype",
    movie: "Vikram",
    positionGuess: 3,
    status: "released",
    title: "Pathala Pathala",
    year: 2022
  },
  {
    hypeCount: 0,
    id: "4",
    moodTag: "hype",
    movie: "Master",
    positionGuess: 4,
    status: "released",
    title: "Vaathi Coming",
    year: 2021
  },
  {
    hypeCount: 0,
    id: "5",
    moodTag: "hype",
    movie: "Master",
    positionGuess: 5,
    status: "released",
    title: "Kutti Story",
    year: 2021
  },
  {
    hypeCount: 0,
    id: "6",
    moodTag: "hype",
    movie: "Jailer",
    positionGuess: 6,
    status: "released",
    title: "Hukum - Thalaivar Alappara",
    year: 2023
  },
  {
    hypeCount: 0,
    id: "7",
    moodTag: "hype",
    movie: "Kaththi",
    positionGuess: 7,
    status: "released",
    title: "Selfie Pulla",
    year: 2014
  },
  {
    hypeCount: 0,
    id: "8",
    moodTag: "hype",
    movie: "3",
    positionGuess: 8,
    status: "released",
    title: "Why This Kolaveri Di",
    year: 2012
  },
  {
    hypeCount: 0,
    id: "9",
    moodTag: "hype",
    movie: "DON",
    positionGuess: 9,
    status: "released",
    title: "Jalabulajangu",
    year: 2022
  },
  {
    hypeCount: 0,
    id: "10",
    moodTag: "hype",
    movie: "DON",
    positionGuess: 10,
    status: "released",
    title: "Private Party",
    year: 2022
  },
  {
    hypeCount: 0,
    id: "11",
    moodTag: "hype",
    movie: "Kaithi (Telugu Dub) / Vikram-verse",
    positionGuess: 11,
    status: "released",
    title: "Once Upon A Time",
    year: 2019
  },
  {
    hypeCount: 0,
    id: "12",
    moodTag: "hype",
    movie: "Agnyaathavaasi",
    positionGuess: 12,
    status: "released",
    title: "Gaali Vaaluga",
    year: 2018
  },
  {
    hypeCount: 0,
    id: "13",
    moodTag: "hype",
    movie: "Jawan (Telugu)",
    positionGuess: 13,
    status: "released",
    title: "Dhumme Dhulipelaa",
    year: 2023
  },
  {
    hypeCount: 0,
    id: "14",
    moodTag: "hype",
    movie: "Saaho (Telugu)",
    positionGuess: 14,
    status: "released",
    title: "Psycho Saiyaan",
    year: 2019
  },
  {
    hypeCount: 0,
    id: "15",
    moodTag: "hype",
    movie: "Devara Part 1 (Telugu)",
    positionGuess: 15,
    status: "upcoming",
    title: "Fear Song",
    year: 2024
  },
  {
    hypeCount: 0,
    id: "16",
    moodTag: "hype",
    movie: "Devara Part 1 (Telugu)",
    positionGuess: 16,
    status: "upcoming",
    title: "Daavudi",
    year: 2024
  },
  {
    hypeCount: 0,
    id: "17",
    moodTag: "hype",
    movie: "Devara Part 1 (Telugu)",
    positionGuess: 17,
    status: "upcoming",
    title: "Ayudha Pooja",
    year: 2024
  },
  {
    hypeCount: 0,
    id: "18",
    moodTag: "hype",
    movie: "Radhe Shyam (Telugu)",
    positionGuess: 18,
    status: "released",
    title: "Sanchari",
    year: 2022
  },
  {
    hypeCount: 0,
    id: "19",
    moodTag: "hype",
    movie: "Madharaasi (Telugu)",
    positionGuess: 19,
    status: "upcoming",
    title: "Selavika",
    year: 2025
  },
  {
    hypeCount: 0,
    id: "20",
    moodTag: "hype",
    movie: "Madharaasi (Telugu)",
    positionGuess: 20,
    status: "upcoming",
    title: "Varadhalle",
    year: 2025
  },
  {
    hypeCount: 0,
    id: "21",
    moodTag: "hype",
    movie: "Indian 2",
    positionGuess: 21,
    status: "upcoming",
    title: "Come Back Indian",
    year: 2024
  },
  {
    hypeCount: 0,
    id: "22",
    moodTag: "hype",
    movie: "Indian 2",
    positionGuess: 22,
    status: "upcoming",
    title: "Kadharalz",
    year: 2024
  },
  {
    hypeCount: 0,
    id: "23",
    moodTag: "hype",
    movie: "Coolie",
    positionGuess: 23,
    status: "upcoming",
    title: "Powerhouse",
    year: 2025
  },
  {
    hypeCount: 0,
    id: "24",
    moodTag: "hype",
    movie: "Kaathu Vaakula Rendu Kaadhal",
    positionGuess: 24,
    status: "released",
    title: "Two Two Two",
    year: 2021
  },
  {
    hypeCount: 0,
    id: "25",
    moodTag: "hype",
    movie: "Thiruchitrambalam",
    positionGuess: 25,
    status: "released",
    title: "Life Of Pazham",
    year: 2022
  }
]
// ──────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding ${songs.length} songs to Firestore...\n`)
  for (const song of songs) {
    await db.collection('setlist').doc(song.id).set(song)
    console.log(`✓  ${song.positionGuess}. ${song.title} (${song.movie})`)
  }
  console.log('\nDone! All songs written to Firestore.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})


// pavan avatar 
// https://lh3.googleusercontent.com/a/ACg8ocJSFPARm6sXjW7-ojJjswUnIPFv7Z8c5aTOheSKFyd35m7lZUl2=s96-c