import { useState } from 'react'

interface CardItem {
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
  showAddCard?: boolean
}

// Card dimensions
// Base square size for each card.
const CARD_SIZE = 80
// Horizontal distance between card anchors.
const CARD_GAP = 60
// Baseline Y offset inside the bucket area.
const CARD_OFFSET_Y = 20

// Hover effects
// How much hovered card moves up (negative = upward).
const HOVER_FLOAT_Y = -40
// How much neighboring cards spread out from hovered card.
const HOVER_SPREAD_FACTOR = 15
// Extra top room reserved so hovered cards can "break out" upward.
const HOVER_BLEED_TOP = 28
// Bottom clipping amount to keep card bottoms hidden by the bucket edge.
const BOTTOM_CLIP = 0

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
  cards,
  onAddCard,
  showAddCard = false,
}: BucketCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const totalSlots = cards.length + (showAddCard ? 1 : 0)

  return (
    <div
      className="relative h-full w-full overflow-visible"
      style={{
        clipPath: `inset(${-HOVER_BLEED_TOP}px 0px ${BOTTOM_CLIP}px 0px round var(--ds-r2))`,
      }}
    >
      <div
        className="absolute left-0 right-0 bottom-0 overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ top: -HOVER_BLEED_TOP }}
      >
        <div
          className="relative"
          style={{
            width: totalSlots * CARD_GAP + 100,
            height: `calc(100% + ${HOVER_BLEED_TOP}px)`,
          }}
        >
          {Array.from({ length: totalSlots }, (_, i) => {
            // If first slot and showAddCard, render the add card placeholder
            if (i === 0 && showAddCard) {
              return (
                <div
                  key="add-card"
                  className="absolute flex flex-col items-center justify-center p-2 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-gray-400"
                  style={{
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                    background: '#E5E7EB',
                    transform: `translateX(0px) translateY(${HOVER_BLEED_TOP + CARD_OFFSET_Y}px) rotate(0deg)`,
                    zIndex: 0,
                  }}
                  onClick={onAddCard}
                >
                  <span className="text-2xl text-gray-500">+</span>
                </div>
              )
            }

            // Regular card
            const cardIndex = showAddCard ? i - 1 : i
            const card = cards[cardIndex]
            const meta = card
            const baseOffset = cardIndex * CARD_GAP
            const isHovered = hoveredIndex === cardIndex

            const distance = hoveredIndex !== null ? Math.abs(cardIndex - hoveredIndex) : 0
            const spread = hoveredIndex !== null ? distance * HOVER_SPREAD_FACTOR : 0
            const direction = cardIndex > hoveredIndex! ? 1 : -1

            const translateX = baseOffset + meta.offsetX + (isHovered ? 0 : spread * direction)
            const translateY = HOVER_BLEED_TOP + CARD_OFFSET_Y + meta.offsetY + (isHovered ? HOVER_FLOAT_Y : 0)
            const rotation = isHovered ? 0 : meta.rotation
            const zIndex = isHovered ? 99 : cardIndex

            return (
              <div
                key={cardIndex}
                className="absolute flex flex-col items-center justify-between p-2 rounded-xl border border-black/10 cursor-pointer transition-all duration-300 gap-1"
                style={{
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  background: meta.bg,
                  transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
                  boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.12)',
                  zIndex,
                }}
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
            )
          })}
        </div>
      </div>
    </div>
  )
}