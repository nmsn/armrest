import { useState } from "react"
import { Settings, Search, Bookmark, Folder, FolderOpen, ExternalLink, Sparkles } from "lucide-react"
import Clock from "./components/Clock"
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

type SettingsTab = "background" | "bookmarks"

function BackgroundSettings() {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-primary">Background Color</label>
        <Input type="color" className="h-10 w-full mt-2 rounded-lg border-border" defaultValue="#FAFAFA" />
      </div>
      <div>
        <label className="text-sm font-medium text-primary">Background Image URL</label>
        <Input type="text" placeholder="https://..." className="mt-2 rounded-lg border-border" />
      </div>
      <Button className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl font-medium transition-colors">
        Apply
      </Button>
    </div>
  )
}

function BookmarksSettings() {
  const [bookmarks, setBookmarks] = useState([
    { name: "Google", url: "https://google.com" },
    { name: "GitHub", url: "https://github.com" },
  ])

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {bookmarks.map((bookmark, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-accent/30 transition-colors">
            <span className="text-sm text-primary flex-1 font-medium">{bookmark.name}</span>
            <Button variant="ghost" size="sm" className="text-muted hover:text-primary">Edit</Button>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full border-border hover:border-primary text-primary rounded-xl font-medium transition-colors">
        Add Bookmark
      </Button>
    </div>
  )
}

interface BookmarkItem {
  name: string
  url: string
  icon?: string
  color?: string
}

const placeholderBookmarks: BookmarkItem[] = [
  { name: "Google", url: "https://google.com", color: "bg-[#4285F4]" },
  { name: "GitHub", url: "https://github.com", color: "bg-[#24292F]" },
  { name: "YouTube", url: "https://youtube.com", color: "bg-[#FF0000]" },
  { name: "Twitter", url: "https://twitter.com", color: "bg-[#1DA1F2]" },
  { name: "Notion", url: "https://notion.so", color: "bg-primary" },
  { name: "Slack", url: "https://slack.com", color: "bg-[#4A154B]" },
  { name: "Figma", url: "https://figma.com", color: "bg-[#F24E1E]" },
  { name: "Stack Overflow", url: "https://stackoverflow.com", color: "bg-[#F48024]" },
  { name: "Reddit", url: "https://reddit.com", color: "bg-[#FF4500]" },
  { name: "Medium", url: "https://medium.com", color: "bg-primary" },
]

const folders = [
  { id: "work", name: "Work", icon: Folder },
  { id: "personal", name: "Personal", icon: Folder },
  { id: "tools", name: "Tools", icon: Folder },
  { id: "social", name: "Social", icon: Folder },
]

export default function App() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("background")
  const [activeFolder, setActiveFolder] = useState("work")

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

        <div className="flex gap-6">
          <div className="w-44 flex-shrink-0">
            <div className="border border-border rounded-2xl p-3 space-y-1 bg-white">
              {folders.map((folder) => {
                const Icon = activeFolder === folder.id ? FolderOpen : folder.icon
                return (
                  <button
                    key={folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeFolder === folder.id
                        ? "bg-accent text-white"
                        : "text-secondary hover:text-primary hover:bg-surface"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-5 gap-3">
              {placeholderBookmarks.map((bookmark, index) => (
                <button
                  key={index}
                  onClick={() => handleBookmarkClick(bookmark.url)}
                  className="group p-4 rounded-2xl border border-border bg-white hover:border-accent/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <div className={`w-11 h-11 rounded-xl ${bookmark.color} flex items-center justify-center text-white text-sm font-bold transition-transform duration-200 group-hover:scale-105`}>
                    {bookmark.name.charAt(0)}
                  </div>
                  <span className="text-xs text-secondary text-center line-clamp-1 font-medium group-hover:text-primary transition-colors">{bookmark.name}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted" />
                </button>
              ))}
            </div>
          </div>
        </div>
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
                  <BookmarksSettings />
                )}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
