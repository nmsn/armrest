import { useMemo } from "react"
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import { Bookmark } from "@/lib/bookmarks"
import { BookmarkItem } from "@/components/shared/BookmarkItem"
import { cn } from "@/lib/utils"

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
      <div className="grid grid-cols-6 gap-3">
        {bookmarks.map((bookmark) => (
          <SortableBookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            onBookmarkClick={onBookmarkClick}
            onEdit={onEditBookmark}
            onDelete={onDeleteBookmark}
          />
        ))}
        <button
          onClick={onAddBookmark}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-3 rounded-lg",
            "border-2 border-dashed border-border hover:border-accent/50",
            "bg-surface hover:bg-accent/5 transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          )}
        >
          <Plus className="w-11 h-11 rounded-xl text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Add</span>
        </button>
      </div>
    </SortableContext>
  )
}
