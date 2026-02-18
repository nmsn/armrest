import { Bookmark } from "@/lib/bookmarks"

interface BookmarkItemProps {
  bookmark: Bookmark
  onClick: (url: string) => void
  maxNameLength?: number
}

export function BookmarkItem({ bookmark, onClick, maxNameLength = 8 }: BookmarkItemProps) {
  return (
    <button
      onClick={() => onClick(bookmark.url)}
      className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-accent/5 transition-colors text-left group h-10"
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: bookmark.color || "#8B5CF6" }}
      >
        {bookmark.logo ? (
          <img
            src={bookmark.logo}
            alt=""
            className="w-full h-full rounded-md object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
            }}
          />
        ) : (
          <span className="text-white text-[9px] font-bold">
            {bookmark.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="truncate text-[10px] text-secondary group-hover:text-accent transition-colors font-normal">
        {bookmark.name.length > maxNameLength
          ? bookmark.name.slice(0, maxNameLength) + "..."
          : bookmark.name}
      </span>
    </button>
  )
}
