import { STORAGE_KEYS } from './constants'

export interface WordHistoryItem {
  id: string
  word: string
  phonetic: string
  meaning: string
  searchedAt: number
  rotation: number
  offsetX: number
  offsetY: number
}

export interface WordHistoryState {
  cards: WordHistoryItem[]
  lastClearDate: string
}

const STORAGE_KEY = STORAGE_KEYS.WORD_HISTORY
const MAX_HISTORY_SIZE = 50

export async function getWordHistory(): Promise<WordHistoryState> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as WordHistoryState | undefined
      if (!data) {
        resolve({ cards: [], lastClearDate: getTodayDate() })
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

  const existingIndex = state.cards.findIndex((c) => c.word === item.word)
  if (existingIndex !== -1) {
    state.cards.splice(existingIndex, 1)
  }

  state.cards.unshift(item)

  if (state.cards.length > MAX_HISTORY_SIZE) {
    state.cards = state.cards.slice(0, MAX_HISTORY_SIZE)
  }

  await saveWordHistory(state)
}

export async function clearWordHistory(): Promise<void> {
  await saveWordHistory({ cards: [], lastClearDate: getTodayDate() })
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function shouldClearHistory(state: WordHistoryState): boolean {
  const today = getTodayDate()
  return state.lastClearDate !== today
}

export async function checkAndClearIfNeeded(): Promise<void> {
  const state = await getWordHistory()
  if (shouldClearHistory(state)) {
    await clearWordHistory()
  }
}