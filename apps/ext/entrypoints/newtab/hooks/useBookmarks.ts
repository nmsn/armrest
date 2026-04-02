import { useCallback } from "react"
import { deleteBookmark, reorderBookmarks, moveBookmark } from "@/lib/bookmarks"

interface BookmarkFormData {
  name: string
  url: string
  logo?: string
  description?: string
  color?: string
}

export function useBookmarks() {
  const handleDeleteBookmark = useCallback(async (folderId: string, bookmarkId: string) => {
    try {
      await deleteBookmark(folderId, bookmarkId)
    } catch (error) {
      console.error("Failed to delete bookmark:", error)
    }
  }, [])

  const handleBookmarksReorder = useCallback(async (folderId: string, orderedBookmarkIds: string[]) => {
    try {
      await reorderBookmarks(folderId, orderedBookmarkIds)
    } catch (error) {
      console.error("Failed to reorder bookmarks:", error)
    }
  }, [])

  const handleMoveBookmark = useCallback(async (
    fromFolderId: string,
    toFolderId: string,
    bookmarkId: string
  ) => {
    try {
      await moveBookmark(fromFolderId, toFolderId, bookmarkId)
    } catch (error) {
      console.error("Failed to move bookmark:", error)
    }
  }, [])

  return {
    handleDeleteBookmark,
    handleBookmarksReorder,
    handleMoveBookmark,
  }
}

export type { BookmarkFormData }
