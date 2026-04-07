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
  phonetic?: string
  bg: string
  rotation: number
  offsetX: number
  offsetY: number
}

interface MultiRowBucketCardsProps {
  cards: CardItem[]
  columns?: number
  onCardClick?: (card: CardItem) => void
}

// Animation constants
const SCALE_HOVERED = 1.15
const SCALE_DEFAULT = 1.05
const HOVER_TRANSLATE_Y = -25
const SPREAD_SAME_ROW = 15
const SPREAD_ADJACENT_ROW_X = 8
const SPREAD_ADJACENT_ROW_Y = -12
const SPREAD_FURTHER_X = 4
const SPREAD_FURTHER_Y = -6
const TRANSITION_TIMING = '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'

function getFaviconUrl(url: string): string {
  try {
    if (url.startsWith('#')) return ''
    const domain = new URL(url).origin
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

function getSpreadOffset(index: number, hovered: number | null, columns: number): { x: number; y: number } {
  if (hovered === null || index === hovered) return { x: 0, y: 0 }

  const hRow = Math.floor(hovered / columns)
  const iRow = Math.floor(index / columns)
  const hCol = hovered % columns
  const iCol = index % columns

  const rowDiff = iRow - hRow
  const colDiff = iCol - hCol

  // Same row: spread horizontally
  if (rowDiff === 0) {
    return { x: colDiff * SPREAD_SAME_ROW, y: 0 }
  }
  // Adjacent row: spread vertically
  if (Math.abs(rowDiff) === 1) {
    return { x: colDiff * SPREAD_ADJACENT_ROW_X, y: rowDiff * SPREAD_ADJACENT_ROW_Y }
  }
  // Further away: slight offset
  return { x: colDiff * SPREAD_FURTHER_X, y: rowDiff * SPREAD_FURTHER_Y }
}

export default function MultiRowBucketCards({
  cards,
  columns = 3,
  onCardClick,
}: MultiRowBucketCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const rowCount = Math.ceil(cards.length / columns)

  return (
    <div className="relative h-full w-full mt-5">
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rowCount}, auto)`,
          gap: '8px',
          padding: '16px',
          alignContent: 'end',
        }}
      >
        {cards.map((card, index) => {
          const meta = card
          const isHovered = hoveredIndex === index

          const spread = getSpreadOffset(index, hoveredIndex, columns)
          const hoverTranslate = isHovered ? HOVER_TRANSLATE_Y : 0

          // Calculate visual row: cards fill from bottom (rowCount) upward
          const logicalRow = Math.floor(index / columns)
          const visualRow = rowCount - logicalRow

          return (
            <ContextMenu key={card.id}>
              <ContextMenuTrigger asChild>
                <div
                  className="flex flex-col items-center justify-between p-2 rounded-xl border border-black/10 cursor-pointer"
                  style={{
                    background: meta.bg,
                    gridRow: `${visualRow} / span 1`,
                    transform: `
                      scale(${isHovered ? SCALE_HOVERED : SCALE_DEFAULT})
                      rotate(${meta.rotation}deg)
                      translate(calc(${meta.offsetX}px + ${spread.x}px), calc(${meta.offsetY}px + ${spread.y}px + ${hoverTranslate}px))
                    `,
                    transformOrigin: 'center center',
                    boxShadow: isHovered
                      ? '0 20px 40px rgba(0,0,0,0.25)'
                      : '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex: isHovered ? 99 : index,
                    transition: `transform ${TRANSITION_TIMING}, box-shadow 0.3s ease`,
                  }}
                  onClick={() => onCardClick?.(card)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {getFaviconUrl(card.url) && (
                    <img src={getFaviconUrl(card.url)} alt="" className="w-5 h-5 mt-1" />
                  )}
                  <div className="flex flex-col items-center flex-1 justify-center min-w-0 w-full px-1">
                    <div className="font-medium text-[#1a1a1a] text-center leading-tight text-[10px] line-clamp-2">
                      {card.title}
                    </div>
                    <div className="text-[8px] text-[#1a1a1a]/60 truncate max-w-full">
                      {card.phonetic}
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
  )
}