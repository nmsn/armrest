import { useState, useEffect, useCallback, useMemo } from "react"
import { Folder, ChevronLeft, ChevronRight, Loader2, Code, Wrench, Palette, Users, Bookmark as BookmarkIcon, Star, Sparkles, Home, Search, Heart, Mail, Calendar, Clock, Link, Image, Music, Video, File, Settings, Trash2, Edit2, Save, Share2 } from "lucide-react"
import { getBookmarks, BookmarkFolder } from "@/lib/bookmarks"

const ITEMS_PER_PAGE = 10

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  code: Code,
  wrench: Wrench,
  palette: Palette,
  users: Users,
  bookmark: BookmarkIcon,
  settings: Settings,
  star: Star,
  sparkles: Sparkles,
  home: Home,
  search: Search,
  heart: Heart,
  mail: Mail,
  calendar: Calendar,
  clock: Clock,
  link: Link,
  image: Image,
  music: Music,
  video: Video,
  file: File,
  trash: Trash2,
  edit: Edit2,
  save: Save,
  share: Share2,
}

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

  const getIconComponent = (iconId: string) => {
    return ICON_COMPONENTS[iconId] || Folder
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
      <div className="w-11 shrink-0 flex flex-col justify-center py-2 gap-1">
        <button
          onClick={() => setSelectedFolderId("all")}
          className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-colors ${selectedFolderId === "all"
            ? "bg-accent text-white"
            : "text-muted hover:bg-accent/10 hover:text-accent"
            }`}
          title="All"
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>
        {folders.map((folder) => {
          const FolderIcon = getIconComponent(folder.icon || "folder")
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-colors ${selectedFolderId === folder.id
                ? "bg-accent text-white"
                : "text-muted hover:bg-accent/10 hover:text-accent"
                }`}
              title={folder.name}
            >
              <FolderIcon className="w-4 h-4" />
            </button>
          )
        })}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-2">
          {paginatedBookmarks.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[10px] text-muted">
              No bookmarks
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {paginatedBookmarks.map((bookmark) => {
                return (
                  <button
                    key={bookmark.id}
                    onClick={() => handleOpenUrl(bookmark.url)}
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-accent/5 transition-colors text-left group h-10"
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: bookmark.color || "#8B5CF6" }}
                    >
                      {bookmark.logo ? (
                        <img
                          src={bookmark.logo}
                          alt=""
                          className="w-full h-full rounded-md object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                          }}
                        />
                      ) : (
                        <span className="text-white text-[9px] font-bold">
                          {bookmark.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-[10px] text-secondary group-hover:text-accent transition-colors font-normal">
                      {bookmark.name.length > 8
                        ? bookmark.name.slice(0, 8) + "..."
                        : bookmark.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="py-1.5 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-0.5 rounded hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed text-muted hover:text-accent"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-muted">
              {currentPage + 1}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-0.5 rounded hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed text-muted hover:text-accent"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
