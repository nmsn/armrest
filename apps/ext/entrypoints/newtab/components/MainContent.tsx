import { SearchBar } from "./SearchBar"
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
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
  onSearchKeyDown: (e: React.KeyboardEvent) => void
  intentDisplayText?: string
}

export function MainContent({
  bookmarks,
  direction,
  onBookmarkClick,
  onAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onSearchKeyDown,
  intentDisplayText,
}: MainContentProps) {
  return (
    <div className="app-main overflow-y-auto">
      {/* Search */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSearch={onSearch}
        onSearchKeyDown={onSearchKeyDown}
        intentDisplayText={intentDisplayText}
      />

      {/* Bookmarks */}
      <div className="app-card" style={{ height: "256px" }}>
        <div className="app-card-header">
          <span className="app-card-title">Bookmarks</span>
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
