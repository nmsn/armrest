import { STORAGE_KEYS } from './constants'

export interface WordHistoryItem {
  id: string
  word: string
  phonetic: string
  meaning: string
  searchedAt: number
}

export interface WordHistoryState {
  cards: WordHistoryItem[]
  lastClearDate: string // 格式: 'YYYY-MM-DD'
}

const STORAGE_KEY = STORAGE_KEYS.WORD_HISTORY
const MAX_HISTORY_SIZE = 50

export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shouldClearHistory(state: WordHistoryState): boolean {
  const today = getTodayDate()
  return state.lastClearDate !== today
}

export async function getWordHistory(): Promise<WordHistoryState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as WordHistoryState | undefined
      if (!data) {
        const defaultState: WordHistoryState = {
          cards: [],
          lastClearDate: getTodayDate(),
        }
        resolve(defaultState)
      } else {
        resolve(data)
      }
    })
  })
}

export async function saveWordHistory(state: WordHistoryState): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: state }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export async function addWordHistory(item: WordHistoryItem): Promise<void> {
  const state = await getWordHistory()

  // Check if word already exists, remove it to update position
  const existingIndex = state.cards.findIndex((c) => c.word === item.word)
  if (existingIndex !== -1) {
    state.cards.splice(existingIndex, 1)
  }

  // Add to beginning
  state.cards.unshift(item)

  // Limit to 50 records
  if (state.cards.length > MAX_HISTORY_SIZE) {
    state.cards = state.cards.slice(0, MAX_HISTORY_SIZE)
  }

  await saveWordHistory(state)
}

export async function clearWordHistory(): Promise<void> {
  const state: WordHistoryState = {
    cards: [],
    lastClearDate: getTodayDate(),
  }
  await saveWordHistory(state)
}

export async function checkAndClearIfNeeded(): Promise<void> {
  const state = await getWordHistory()
  if (shouldClearHistory(state)) {
    await clearWordHistory()
  }
}