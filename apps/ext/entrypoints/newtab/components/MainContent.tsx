import { BookmarkGrid } from "./BookmarkGrid"
import { InfoRow } from "./InfoRow"
import type { Bookmark } from "@/lib/bookmarks"

interface MainContentProps {
  bookmarks: Bookmark[]
  direction: number
  onBookmarkClick: (url: string) => void
  onAddBookmark: () => void
  onEditBookmark?: (bookmark: Bookmark) => void
  onDeleteBookmark?: (bookmark: Bookmark) => void
}

export function MainContent({
  bookmarks,
  direction,
  onBookmarkClick,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
}: MainContentProps) {
  return (
    <div className="app-main overflow-y-auto">
      {/* Bookmarks */}
      <div className="app-card" style={{ height: "256px" }}>
        <div className="app-card-header">
          <span className="app-card-title">Bookmarks</span>
          <button onClick={onAddBookmark} className="app-card-action">
            Edit
          </button>
        </div>
        <BookmarkGrid
          bookmarks={bookmarks}
          direction={direction}
          onBookmarkClick={onBookmarkClick}
          onAddBookmark={onAddBookmark}
          onEditBookmark={onEditBookmark}
          onDeleteBookmark={onDeleteBookmark}
        />
      </div>

      {/* News + Word + Quote */}
      <InfoRow />
    </div>
  )
}
