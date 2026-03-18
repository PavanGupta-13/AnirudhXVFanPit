export type MoodTag = 'banger' | 'feels' | 'mass' | 'nostalgic' | 'hype'
export type SongStatus = 'upcoming' | 'playing' | 'played'

export interface Song {
  id: string
  title: string
  movie: string
  year: number
  moodTag: MoodTag
  status: SongStatus
  positionGuess: number
  hypeCount: number
}

export const INITIAL_SETLIST: Song[] = [
  { id: '1',  title: 'Why This Kolaveri Di',     movie: '3',                    year: 2012, moodTag: 'banger',    status: 'upcoming', positionGuess: 1,  hypeCount: 0 },
  { id: '2',  title: 'Nenje Ezhu',               movie: 'Maryan',               year: 2013, moodTag: 'feels',     status: 'upcoming', positionGuess: 2,  hypeCount: 0 },
  { id: '3',  title: 'Kannazhaga',               movie: '3',                    year: 2012, moodTag: 'feels',     status: 'upcoming', positionGuess: 3,  hypeCount: 0 },
  { id: '4',  title: 'Unakkena Vechi Nenjam',    movie: 'Raja Rani',            year: 2013, moodTag: 'nostalgic', status: 'upcoming', positionGuess: 4,  hypeCount: 0 },
  { id: '5',  title: 'Kanave Kanave',            movie: 'David',                year: 2013, moodTag: 'feels',     status: 'upcoming', positionGuess: 5,  hypeCount: 0 },
  { id: '6',  title: 'Mersalaayiten',            movie: 'I',                    year: 2015, moodTag: 'mass',      status: 'upcoming', positionGuess: 6,  hypeCount: 0 },
  { id: '7',  title: 'Strawberry Kannae',        movie: 'Thaandavam',           year: 2012, moodTag: 'nostalgic', status: 'upcoming', positionGuess: 7,  hypeCount: 0 },
  { id: '8',  title: 'Thaarame Thaarame',        movie: '96',                   year: 2018, moodTag: 'feels',     status: 'upcoming', positionGuess: 8,  hypeCount: 0 },
  { id: '9',  title: 'Isaignani',                movie: '96',                   year: 2018, moodTag: 'nostalgic', status: 'upcoming', positionGuess: 9,  hypeCount: 0 },
  { id: '10', title: 'Chellamma',                movie: 'Doctor',               year: 2021, moodTag: 'banger',    status: 'upcoming', positionGuess: 10, hypeCount: 0 },
  { id: '11', title: 'Vaathi Coming',            movie: 'Master',               year: 2021, moodTag: 'mass',      status: 'upcoming', positionGuess: 11, hypeCount: 0 },
  { id: '12', title: 'Master the Blaster',       movie: 'Master',               year: 2021, moodTag: 'hype',      status: 'upcoming', positionGuess: 12, hypeCount: 0 },
  { id: '13', title: 'Kutti Story',              movie: 'Master',               year: 2021, moodTag: 'banger',    status: 'upcoming', positionGuess: 13, hypeCount: 0 },
  { id: '14', title: 'Pathala Pathala',          movie: 'Vikram',               year: 2022, moodTag: 'hype',      status: 'upcoming', positionGuess: 14, hypeCount: 0 },
  { id: '15', title: 'Rolex Theme',             movie: 'Vikram',               year: 2022, moodTag: 'mass',      status: 'upcoming', positionGuess: 15, hypeCount: 0 },
  { id: '16', title: 'Naa Ready',               movie: 'Leo',                  year: 2023, moodTag: 'mass',      status: 'upcoming', positionGuess: 16, hypeCount: 0 },
  { id: '17', title: 'Anbe Anbe',               movie: 'Leo',                  year: 2023, moodTag: 'feels',     status: 'upcoming', positionGuess: 17, hypeCount: 0 },
  { id: '18', title: 'Kaavaalaa',               movie: 'Jailer',               year: 2023, moodTag: 'banger',    status: 'upcoming', positionGuess: 18, hypeCount: 0 },
  { id: '19', title: 'Jailer Title Track',      movie: 'Jailer',               year: 2023, moodTag: 'mass',      status: 'upcoming', positionGuess: 19, hypeCount: 0 },
  { id: '20', title: 'Oru Pakka Kathai',        movie: 'Naan Sirithal',        year: 2020, moodTag: 'feels',     status: 'upcoming', positionGuess: 20, hypeCount: 0 },
  { id: '21', title: 'Vaa Machan Vaa',          movie: 'Velaiilla Pattadhari', year: 2014, moodTag: 'hype',      status: 'upcoming', positionGuess: 21, hypeCount: 0 },
  { id: '22', title: 'Aalaporan Thamizhan',     movie: 'Mersal',               year: 2017, moodTag: 'mass',      status: 'upcoming', positionGuess: 22, hypeCount: 0 },
  { id: '23', title: 'Bigil Title Track',       movie: 'Bigil',                year: 2019, moodTag: 'hype',      status: 'upcoming', positionGuess: 23, hypeCount: 0 },
  { id: '24', title: 'Singapenne',              movie: 'Bigil',                year: 2019, moodTag: 'banger',    status: 'upcoming', positionGuess: 24, hypeCount: 0 },
  { id: '25', title: 'Surviva',                 movie: 'Vivegam',              year: 2017, moodTag: 'hype',      status: 'upcoming', positionGuess: 25, hypeCount: 0 },
]

export const MOOD_COLORS: Record<MoodTag, string> = {
  banger:    'mood-banger',
  feels:     'mood-feels',
  mass:      'mood-mass',
  nostalgic: 'mood-nostalgic',
  hype:      'mood-hype',
}

export const MOOD_LABELS: Record<MoodTag, string> = {
  banger:    '🔥 Banger',
  feels:     '💙 Feels',
  mass:      '👊 Mass',
  nostalgic: '✨ Nostalgic',
  hype:      '⚡ Hype',
}
