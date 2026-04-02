import { useState, useCallback, useRef } from "react"
import { BookmarkFolder, addFolder, updateFolder, reorderFolders } from "@/lib/bookmarks"

interface FolderFormData {
  name: string
  icon: string
  color: string
}

export function useFolders() {
  const [foldersData, setFoldersData] = useState<BookmarkFolder[]>([])
  const [activeFolderIndex, setActiveFolderIndex] = useState(0)
  const prevFolderIndexRef = useRef(0)

  const direction = activeFolderIndex > prevFolderIndexRef.current ? 1 : -1

  const handleFolderChange = useCallback((index: number) => {
    prevFolderIndexRef.current = activeFolderIndex
    setActiveFolderIndex(index)
  }, [activeFolderIndex])

  const handleFoldersReorder = useCallback(async (orderedFolderIds: string[]) => {
    const activeFolderId = foldersData[activeFolderIndex]?.id
    try {
      const state = await reorderFolders(orderedFolderIds)
      setFoldersData(state.folders)

      if (!activeFolderId) return
      const nextActiveIndex = state.folders.findIndex((folder) => folder.id === activeFolderId)
      if (nextActiveIndex >= 0) {
        setActiveFolderIndex(nextActiveIndex)
      }
    } catch (error) {
      console.error("Failed to reorder folders:", error)
    }
  }, [foldersData, activeFolderIndex])

  const handleSaveFolder = useCallback(async (editingFolder: { id: string; data: FolderFormData } | null, data: FolderFormData) => {
    if (editingFolder) {
      await updateFolder(editingFolder.id, data)
    } else {
      await addFolder(data.name, data.icon, data.color)
    }
  }, [])

  return {
    foldersData,
    setFoldersData,
    activeFolderIndex,
    direction,
    handleFolderChange,
    handleFoldersReorder,
    handleSaveFolder,
  }
}

export type { FolderFormData }
