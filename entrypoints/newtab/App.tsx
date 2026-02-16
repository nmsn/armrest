import { useState, useRef, useEffect, useCallback } from "react"
import { Settings, Search, Bookmark, Code, Wrench, Palette, Users, Bookmark as BookmarkIcon, Folder, Star } from "lucide-react"
import Clock from "./components/Clock"
import { Weather } from "./components/Weather"
import { DailyQuote } from "./components/DailyQuote"
import { motion, AnimatePresence } from "motion/react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BackgroundSettings } from "./components/BackgroundSettings"
import { BookmarksSettings } from "./components/BookmarksSettings"
import { BookmarkEditModal } from "./components/BookmarkEditModal"
import { FolderEditModal } from "./components/FolderEditModal"
import { getBookmarks, addBookmark, updateBookmark, addFolder, updateFolder, BookmarkFolder } from "@/lib/bookmarks"
import { getThemeConfig, applyTheme, defaultThemeConfig } from "@/lib/theme"

const FOLDER_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  wrench: Wrench,
  palette: Palette,
  users: Users,
  bookmark: BookmarkIcon,
  settings: Settings,
  folder: Folder,
  star: Star,
}

type SettingsTab = "background" | "bookmarks"

export default function App() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("background")
  const [activeFolderIndex, setActiveFolderIndex] = useState(0)
  const [foldersData, setFoldersData] = useState<BookmarkFolder[]>([])
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<{ id: string; name: string; url: string; color?: string } | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<{ id: string; data: { name: string; icon: string; color: string } } | null>(null)
  const [backgroundColor, setBackgroundColor] = useState(defaultThemeConfig.backgroundColor)
  const [backgroundImage, setBackgroundImage] = useState(defaultThemeConfig.backgroundImage)
  const prevFolderIndexRef = useRef(0)

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
      setBackgroundColor(config.backgroundColor)
      setBackgroundImage(config.backgroundImage)
    }
    initTheme()
  }, [])


  console.log(chrome, chrome.storage);
  useEffect(() => {
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === "sync" && changes.armrest_bookmarks) {
        loadFolders()
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [loadFolders])

  const handleFolderChange = (index: number) => {
    prevFolderIndexRef.current = activeFolderIndex
    setActiveFolderIndex(index)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}` })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBookmarkClick = (url: string) => {
    chrome.tabs.create({ url })
  }

  const direction = activeFolderIndex > prevFolderIndexRef.current ? 1 : -1
  const currentFolder = foldersData[activeFolderIndex]

  const handleBookmarkAdded = () => {
    loadFolders()
  }

  const handleEditBookmark = (bookmark: { id: string; name: string; url: string; color?: string }) => {
    setEditingBookmark(bookmark)
    setIsBookmarkModalOpen(true)
  }

  const handleOpenBookmarkModal = () => {
    setEditingBookmark(null)
    setIsBookmarkModalOpen(true)
  }

  const handleSaveBookmark = async (data: { name: string; url: string; logo?: string; description?: string; color?: string }) => {
    const currentFolder = foldersData[activeFolderIndex]
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
    if (folder) {
      setEditingFolder(folder)
    } else {
      setEditingFolder(null)
    }
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

  return (
    <div
      className="h-screen flex flex-col items-center p-4 overflow-hidden bg-surface"
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
      }}
    >
      <div className="w-full max-w-5xl flex flex-col h-full">
        <div className="text-center mb-4 mt-8">
          <Clock />
          <div className="mt-2">
            <Weather />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search or enter URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pr-12 h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20 transition-colors"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-10 w-10 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {foldersData.length > 0 ? (
          <div className="flex gap-6">
            <div className="w-44 shrink-0">
              <div className="border border-border rounded-2xl p-3 space-y-1 bg-card">
                {foldersData.map((folder, index) => {
                  const FolderIcon = FOLDER_ICON_MAP[folder.icon || "folder"] || Folder
                  const isActive = activeFolderIndex === index
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderChange(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                        }`}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: folder.color || "#6366F1" }}
                      >
                        <FolderIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>{folder.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={activeFolderIndex}
                  custom={direction}
                  initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                >
                  <div className="grid grid-cols-5 gap-3">
                    {currentFolder?.bookmarks.map((bookmark) => (
                      <button
                        key={bookmark.id}
                        onClick={() => handleBookmarkClick(bookmark.url)}
                        className="group p-4 rounded-2xl border border-border bg-card hover:border-accent/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3"
                      >
                        {bookmark.logo ? (
                          <img
                            src={bookmark.logo}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = `<span>${bookmark.name.charAt(0).toUpperCase()}</span>`
                                parent.className += ` w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold`
                                parent.style.backgroundColor = bookmark.color || "#6366F1"
                              }
                            }}
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold transition-transform duration-200 group-hover:scale-105"
                            style={{ backgroundColor: bookmark.color || "#6366F1" }}
                          >
                            {bookmark.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground text-center line-clamp-1 font-medium group-hover:text-foreground transition-colors">{bookmark.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No bookmarks yet. Open settings to add some!</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-border bg-card hover:border-accent/30 hover:bg-card shadow-sm transition-all duration-200"
            >
              <Settings className="h-5 w-5 text-muted-foreground hover:text-accent transition-colors" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full max-w-md top-0 right-0 left-auto mt-0 rounded-none border-l border-border bg-card">
            <DrawerHeader className="border-b border-border">
              <DrawerTitle className="text-foreground font-semibold">Settings</DrawerTitle>
              <DrawerDescription className="text-muted-foreground">
                Configure your dashboard preferences.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex h-[calc(100vh-100px)]">
              <div className="w-16 border-r border-border flex flex-col items-center py-4 gap-2">
                <Button
                  variant={activeSettingsTab === "background" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setActiveSettingsTab("background")}
                  title="Background"
                  className={`rounded-xl transition-colors ${activeSettingsTab === "background" ? "bg-accent hover:bg-accent-dark text-accent-foreground" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant={activeSettingsTab === "bookmarks" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setActiveSettingsTab("bookmarks")}
                  title="Bookmarks"
                  className={`rounded-xl transition-colors ${activeSettingsTab === "bookmarks" ? "bg-accent hover:bg-accent-dark text-accent-foreground" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSettingsTab === "background" ? (
                  <BackgroundSettings
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    onBackgroundChange={(color, image) => {
                      setBackgroundColor(color)
                      setBackgroundImage(image)
                    }}
                  />
                ) : (
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
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
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

      <div className="mt-auto pt-4 pb-2">
        <DailyQuote className="justify-center" />
      </div>
    </div>
  )
}
