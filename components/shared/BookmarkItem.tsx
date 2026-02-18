import { useState } from "react"
import { Bookmark } from "@/lib/bookmarks"

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
    container: "gap-1.5 px-2 py-1.5 h-10",
    text: "text-[10px]",
  },
  md: {
    icon: "w-8 h-8 rounded-lg text-xs",
    container: "gap-2 px-3 py-2 h-14",
    text: "text-xs",
  },
  lg: {
    icon: "w-11 h-11 rounded-xl text-sm",
    container: "gap-3 p-4 h-auto",
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
        style={{ backgroundColor: bookmark.color || "#8B5CF6" }}
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
      <span className={`truncate ${sizeClasses.text} text-secondary group-hover:text-accent transition-colors font-normal w-full text-center`}>
        {displayName}
      </span>
    </button>
  )
}
