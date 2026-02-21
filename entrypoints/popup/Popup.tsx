import { useState, useEffect, useCallback, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { getBookmarks, BookmarkFolder } from "@/lib/bookmarks"
import { FolderSidebar, BookmarkList } from "./components"
import { getThemeConfig, applyTheme } from "@/lib/theme"

const ITEMS_PER_PAGE = 8

export default function Popup() {
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bookmarksData, themeConfig] = await Promise.all([
        getBookmarks(),
        getThemeConfig()
      ])
      setFolders(bookmarksData.folders)
      applyTheme(themeConfig.mode)
      if (bookmarksData.folders.length > 0) {
        setSelectedFolderId(bookmarksData.folders[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "sync" && changes["armrest-theme-config"]) {
        getThemeConfig().then(config => {
          applyTheme(config.mode)
        })
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])


  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null
  }, [selectedFolderId, folders])

  const totalPages = useMemo(() => {
    if (!currentFolder) return 0
    return Math.ceil(currentFolder.bookmarks.length / ITEMS_PER_PAGE)
  }, [currentFolder])

  useEffect(() => {
    setCurrentPage(0)
  }, [selectedFolderId])

  const handleOpenUrl = (url: string) => {
    window.open(url, "_blank")
  }

  const handleFolderSelect = (id: string) => {
    setSelectedFolderId(id)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="h-[240px] flex items-center justify-center bg-background">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[240px] flex items-center justify-center bg-background text-red-500 text-xs">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-[240px] w-[320px] bg-background text-foreground">
      <FolderSidebar
        folders={folders}
        selectedId={selectedFolderId}
        onSelect={handleFolderSelect}
      />
      <BookmarkList
        bookmarks={currentFolder?.bookmarks || []}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onBookmarkClick={handleOpenUrl}
        itemsPerPage={ITEMS_PER_PAGE}
        emptyText="No bookmarks"
      />
    </div>
  )
}
