import { useMemo } from "react"
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bookmark } from "@/lib/bookmarks"
import { BookmarkItem } from "@/components/shared/BookmarkItem"
import { AddBookmarkButton } from "./AddBookmarkButton"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onBookmarkClick: (url: string) => void
  onAddBookmark: () => void
  onEditBookmark?: (bookmark: Bookmark) => void
  onDeleteBookmark?: (bookmark: Bookmark) => void
}

interface SortableBookmarkItemProps {
  bookmark: Bookmark
  onBookmarkClick: (url: string) => void
  onEdit?: (bookmark: Bookmark) => void
  onDelete?: (bookmark: Bookmark) => void
}

const BOOKMARK_DRAG_ID_PREFIX = "bookmark:"

export function getBookmarkDragId(bookmarkId: string): string {
  return `${BOOKMARK_DRAG_ID_PREFIX}${bookmarkId}`
}

function SortableBookmarkItem({ bookmark, onBookmarkClick, onEdit, onDelete }: SortableBookmarkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getBookmarkDragId(bookmark.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <BookmarkItem
        bookmark={bookmark}
        onClick={onBookmarkClick}
        onEdit={onEdit}
        onDelete={onDelete}
        size="lg"
        maxNameLength={20}
      />
    </div>
  )
}

export function BookmarkList({ bookmarks, onBookmarkClick, onAddBookmark, onEditBookmark, onDeleteBookmark }: BookmarkListProps) {
  const itemIds = useMemo(
    () => bookmarks.map((bookmark) => getBookmarkDragId(bookmark.id)),
    [bookmarks]
  )

  return (
    <SortableContext items={itemIds} strategy={rectSortingStrategy}>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gridTemplateRows: "80px" }}>
        {bookmarks.map((bookmark) => (
          <SortableBookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            onBookmarkClick={onBookmarkClick}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
        ))}
        <AddBookmarkButton onClick={onAddBookmark} />
      </div>
    </SortableContext>
  )
}
