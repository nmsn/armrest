import { useMemo } from "react"
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bookmark } from "@/lib/bookmarks"
import { BookmarkItem } from "@/components/shared/BookmarkItem"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onBookmarkClick: (url: string) => void
}

interface SortableBookmarkItemProps {
  bookmark: Bookmark
  onBookmarkClick: (url: string) => void
}

const BOOKMARK_DRAG_ID_PREFIX = "bookmark:"

export function getBookmarkDragId(bookmarkId: string): string {
  return `${BOOKMARK_DRAG_ID_PREFIX}${bookmarkId}`
}

function SortableBookmarkItem({ bookmark, onBookmarkClick }: SortableBookmarkItemProps) {
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
        size="lg"
        maxNameLength={20}
      />
    </div>
  )
}

export function BookmarkList({ bookmarks, onBookmarkClick }: BookmarkListProps) {
  const itemIds = useMemo(
    () => bookmarks.map((bookmark) => getBookmarkDragId(bookmark.id)),
    [bookmarks]
  )

  return (
    <SortableContext items={itemIds} strategy={rectSortingStrategy}>
      <div className="grid grid-cols-5 gap-3">
        {bookmarks.map((bookmark) => (
          <SortableBookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            onBookmarkClick={onBookmarkClick}
          />
        ))}
      </div>
    </SortableContext>
  )
}
