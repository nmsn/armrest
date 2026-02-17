import { useState, useEffect, useCallback, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { getBookmarks, BookmarkFolder } from "@/lib/bookmarks"
import { FolderSidebar, BookmarkList } from "./components"

const ITEMS_PER_PAGE = 10

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
      const data = await getBookmarks()
      setFolders(data.folders)
      if (data.folders.length > 0) {
        setSelectedFolderId(data.folders[0].id)
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

  const allBookmarks = useMemo(() => {
    return folders.flatMap((folder) => folder.bookmarks)
  }, [folders])

  const currentFolder = useMemo(() => {
    if (selectedFolderId === "all") {
      return { id: "all", name: "All", bookmarks: allBookmarks }
    }
    return folders.find((f) => f.id === selectedFolderId) || null
  }, [selectedFolderId, folders, allBookmarks])

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
      <div className="h-[320px] flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[320px] flex items-center justify-center text-red-500 text-xs">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-[320px] w-[280px] bg-background text-primary text-[11px]">
      <FolderSidebar
        folders={folders}
        selectedId={selectedFolderId}
        onSelect={handleFolderSelect}
        showAll={allBookmarks.length > 0}
        allLabel="All Bookmarks"
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
