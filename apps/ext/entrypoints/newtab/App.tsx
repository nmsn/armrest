import { useState, useEffect, useCallback, useRef } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Sidebar } from "./components/Sidebar"
import { MainContent } from "./components/MainContent"
import { BookmarkEditModal } from "./components/BookmarkEditModal"
import { FolderEditModal } from "./components/FolderEditModal"
import { BookmarksSettings } from "./components/BookmarksSettings"
import { useDragAndDrop, getFolderItemDragId } from "./hooks/useDragAndDrop"
import { getBookmarks, addBookmark, updateBookmark, addFolder, updateFolder, BookmarkFolder } from "@/lib/bookmarks"
import { getThemeConfig, applyTheme } from "@/lib/theme"

type SettingsTab = "bookmarks"

function App() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("bookmarks")
  const [foldersData, setFoldersData] = useState<BookmarkFolder[]>([])
  const [activeFolderIndex, setActiveFolderIndex] = useState(0)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<{ id: string; name: string; url: string; color?: string } | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<{ id: string; data: { name: string; icon: string; color: string } } | null>(null)
  const prevFolderIndexRef = useRef(0)

  const direction = activeFolderIndex > prevFolderIndexRef.current ? 1 : -1
  const currentFolder = foldersData[activeFolderIndex]

  const loadFolders = useCallback(async () => {
    try {
      const data = await getBookmarks()
      setFoldersData(data.folders)
    } catch (error) {
      console.error("Failed to load folders:", error)
    }
  }, [])

  useEffect(() => {
    loadFolders()
  }, [])

  useEffect(() => {
    async function initTheme() {
      const config = await getThemeConfig()
      applyTheme(config.mode)
    }
    initTheme()
  }, [])

  useEffect(() => {
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "sync" && changes.armrest_bookmarks) {
        loadFolders()
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [loadFolders])

  const handleFolderChange = useCallback((index: number) => {
    prevFolderIndexRef.current = activeFolderIndex
    setActiveFolderIndex(index)
  }, [activeFolderIndex])

  const handleFoldersReorder = useCallback(async (orderedFolderIds: string[]) => {
    const activeFolderId = foldersData[activeFolderIndex]?.id
    try {
      const { reorderFolders: reorder } = await import("@/lib/bookmarks")
      const state = await reorder(orderedFolderIds)
      setFoldersData(state.folders)
      if (activeFolderId) {
        const nextActiveIndex = state.folders.findIndex((folder) => folder.id === activeFolderId)
        if (nextActiveIndex >= 0) setActiveFolderIndex(nextActiveIndex)
      }
    } catch (error) {
      console.error("Failed to reorder folders:", error)
      loadFolders()
    }
  }, [foldersData, activeFolderIndex, loadFolders])

  const handleBookmarksReorder = useCallback(async (folderId: string, orderedBookmarkIds: string[]) => {
    try {
      const { reorderBookmarks: reorder } = await import("@/lib/bookmarks")
      await reorder(folderId, orderedBookmarkIds)
      await loadFolders()
    } catch (error) {
      console.error("Failed to reorder bookmarks:", error)
      loadFolders()
    }
  }, [loadFolders])

  const handleBookmarkMove = useCallback(async (fromFolderId: string, toFolderId: string, bookmarkId: string) => {
    try {
      const { moveBookmark: move } = await import("@/lib/bookmarks")
      await move(fromFolderId, toFolderId, bookmarkId)
      await loadFolders()
    } catch (error) {
      console.error("Failed to move bookmark:", error)
      loadFolders()
    }
  }, [loadFolders])

  const { sensors, handleDragEnd } = useDragAndDrop({
    onFoldersReorder: handleFoldersReorder,
    onBookmarksReorder: handleBookmarksReorder,
    onBookmarkMove: handleBookmarkMove,
    onRefresh: loadFolders,
  })

  const handleSearch = () => {
    if (searchQuery.trim()) {
      chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}` })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleBookmarkClick = (url: string) => {
    chrome.tabs.create({ url })
  }

  const handleBookmarkAdded = () => {
    loadFolders()
  }

  const handleEditBookmark = (bookmark: { id: string; name: string; url: string; color?: string }) => {
    setEditingBookmark(bookmark)
    setIsBookmarkModalOpen(true)
  }

  const handleDeleteBookmark = async (bookmark: { id: string }) => {
    if (!currentFolder) return
    try {
      const { deleteBookmark } = await import("@/lib/bookmarks")
      await deleteBookmark(currentFolder.id, bookmark.id)
      await loadFolders()
    } catch (error) {
      console.error("Failed to delete bookmark:", error)
    }
  }

  const handleOpenBookmarkModal = () => {
    setEditingBookmark(null)
    setIsBookmarkModalOpen(true)
  }

  const handleSaveBookmark = async (data: { name: string; url: string; logo?: string; description?: string; color?: string }) => {
    if (!currentFolder) return

    if (editingBookmark) {
      await updateBookmark(currentFolder.id, editingBookmark.id, {
        name: data.name,
        url: data.url,
        logo: data.logo,
        description: data.description,
      })
    } else {
      const colors = ["#6366F1", "#10B981", "#EC4899", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#14B8A6"]
      await addBookmark(currentFolder.id, {
        name: data.name,
        url: data.url,
        logo: data.logo,
        description: data.description,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    loadFolders()
    setIsBookmarkModalOpen(false)
    setEditingBookmark(null)
  }

  const handleOpenFolderModal = (folder?: { id: string; data: { name: string; icon: string; color: string } }) => {
    setEditingFolder(folder || null)
    setIsFolderModalOpen(true)
  }

  const handleSaveFolder = async (data: { name: string; icon: string; color: string }) => {
    if (editingFolder) {
      await updateFolder(editingFolder.id, data)
    } else {
      await addFolder(data.name, data.icon, data.color)
    }
    loadFolders()
    setIsFolderModalOpen(false)
    setEditingFolder(null)
  }

  const folderIds = foldersData.map((folder) => getFolderItemDragId(folder.id))

  return (
    <div className="h-screen overflow-hidden bg-surface flex items-center justify-center p-4">
      <div className="mt-[-20px]">
        <div className="w-full max-w-5xl h-full flex flex-col">
          {/* Body */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, foldersData, activeFolderIndex)}>
            <div className="grid grid-cols-[176px_1fr] gap-[var(--ds-section-gap)] overflow-hidden min-h-0">
              <SortableContext items={folderIds} strategy={verticalListSortingStrategy}>
                <Sidebar
                  folders={foldersData}
                  activeFolderIndex={activeFolderIndex}
                  onFolderSelect={handleFolderChange}
                  onNewFolder={() => handleOpenFolderModal()}
                  activeSettingsTab={activeSettingsTab}
                  onSettingsTabChange={setActiveSettingsTab}
                >
                  <BookmarksSettings
                    folders={foldersData}
                    onBookmarkAdded={handleBookmarkAdded}
                    isBookmarkModalOpen={isBookmarkModalOpen}
                    onBookmarkModalClose={() => {
                      setIsBookmarkModalOpen(false)
                      setEditingBookmark(null)
                    }}
                    onBookmarkModalOpen={handleOpenBookmarkModal}
                    editingBookmark={editingBookmark}
                    onSaveBookmark={handleSaveBookmark}
                    onEditBookmark={handleEditBookmark}
                    isFolderModalOpen={isFolderModalOpen}
                    onFolderModalClose={() => {
                      setIsFolderModalOpen(false)
                      setEditingFolder(null)
                    }}
                    editingFolder={editingFolder}
                    onSaveFolder={handleSaveFolder}
                    onOpenFolderModal={handleOpenFolderModal}
                  />
                </Sidebar>
              </SortableContext>

              <MainContent
                bookmarks={currentFolder?.bookmarks || []}
                direction={direction}
                onBookmarkClick={handleBookmarkClick}
                onAddBookmark={handleOpenBookmarkModal}
                onEditBookmark={handleEditBookmark}
                onDeleteBookmark={handleDeleteBookmark}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSearch={handleSearch}
                onSearchKeyDown={handleKeyDown}
              />
            </div>
          </DndContext>
        </div>
      </div>

      <BookmarkEditModal
        isOpen={isBookmarkModalOpen}
        onClose={() => {
          setIsBookmarkModalOpen(false)
          setEditingBookmark(null)
        }}
        onSave={handleSaveBookmark}
        initialData={editingBookmark || undefined}
        title={editingBookmark ? "Edit Bookmark" : "Add Bookmark"}
      />

      <FolderEditModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false)
          setEditingFolder(null)
        }}
        onSave={handleSaveFolder}
        initialData={editingFolder?.data}
        title={editingFolder ? "Edit Folder" : "Add Folder"}
      />
    </div>
  )
}

export default App
