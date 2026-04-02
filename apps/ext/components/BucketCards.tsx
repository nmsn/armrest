import { useState } from 'react'

interface CardItem {
  url: string
  title: string
}

interface BucketCardsProps {
  cards?: CardItem[]
}

const defaultCards: CardItem[] = [
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

// Card dimensions
const CARD_SIZE = 80
const CARD_GAP = 60
const CARD_OFFSET_Y = 20

// Hover effects
const HOVER_FLOAT_Y = -20
const HOVER_SPREAD_FACTOR = 15

// Random ranges
const ROTATION_RANGE = 15
const OFFSET_X_RANGE = 40
const OFFSET_X_BIAS = 10
const OFFSET_Y_RANGE = 10
const OFFSET_Y_BIAS = 5

// Colors
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#2ECC71', '#E74C3C', '#3498DB', '#9B59B6',
  '#1ABC9C', '#F39C12', '#C0392B', '#8E44AD', '#16A085',
]

// Seed for deterministic random
const RANDOM_SEED = 42

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

interface CardMeta {
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

function generateCardMetas(count: number): CardMeta[] {
  const rand = seededRandom(RANDOM_SEED)
  return Array.from({ length: count }, () => ({
    bg: COLORS[Math.floor(rand() * COLORS.length)],
    rotation: Math.floor(rand() * ROTATION_RANGE * 2) - ROTATION_RANGE,
    offsetX: Math.floor(rand() * OFFSET_X_RANGE) - OFFSET_X_BIAS,
    offsetY: Math.floor(rand() * OFFSET_Y_RANGE) - OFFSET_Y_BIAS,
  }))
}

function getFaviconUrl(url: string): string {
  const domain = new URL(url).origin
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export default function BucketCards({
  cards = defaultCards,
}: BucketCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const metas = generateCardMetas(cards.length)

  return (
    <div className="relative h-full w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
      <div className="relative h-full" style={{ width: cards.length * CARD_GAP + 100 }}>
        {cards.map((card, i) => {
          const meta = metas[i]
          const baseOffset = i * CARD_GAP
          const isHovered = hoveredIndex === i

          const distance = hoveredIndex !== null ? Math.abs(i - hoveredIndex) : 0
          const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0
          const direction = i > hoveredIndex! ? 1 : -1

          const translateX = baseOffset + meta.offsetX + (isHovered ? 0 : spread * direction)
          const translateY = CARD_OFFSET_Y + meta.offsetY + (isHovered ? HOVER_FLOAT_Y : 0)
          const rotation = isHovered ? 0 : meta.rotation
          const zIndex = isHovered ? 99 : i

          return (
            <div
              key={i}
              className="absolute flex flex-col items-center justify-between p-2 rounded-xl border border-black/10 cursor-pointer transition-all duration-300 gap-1"
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                background: meta.bg,
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.12)',
                zIndex,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                src={getFaviconUrl(card.url)}
                alt=""
                className="w-5 h-5 mt-1"
              />
              <div className="flex flex-col items-center flex-1 justify-center min-w-0">
                <div className="font-medium text-[#1a1a1a] text-center leading-tight text-[10px] line-clamp-2">
                  {card.title}
                </div>
                <div className="text-[8px] text-[#1a1a1a]/60 truncate max-w-full mt-0.5">
                  {getDomain(card.url)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}