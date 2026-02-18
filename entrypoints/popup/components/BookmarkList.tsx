import { ChevronLeft, ChevronRight } from "lucide-react"
import { Bookmark } from "@/lib/bookmarks"
import { BookmarkItem } from "@/components/shared/BookmarkItem"

interface BookmarkListProps {
  bookmarks: Bookmark[]
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
  itemsPerPage = 8,
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
          <div className="grid grid-cols-4 gap-1">
            {paginatedBookmarks.map((bookmark) => (
              <BookmarkItem
                key={bookmark.id}
                bookmark={bookmark}
                onClick={onBookmarkClick}
                size="sm"
                maxNameLength={8}
              />
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
