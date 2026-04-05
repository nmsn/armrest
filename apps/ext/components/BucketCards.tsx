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

interface BucketCardsProps {
  cards: CardItem[]
  onAddCard?: () => void
  onDeleteCard?: (id: string) => void
  showAddCard?: boolean
  columns?: number
  columnGap?: number
  overflowClip?: number
  onCardClick?: (card: CardItem) => void
}

// Card dimensions
const CARD_SIZE = 80
const CARD_GAP = 60
const CARD_OFFSET_Y = 20

// Hover effects
const HOVER_FLOAT_Y = -40
const HOVER_SPREAD_FACTOR = 15
const HOVER_BLEED_TOP = 28
const BOTTOM_CLIP = 0

// Multi-row mode
const COLUMN_OFFSET_Y = 30

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

function getCardPosition(index: number, columns: number) {
  const col = index % columns
  const row = Math.floor(index / columns)
  const x = col * CARD_GAP
  const y = row * (CARD_SIZE + (columns > 1 ? 40 : 60)) + (row > 0 ? -COLUMN_OFFSET_Y : 0)
  return { x, y, row, col }
}

export default function BucketCards({
  cards,
  onAddCard,
  onDeleteCard,
  showAddCard = false,
  columns = 1,
  columnGap = 60,
  overflowClip = 0,
  onCardClick,
}: BucketCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const totalSlots = cards.length + (showAddCard ? 1 : 0)

  const isMultiRow = columns > 1

  const containerHeight = isMultiRow
    ? columns * (CARD_SIZE + columnGap) - columnGap + overflowClip
    : 0

  const containerWidth = isMultiRow
    ? columns * CARD_GAP + 100
    : totalSlots * CARD_GAP + 100

  return (
    <div
      className="relative h-full w-full overflow-visible"
      style={{
        clipPath: isMultiRow
          ? `inset(${HOVER_BLEED_TOP}px 0px ${overflowClip}px 0px round var(--ds-r2))`
          : `inset(${-HOVER_BLEED_TOP}px 0px ${BOTTOM_CLIP}px 0px round var(--ds-r2))`,
      }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 overflow-y-hidden scrollbar-hide"
        style={{ top: -HOVER_BLEED_TOP }}
      >
        <div
          className="relative"
          style={{
            width: containerWidth,
            height: isMultiRow
              ? containerHeight + HOVER_BLEED_TOP
              : `calc(100% + ${HOVER_BLEED_TOP}px)`,
          }}
        >
          {Array.from({ length: totalSlots }, (_, i) => {
            if (i === 0 && showAddCard) {
              const isAddHovered = hoveredIndex === -1

              const distance = hoveredIndex !== null ? Math.abs(i - hoveredIndex) : 0
              const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0
              const direction = i > hoveredIndex! ? 1 : -1

              const pos = getCardPosition(0, columns)
              const translateX = pos.x + (isAddHovered ? 0 : spread * direction)
              const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + (isAddHovered ? HOVER_FLOAT_Y : 0)
              const zIndex = isAddHovered ? 99 : 0

              return (
                <div
                  key="add-card"
                  className="absolute flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-gray-400"
                  style={{
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    background: '#E5E7EB',
                    transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${isAddHovered ? 0 : 0}deg)`,
                    boxShadow: isAddHovered ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex,
                  }}
                  onClick={onAddCard}
                  onMouseEnter={() => setHoveredIndex(-1)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="text-2xl text-gray-500">+</span>
                </div>
              )
            }

            const cardIndex = showAddCard ? i - 1 : i
            const card = cards[cardIndex]
            const meta = card
            const isHovered = hoveredIndex === cardIndex

            const distance = hoveredIndex !== null ? Math.abs(cardIndex - hoveredIndex) : 0
            const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0

            const currentPos = getCardPosition(cardIndex, columns)
            const hoverPos = hoveredIndex !== null ? getCardPosition(hoveredIndex, columns) : null

            const direction = cardIndex > hoveredIndex! ? 1 : -1
            const spreadX = spread * direction

            let spreadY = 0
            if (hoverPos && isMultiRow) {
              const rowDiff = currentPos.row - hoverPos.row
              spreadY = rowDiff * HOVER_SPREAD_FACTOR * 0.5
            }

            const translateX = currentPos.x + meta.offsetX + spreadX
            const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + meta.offsetY + (isHovered ? HOVER_FLOAT_Y : 0) + spreadY
            const rotation = isHovered ? 0 : meta.rotation
            const zIndex = isHovered ? 99 : cardIndex

            return (
              <ContextMenu key={cardIndex}>
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
                    onMouseEnter={() => setHoveredIndex(cardIndex)}
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
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => onDeleteCard?.(card.id)}
                    className="text-red-500 focus:text-red-500"
                  >
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