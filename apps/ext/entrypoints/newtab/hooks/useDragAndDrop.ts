import { useCallback } from "react"
import { PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { arrayMove } from "@dnd-kit/sortable"
import type { DragEndEvent } from "@dnd-kit/core"
import type { BookmarkFolder } from "@/lib/bookmarks"

const BOOKMARK_DRAG_ID_PREFIX = "bookmark:"
const FOLDER_ITEM_ID_PREFIX = "folder-item:"

export function getBookmarkDragId(bookmarkId: string): string {
  return `${BOOKMARK_DRAG_ID_PREFIX}${bookmarkId}`
}

export function getFolderItemDragId(folderId: string): string {
  return `${FOLDER_ITEM_ID_PREFIX}${folderId}`
}

export function parseBookmarkDragId(dragId: string): string | null {
  return dragId.startsWith(BOOKMARK_DRAG_ID_PREFIX)
    ? dragId.slice(BOOKMARK_DRAG_ID_PREFIX.length)
    : null
}

export function parseFolderItemDragId(dragId: string): string | null {
  return dragId.startsWith(FOLDER_ITEM_ID_PREFIX)
    ? dragId.slice(FOLDER_ITEM_ID_PREFIX.length)
    : null
}

interface UseDragAndDropProps {
  onFoldersReorder: (orderedFolderIds: string[]) => Promise<void>
  onBookmarksReorder: (folderId: string, orderedBookmarkIds: string[]) => Promise<void>
  onBookmarkMove: (fromFolderId: string, toFolderId: string, bookmarkId: string) => Promise<void>
  onRefresh: () => void
}

export function useDragAndDrop({
  onFoldersReorder,
  onBookmarksReorder,
  onBookmarkMove,
  onRefresh,
}: UseDragAndDropProps) {
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

  const handleDragEnd = useCallback(async (event: DragEndEvent, foldersData: BookmarkFolder[], activeFolderIndex: number) => {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const bookmarkId = parseBookmarkDragId(activeId)
    const folderDragId = parseFolderItemDragId(activeId)
    const currentFolder = foldersData[activeFolderIndex]

    // Folder reorder
    if (folderDragId) {
      const overFolderId = parseFolderItemDragId(overId)
      if (!overFolderId || overFolderId === folderDragId) return

      const folderDragIds = foldersData.map((folder) => getFolderItemDragId(folder.id))
      const oldIndex = folderDragIds.findIndex((id) => id === activeId)
      const newIndex = folderDragIds.findIndex((id) => id === overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const nextFolderIds = arrayMove(folderDragIds, oldIndex, newIndex).map((id) => {
        const parsedId = parseFolderItemDragId(id)
        if (!parsedId) {
          throw new Error("Invalid folder id")
        }
        return parsedId
      })

      await onFoldersReorder(nextFolderIds)
      return
    }

    // Bookmark reorder or move
    if (!bookmarkId || !currentFolder) return

    const targetFolderId = parseFolderItemDragId(overId)

    // Move to different folder
    if (targetFolderId) {
      if (targetFolderId === currentFolder.id) return
      await onBookmarkMove(currentFolder.id, targetFolderId, bookmarkId)
      onRefresh()
      return
    }

    // Reorder within same folder
    const reorderedIds = currentFolder.bookmarks.map((bookmark) => getBookmarkDragId(bookmark.id))
    const oldIndex = reorderedIds.findIndex((id) => id === activeId)
    const newIndex = reorderedIds.findIndex((id) => id === overId)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

    const nextIds = arrayMove(reorderedIds, oldIndex, newIndex).map((id) => {
      const parsedId = parseBookmarkDragId(id)
      if (!parsedId) {
        throw new Error("Invalid bookmark id")
      }
      return parsedId
    })

    await onBookmarksReorder(currentFolder.id, nextIds)
  }, [onFoldersReorder, onBookmarksReorder, onBookmarkMove, onRefresh])

  return {
    sensors,
    handleDragEnd,
  }
}
