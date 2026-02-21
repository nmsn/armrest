import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Bookmark } from "@/lib/bookmarks"
import { BookmarkItem } from "@/components/shared/BookmarkItem"

interface BookmarkListProps {
  bookmarks: Bookmark[]
  onBookmarkClick: (url: string) => void
  onReorder: (orderedBookmarkIds: string[]) => Promise<void>
}

interface SortableBookmarkItemProps {
  bookmark: Bookmark
  onBookmarkClick: (url: string) => void
}

function SortableBookmarkItem({ bookmark, onBookmarkClick }: SortableBookmarkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id })

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

export function BookmarkList({ bookmarks, onBookmarkClick, onReorder }: BookmarkListProps) {
  const [items, setItems] = useState<Bookmark[]>(bookmarks)

  useEffect(() => {
    setItems(bookmarks)
  }, [bookmarks])

  const itemIds = useMemo(() => items.map((bookmark) => bookmark.id), [items])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((bookmark) => bookmark.id === active.id)
    const newIndex = items.findIndex((bookmark) => bookmark.id === over.id)
    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const nextItems = arrayMove(items, oldIndex, newIndex)
    setItems(nextItems)
    await onReorder(nextItems.map((bookmark) => bookmark.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-5 gap-3">
          {items.map((bookmark) => (
            <SortableBookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onBookmarkClick={onBookmarkClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
