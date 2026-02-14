import { useState, useRef, useEffect, useCallback } from "react"
import { Settings, Search, Bookmark, Sparkles, Code, Wrench, Palette, Users, Bookmark as BookmarkIcon, Folder, Star } from "lucide-react"
import Clock from "./components/Clock"
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
import { getBookmarks, BookmarkFolder } from "@/lib/bookmarks"

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
  }, [loadFolders])


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

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-surface">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Armrest Dashboard</span>
          </div>
          <Clock />
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search Google..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pr-12 h-12 rounded-xl border-border bg-white text-primary placeholder:text-muted focus:border-accent focus:ring-accent/20 transition-colors"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-10 w-10 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {foldersData.length > 0 ? (
          <div className="flex gap-6">
            <div className="w-44 shrink-0">
              <div className="border border-border rounded-2xl p-3 space-y-1 bg-white">
                {foldersData.map((folder, index) => {
                  const FolderIcon = FOLDER_ICON_MAP[folder.icon || "folder"] || Folder
                  const isActive = activeFolderIndex === index
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderChange(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                        ? "bg-accent text-white"
                        : "text-secondary hover:text-primary hover:bg-surface"
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
                        className="group p-4 rounded-2xl border border-border bg-white hover:border-accent/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3"
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
                        <span className="text-xs text-secondary text-center line-clamp-1 font-medium group-hover:text-primary transition-colors">{bookmark.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted">No bookmarks yet. Open settings to add some!</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl border-border bg-white hover:border-accent/30 hover:bg-white shadow-sm transition-all duration-200"
            >
              <Settings className="h-5 w-5 text-secondary hover:text-accent transition-colors" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full max-w-md top-0 right-0 left-auto mt-0 rounded-none border-l border-border bg-white">
            <DrawerHeader className="border-b border-border">
              <DrawerTitle className="text-primary font-semibold">Settings</DrawerTitle>
              <DrawerDescription className="text-muted">
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
                  className={`rounded-xl transition-colors ${activeSettingsTab === "background" ? "bg-accent hover:bg-accent-dark text-white" : "text-muted hover:text-accent hover:bg-accent/10"}`}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant={activeSettingsTab === "bookmarks" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setActiveSettingsTab("bookmarks")}
                  title="Bookmarks"
                  className={`rounded-xl transition-colors ${activeSettingsTab === "bookmarks" ? "bg-accent hover:bg-accent-dark text-white" : "text-muted hover:text-accent hover:bg-accent/10"}`}
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSettingsTab === "background" ? (
                  <BackgroundSettings />
                ) : (
                  <BookmarksSettings folders={foldersData} onBookmarkAdded={handleBookmarkAdded} />
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
