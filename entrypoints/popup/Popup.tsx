import { useState, useEffect, useCallback, useMemo } from "react"
import { Folder, Bookmark as BookmarkIcon, ChevronLeft, ChevronRight, Loader2, Bookmark as BookmarkIcon2 } from "lucide-react"
import { getBookmarks, BookmarkFolder, Bookmark } from "@/lib/bookmarks"

const ITEMS_PER_PAGE = 8
const PAGE_SIZE = 4

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
      return { id: "all", name: "全部书签", bookmarks: allBookmarks }
    }
    return folders.find((f) => f.id === selectedFolderId) || null
  }, [selectedFolderId, folders, allBookmarks])

  const paginatedBookmarks = useMemo(() => {
    if (!currentFolder) return []
    const start = currentPage * ITEMS_PER_PAGE
    return currentFolder.bookmarks.slice(start, start + ITEMS_PER_PAGE)
  }, [currentFolder, currentPage])

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

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-[400px] w-[360px] bg-background text-foreground">
      <div className="w-[100px] border-r border-border flex flex-col">
        <div className="p-2 border-b border-border">
          <h3 className="text-xs font-medium text-muted-foreground">文件夹</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => setSelectedFolderId("all")}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs transition-colors ${selectedFolderId === "all"
                ? "bg-accent/10 text-accent"
                : "hover:bg-accent/5 text-muted-foreground"
              }`}
          >
            <BookmarkIcon2 className="w-4 h-4 shrink-0" />
            <span className="truncate">全部书签</span>
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs transition-colors ${selectedFolderId === folder.id
                  ? "bg-accent/10 text-accent"
                  : "hover:bg-accent/5 text-muted-foreground"
                }`}
            >
              <Folder className="w-4 h-4 shrink-0" style={{ color: folder.color }} />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            {currentFolder?.name || "选择文件夹"}
          </h3>
          {totalPages > 1 && (
            <span className="text-xs text-muted-foreground">
              {currentPage + 1}/{totalPages}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {paginatedBookmarks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              暂无书签
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {paginatedBookmarks.map((bookmark) => (
                <button
                  key={bookmark.id}
                  onClick={() => handleOpenUrl(bookmark.url)}
                  className="flex items-center gap-1.5 p-1.5 rounded hover:bg-accent/5 transition-colors text-left group"
                >
                  <div
                    className="w-3 h-3 rounded shrink-0"
                    style={{ backgroundColor: bookmark.color || "#6366F1" }}
                  />
                  <span className="text-xs truncate text-foreground group-hover:text-accent">
                    {bookmark.name.length > 12
                      ? bookmark.name.slice(0, 12) + "..."
                      : bookmark.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-2 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 rounded hover:bg-accent/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-1 rounded hover:bg-accent/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
