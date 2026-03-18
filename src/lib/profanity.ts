// Minimal client-side profanity filter
const BAD_WORDS = ['spam', 'hate', 'abuse']

export const filterText = (text: string): string => {
  let filtered = text.trim()
  BAD_WORDS.forEach((word) => {
    const re = new RegExp(`\\b${word}\\b`, 'gi')
    filtered = filtered.replace(re, '***')
  })
  return filtered
}

export const truncateMessage = (text: string, maxLen = 300): string =>
  text.length > maxLen ? text.slice(0, maxLen) + '…' : text
