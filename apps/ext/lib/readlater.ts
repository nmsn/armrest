import { STORAGE_KEYS } from './constants'

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#2ECC71', '#E74C3C', '#3498DB', '#9B59B6',
  '#1ABC9C', '#F39C12', '#C0392B', '#8E44AD', '#16A085',
]

const RANDOM_SEED = 42
const ROTATION_RANGE = 15
const OFFSET_X_RANGE = 40
const OFFSET_X_BIAS = 10
const OFFSET_Y_RANGE = 10
const OFFSET_Y_BIAS = 5

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export interface ReadLaterCard {
  id: string
  url: string
  title: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

export interface ReadLaterState {
  cards: ReadLaterCard[]
  version: number
}

const STORAGE_KEY = STORAGE_KEYS.READ_LATER
const CURRENT_VERSION = 1

const DEFAULT_CARDS_DATA = [
  { url: 'https://github.com', title: 'GitHub' },
  { url: 'https://twitter.com', title: 'Twitter' },
  { url: 'https://youtube.com', title: 'YouTube' },
  { url: 'https://reddit.com', title: 'Reddit' },
  { url: 'https://notion.so', title: 'Notion' },
  { url: 'https://figstack.com', title: 'FigStack' },
  { url: 'https://claude.ai', title: 'Claude AI' },
  { url: 'https://linear.app', title: 'Linear' },
  { url: 'https://figma.com', title: 'Figma' },
  { url: 'https://stripe.com', title: 'Stripe' },
  { url: 'https://vercel.com', title: 'Vercel' },
  { url: 'https://tailwindcss.com', title: 'Tailwind CSS' },
  { url: 'https://drizzle.team', title: 'Drizzle ORM' },
  { url: 'https://hono.dev', title: 'Hono' },
]

function generateCardMeta(): { bg: string; rotation: number; offsetX: number; offsetY: number } {
  const rand = seededRandom(RANDOM_SEED)
  return {
    bg: COLORS[Math.floor(rand() * COLORS.length)],
    rotation: Math.floor(rand() * ROTATION_RANGE * 2) - ROTATION_RANGE,
    offsetX: Math.floor(rand() * OFFSET_X_RANGE) - OFFSET_X_BIAS,
    offsetY: Math.floor(rand() * OFFSET_Y_RANGE) - OFFSET_Y_BIAS,
  }
}

export function getDefaultCards(): ReadLaterCard[] {
  const rand = seededRandom(RANDOM_SEED)
  return DEFAULT_CARDS_DATA.map((card) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url: card.url,
    title: card.title,
    bg: COLORS[Math.floor(rand() * COLORS.length)],
    rotation: Math.floor(rand() * ROTATION_RANGE * 2) - ROTATION_RANGE,
    offsetX: Math.floor(rand() * OFFSET_X_RANGE) - OFFSET_X_BIAS,
    offsetY: Math.floor(rand() * OFFSET_Y_RANGE) - OFFSET_Y_BIAS,
  }))
}

export async function getReadLater(): Promise<ReadLaterState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as ReadLaterState | undefined
      if (!data || data.version !== CURRENT_VERSION) {
        const defaultState: ReadLaterState = {
          version: CURRENT_VERSION,
          cards: getDefaultCards(),
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
  state.cards.unshift(card) // 插入到最前面
  await saveReadLater(state)
}

export async function deleteReadLaterCard(id: string): Promise<void> {
  const state = await getReadLater()
  state.cards = state.cards.filter((c) => c.id !== id)
  await saveReadLater(state)
}
