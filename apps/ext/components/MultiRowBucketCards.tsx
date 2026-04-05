import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

interface CardItem {
  id: string
  url: string
  title: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

interface MultiRowBucketCardsProps {
  cards: CardItem[]
  columns?: number
  columnGap?: number
  overflowClip?: number
  onCardClick?: (card: CardItem) => void
}

const CARD_SIZE = 80
const CARD_GAP = 60
const CARD_OFFSET_Y = 20
const HOVER_FLOAT_Y = -40
const HOVER_SPREAD_FACTOR = 15
const HOVER_BLEED_TOP = 28
const COLUMN_OFFSET_Y = 30

function getFaviconUrl(url: string): string {
  try {
    if (url.startsWith('#')) return ''
    const domain = new URL(url).origin
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

function getCardPosition(index: number, columns: number, columnGap: number) {
  const col = index % columns
  const row = Math.floor(index / columns)
  const x = col * CARD_GAP
  const y = row * (CARD_SIZE + columnGap) + (row > 0 ? -COLUMN_OFFSET_Y : 0)
  return { x, y, row, col }
}

export default function MultiRowBucketCards({
  cards,
  columns = 2,
  columnGap = 40,
  overflowClip = 30,
  onCardClick,
}: MultiRowBucketCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const totalCards = cards.length

  const maxRow = Math.ceil(totalCards / columns)
  const containerHeight = maxRow * (CARD_SIZE + columnGap) - columnGap + overflowClip

  return (
    <div
      className="relative h-full w-full overflow-visible"
      style={{
        clipPath: `inset(${HOVER_BLEED_TOP}px 0px ${overflowClip}px 0px round var(--ds-r2))`,
      }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 overflow-y-hidden scrollbar-hide"
        style={{ top: -HOVER_BLEED_TOP }}
      >
        <div
          className="relative"
          style={{
            width: columns * CARD_GAP + 100,
            height: containerHeight + HOVER_BLEED_TOP,
          }}
        >
          {cards.map((card, index) => {
            const meta = card
            const isHovered = hoveredIndex === index

            const distance = hoveredIndex !== null ? Math.abs(index - hoveredIndex) : 0
            const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0

            const currentPos = getCardPosition(index, columns, columnGap)
            const hoverPos = hoveredIndex !== null ? getCardPosition(hoveredIndex, columns, columnGap) : null

            const direction = index > hoveredIndex! ? 1 : -1
            const spreadX = spread * direction

            let spreadY = 0
            if (hoverPos) {
              const rowDiff = currentPos.row - hoverPos.row
              spreadY = rowDiff * HOVER_SPREAD_FACTOR * 0.5
            }

            const translateX = currentPos.x + meta.offsetX + spreadX
            const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + meta.offsetY + (isHovered ? HOVER_FLOAT_Y : 0) + spreadY
            const rotation = isHovered ? 0 : meta.rotation
            const zIndex = isHovered ? 99 : index

            return (
              <ContextMenu key={card.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className="absolute flex flex-col items-center justify-between p-2 rounded-xl border border-black/10 cursor-pointer transition-all duration-300 gap-1"
                    style={{
                      width: CARD_SIZE,
                      height: CARD_SIZE,
                      background: meta.bg,
                      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                      boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.12)',
                      zIndex,
                    }}
                    onClick={() => onCardClick?.(card)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {getFaviconUrl(card.url) && (
                      <img src={getFaviconUrl(card.url)} alt="" className="w-5 h-5 mt-1" />
                    )}
                    <div className="flex flex-col items-center flex-1 justify-center min-w-0">
                      <div className="font-medium text-[#1a1a1a] text-center leading-tight text-[10px] line-clamp-2">
                        {card.title}
                      </div>
                      <div className="text-[8px] text-[#1a1a1a]/60 truncate max-w-full mt-0.5">
                        {getDomain(card.url)}
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem className="text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>
      </div>
    </div>
  )
}