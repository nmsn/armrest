import { Bookmark } from "@/lib/bookmarks"
import { BookmarkItem } from "@/components/shared/BookmarkItem"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onBookmarkClick: (url: string) => void
  emptyText?: string
}

export function BookmarkList({
  bookmarks,
  onBookmarkClick,
  emptyText = "暂无书签"
}: BookmarkListProps) {
  return (
    <div className="flex-1 min-w-0 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {bookmarks.length === 0 ? (
        <div className="h-full flex items-center justify-center text-[10px] text-muted">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1 p-2">
          {bookmarks.map((bookmark) => (
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
  )
}
