import { useState } from "react"
import { Bookmark } from "@/lib/bookmarks"
import { BOOKMARK_CONFIG } from "@/lib/constants"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const BOOKMARK_COLORS = BOOKMARK_CONFIG.BOOKMARK_COLORS

function getRandomColor(colors: readonly string[]): string {
  return colors[Math.floor(Math.random() * colors.length)]
}

export type BookmarkItemSize = "sm" | "md" | "lg"

interface BookmarkItemProps {
  bookmark: Bookmark
  onClick: (url: string) => void
  onEdit?: (bookmark: Bookmark) => void
  onDelete?: (bookmark: Bookmark) => void
  size?: BookmarkItemSize
  maxNameLength?: number
}

const SIZE_CONFIG = {
  sm: {
    icon: "w-5 h-5 rounded-full text-[9px]",
    container: "gap-1 px-1 py-1",
    text: "text-[10px]",
  },
  md: {
    icon: "w-6 h-6 rounded-full text-xs",
    container: "gap-1.5 px-2 py-1.5",
    text: "text-xs",
  },
  lg: {
    icon: "w-8 h-8 rounded-full text-sm",
    container: "gap-1 p-1.5",
    text: "text-xs",
  },
}

export function BookmarkItem({
  bookmark,
  onClick,
  onEdit,
  onDelete,
  size = "sm",
  maxNameLength = 10
}: BookmarkItemProps) {
  const [imgError, setImgError] = useState(false)

  const sizeClasses = SIZE_CONFIG[size]
  const showFallback = !bookmark.logo || imgError
  const displayName = bookmark.name.length > maxNameLength
    ? bookmark.name.slice(0, maxNameLength) + "..."
    : bookmark.name

  const tooltipText = bookmark.description
    ? `${bookmark.name}\n${bookmark.description}`
    : bookmark.name

  const buttonContent = (
    <button
      onClick={() => onClick(bookmark.url)}
      title={tooltipText}
      className={`flex flex-col items-center justify-center aspect-square ${sizeClasses.container} rounded-lg hover:bg-accent/5 transition-colors cursor-pointer group w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
    >
      <div
        className={`${sizeClasses.icon} flex items-center justify-center shrink-0`}
        style={{ backgroundColor: bookmark.logo ? '' : (bookmark.color || getRandomColor(BOOKMARK_COLORS)) }}
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
      <span className={`truncate ${sizeClasses.text} text-foreground/80 group-hover:text-accent transition-colors font-normal w-full text-center`}>
        {displayName}
      </span>
    </button>
  )

  const hasContextMenu = onEdit || onDelete

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {hasContextMenu ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              {buttonContent}
            </ContextMenuTrigger>
            <ContextMenuContent>
              {onEdit && (
                <ContextMenuItem onClick={() => onEdit(bookmark)}>
                  编辑
                </ContextMenuItem>
              )}
              {onDelete && (
                <ContextMenuItem onClick={() => onDelete(bookmark)} className="text-red-500 focus:text-red-500">
                  删除
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          buttonContent
        )}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="font-medium">{bookmark.name}</div>
        {bookmark.description && (
          <div className="text-muted-foreground text-xs mt-0.5">{bookmark.description}</div>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
