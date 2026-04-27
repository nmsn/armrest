import { STORAGE_KEYS } from './constants'

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#2ECC71', '#E74C3C', '#3498DB', '#9B59B6',
  '#1ABC9C', '#F39C12', '#C0392B', '#8E44AD', '#16A085',
]

export interface ReadLaterCard {
  id: string
  url: string
  title: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

export function generateRandomCardVisual(): Pick<ReadLaterCard, 'bg' | 'rotation' | 'offsetX' | 'offsetY'> {
  return {
    bg: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.floor(Math.random() * 30) - 15,
    offsetX: Math.floor(Math.random() * 40) - 10,
    offsetY: Math.floor(Math.random() * 10) - 5,
  }
}

export interface ReadLaterState {
  cards: ReadLaterCard[]
  version: number
}

const STORAGE_KEY = STORAGE_KEYS.READ_LATER
const CURRENT_VERSION = 1

export async function getReadLater(): Promise<ReadLaterState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as ReadLaterState | undefined
      if (!data || data.version !== CURRENT_VERSION) {
        const defaultState: ReadLaterState = {
          version: CURRENT_VERSION,
          cards: [],
        }
        chrome.storage.sync.set({ [STORAGE_KEY]: defaultState })
        resolve(defaultState)
      } else {
        resolve(data)
      }
    })
  })
}

export async function saveReadLater(state: ReadLaterState): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: state }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export async function addReadLaterCard(card: ReadLaterCard): Promise<void> {
  const state = await getReadLater()
  state.cards.unshift(card)
  await saveReadLater(state)
}

export async function deleteReadLaterCard(id: string): Promise<void> {
  const state = await getReadLater()
  state.cards = state.cards.filter((c) => c.id !== id)
  await saveReadLater(state)
}
