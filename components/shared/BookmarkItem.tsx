import { useState } from "react"
import { Bookmark } from "@/lib/bookmarks"
import { BOOKMARK_CONFIG } from "@/lib/constants"

const BOOKMARK_COLORS = BOOKMARK_CONFIG.BOOKMARK_COLORS

function getRandomColor(colors: readonly string[]): string {
  return colors[Math.floor(Math.random() * colors.length)]
}

export type BookmarkItemSize = "sm" | "md" | "lg"

interface BookmarkItemProps {
  bookmark: Bookmark
  onClick: (url: string) => void
  size?: BookmarkItemSize
  maxNameLength?: number
}

const SIZE_CONFIG = {
  sm: {
    icon: "w-5 h-5 rounded-md text-[9px]",
    container: "gap-1 px-1 py-1",
    text: "text-[10px]",
  },
  md: {
    icon: "w-6 h-6 rounded-md text-xs",
    container: "gap-1.5 px-2 py-1.5",
    text: "text-xs",
  },
  lg: {
    icon: "w-11 h-11 rounded-xl text-sm",
    container: "gap-2 p-3",
    text: "text-sm",
  },
}

export function BookmarkItem({
  bookmark,
  onClick,
  size = "sm",
  maxNameLength = 8
}: BookmarkItemProps) {
  const [imgError, setImgError] = useState(false)

  const sizeClasses = SIZE_CONFIG[size]
  const showFallback = !bookmark.logo || imgError
  const displayName = bookmark.name.length > maxNameLength
    ? bookmark.name.slice(0, maxNameLength) + "..."
    : bookmark.name

  return (
    <button
      onClick={() => onClick(bookmark.url)}
      className={`flex flex-col items-center justify-center ${sizeClasses.container} rounded-lg hover:bg-accent/5 transition-colors cursor-pointer group w-full`}
    >
      <div
        className={`${sizeClasses.icon} flex items-center justify-center shrink-0`}
        style={{ backgroundColor: bookmark.color || getRandomColor(BOOKMARK_COLORS) }}
      >
        {showFallback ? (
          <span className="text-white font-bold">
            {bookmark.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <img
            src={bookmark.logo}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <span className={`truncate ${sizeClasses.text} text-foreground/70 group-hover:text-accent transition-colors font-normal w-full text-center`}>
        {displayName}
      </span>
    </button>
  )
}
