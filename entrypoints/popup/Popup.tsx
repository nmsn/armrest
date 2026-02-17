import { useState, useEffect, useCallback, useMemo } from "react"
import { Folder, ChevronLeft, ChevronRight, Loader2, List } from "lucide-react"
import { getBookmarks, BookmarkFolder } from "@/lib/bookmarks"

const ITEMS_PER_PAGE = 10
const SIDEBAR_WIDTH = 80

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
      return { id: "all", name: "全部", bookmarks: allBookmarks }
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
      <div className="h-[300px] flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center text-red-500 text-xs">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-[300px] w-[280px] bg-background text-foreground text-[11px]">
      <div className="w-[80px] border-r border-border flex flex-col shrink-0">
        <div className="px-1.5 py-1 border-b border-border">
          <span className="text-[10px] text-muted-foreground">文件夹</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => setSelectedFolderId("all")}
            className={`w-full flex items-center gap-1 px-1.5 py-1 transition-colors ${selectedFolderId === "all"
              ? "bg-accent/10 text-accent"
              : "hover:bg-accent/5 text-muted-foreground"
              }`}
          >
            <List className="w-3 h-3 shrink-0" />
            <span className="truncate">全部</span>
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-full flex items-center gap-1 px-1.5 py-1 transition-colors ${selectedFolderId === folder.id
                ? "bg-accent/10 text-accent"
                : "hover:bg-accent/5 text-muted-foreground"
                }`}
            >
              <Folder className="w-3 h-3 shrink-0" style={{ color: folder.color }} />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-2 py-1 border-b border-border flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground truncate">
            {currentFolder?.name || "选择文件夹"}
          </span>
          {totalPages > 1 && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {currentPage + 1}/{totalPages}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-1">
          {paginatedBookmarks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground">
              暂无书签
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {paginatedBookmarks.map((bookmark) => (
                <button
                  key={bookmark.id}
                  onClick={() => handleOpenUrl(bookmark.url)}
                  className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-accent/5 transition-colors text-left group"
                >
                  <div
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ backgroundColor: bookmark.color || "#6366F1" }}
                  />
                  <span className="truncate text-[10px] text-foreground group-hover:text-accent">
                    {bookmark.name.length > 10
                      ? bookmark.name.slice(0, 10) + "..."
                      : bookmark.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-2 py-1 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-0.5 rounded hover:bg-accent/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-0.5 rounded hover:bg-accent/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
