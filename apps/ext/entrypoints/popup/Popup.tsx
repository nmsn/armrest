import { useState, useEffect, useCallback, useMemo } from "react"
import { Loader2, Bookmark, Clock } from "lucide-react"
import { toast } from "sonner"
import { getBookmarks, BookmarkFolder, addBookmark } from "@/lib/bookmarks"
import { addReadLaterCard, generateRandomCardVisual } from "@/lib/readlater"
import { FolderSidebar, BookmarkList } from "./components"
import { getThemeConfig, applyTheme, type ThemeMode } from "@/lib/theme"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

const ITEMS_PER_PAGE = 8
type PageToastType = "SAVED" | "READ_LATER" | "SAVE_FAILED" | "READ_LATER_FAILED"

export default function Popup() {
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [themeMode, setThemeMode] = useState<ThemeMode>("system")
  const [isInjectable, setIsInjectable] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bookmarksData, themeConfig] = await Promise.all([
        getBookmarks(),
        getThemeConfig()
      ])
      setFolders(bookmarksData.folders)
      setThemeMode(themeConfig.mode)
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
          setThemeMode(config.mode)
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

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url && isInjectablePage(tab.url)) {
        setIsInjectable(true)
      } else {
        setIsInjectable(false)
      }
    })
  }, [])

  const handleOpenUrl = (url: string) => {
    window.open(url, "_blank")
  }

  const handleFolderSelect = (id: string) => {
    setSelectedFolderId(id)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const isInjectablePage = (url: string) => {
    try {
      const { protocol } = new URL(url)
      return protocol === "http:" || protocol === "https:" || protocol === "file:"
    } catch {
      return false
    }
  }

  const notifyPageToast = async (tab: chrome.tabs.Tab | undefined, type: PageToastType, title: string) => {
    if (!tab?.id) return
    if (!tab.url || !isInjectablePage(tab.url)) return
    try {
      await chrome.tabs.sendMessage(tab.id, { type, title })
    } catch {
      // silently fail
    }
  }

  const handleAddToBookmark = async () => {
    if (!selectedFolderId) return
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url || !tab.title) return
    try {
      await addBookmark(selectedFolderId, {
        name: tab.title,
        url: tab.url,
        color: '#6366F1',
      })
      await loadData()
      await notifyPageToast(tab, "SAVED", tab.title)
    } catch (err) {
      await notifyPageToast(tab, "SAVE_FAILED", tab.title)
      toast.error(err instanceof Error ? err.message : "添加书签失败")
    }
  }

  const handleAddToReadLater = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url || !tab.title) return
    try {
      await addReadLaterCard({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        url: tab.url,
        title: tab.title,
        ...generateRandomCardVisual(),
      })
      await notifyPageToast(tab, "READ_LATER", tab.title)
    } catch (err) {
      await notifyPageToast(tab, "READ_LATER_FAILED", tab.title)
      toast.error(err instanceof Error ? err.message : "添加稍后阅读失败")
    }
  }

  if (loading) {
    return (
      <div className="h-[320px] flex items-center justify-center bg-background">
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
    <TooltipProvider>
      <div className={`flex flex-col h-[360px] w-[320px] bg-background text-foreground rounded-xl ${themeMode === "dark" ? "dark" : ""}`}>
        <div className="flex flex-1 min-h-0">
          <FolderSidebar
            folders={folders}
            selectedId={selectedFolderId}
            onSelect={handleFolderSelect}
          />
          <div className="w-px bg-border" />
          <BookmarkList
            bookmarks={currentFolder?.bookmarks || []}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onBookmarkClick={handleOpenUrl}
            itemsPerPage={16}
            emptyText="暂无书签"
          />
        </div>
        {isInjectable && (
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border">
            <button
              onClick={handleAddToBookmark}
              className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
              title="添加到书签"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToReadLater}
              className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
              title="稍后阅读"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <Toaster richColors position="top-center" />
    </TooltipProvider>
  )
}
