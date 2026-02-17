import { ChevronLeft, ChevronRight } from "lucide-react"

interface BookmarkItem {
  id: string
  name: string
  url: string
  logo?: string
  color?: string
}

interface BookmarkListProps {
  bookmarks: BookmarkItem[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onBookmarkClick: (url: string) => void
  itemsPerPage?: number
  emptyText?: string
}

export function BookmarkList({
  bookmarks,
  currentPage,
  totalPages,
  onPageChange,
  onBookmarkClick,
  itemsPerPage = 10,
  emptyText = "No bookmarks"
}: BookmarkListProps) {
  const paginatedBookmarks = bookmarks.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  )

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto p-2">
        {paginatedBookmarks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] text-muted">
            {emptyText}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1">
            {paginatedBookmarks.map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => onBookmarkClick(bookmark.url)}
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
                  {bookmark.name.length > 8
                    ? bookmark.name.slice(0, 8) + "..."
                    : bookmark.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="py-1.5 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="p-0.5 rounded hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed text-muted hover:text-accent"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-muted">
            {currentPage + 1}/{totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="p-0.5 rounded hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed text-muted hover:text-accent"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
