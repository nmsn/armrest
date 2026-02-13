import { useState } from "react"
import { Settings, Search, Palette, Bookmark, Folder, FolderOpen, ExternalLink } from "lucide-react"
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
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Background Color</label>
        <Input type="color" className="h-10 w-full mt-1" defaultValue="#f5f5f5" />
      </div>
      <div>
        <label className="text-sm font-medium">Background Image URL</label>
        <Input type="text" placeholder="https://..." className="mt-1" />
      </div>
      <Button className="w-full">Apply</Button>
    </div>
  )
}

function BookmarksSettings() {
  const [bookmarks, setBookmarks] = useState([
    { name: "Google", url: "https://google.com" },
    { name: "GitHub", url: "https://github.com" },
  ])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {bookmarks.map((bookmark, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
            <span className="text-sm flex-1">{bookmark.name}</span>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full">Add Bookmark</Button>
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
  { name: "Google", url: "https://google.com", color: "bg-blue-500" },
  { name: "GitHub", url: "https://github.com", color: "bg-gray-800" },
  { name: "YouTube", url: "https://youtube.com", color: "bg-red-600" },
  { name: "Twitter", url: "https://twitter.com", color: "bg-blue-400" },
  { name: "Notion", url: "https://notion.so", color: "bg-black" },
  { name: "Slack", url: "https://slack.com", color: "bg-purple-600" },
  { name: "Figma", url: "https://figma.com", color: "bg-purple-500" },
  { name: "Stack Overflow", url: "https://stackoverflow.com", color: "bg-orange-500" },
  { name: "Reddit", url: "https://reddit.com", color: "bg-orange-600" },
  { name: "Medium", url: "https://medium.com", color: "bg-green-500" },
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
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">Armrest Dashboard</h1>
      <Clock />

      <div className="mt-6 flex items-center gap-2">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search Google..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-64 pr-10"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full max-w-md top-0 right-0 left-auto mt-0 rounded-none">
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription>
                Configure your dashboard preferences.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex h-[calc(100vh-120px)]">
              <div className="w-16 border-r flex flex-col items-center py-4 gap-2">
                <Button
                  variant={activeSettingsTab === "background" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveSettingsTab("background")}
                  title="Background"
                >
                  <Palette className="h-5 w-5" />
                </Button>
                <Button
                  variant={activeSettingsTab === "bookmarks" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveSettingsTab("bookmarks")}
                  title="Bookmarks"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
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

      <div className="mt-8 w-full max-w-4xl flex gap-4">
        <div className="w-48 flex-shrink-0">
          <div className="border rounded-lg p-2 space-y-1">
            {folders.map((folder) => {
              const Icon = activeFolder === folder.id ? FolderOpen : folder.icon
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeFolder === folder.id
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
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
                className="aspect-square rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors p-3 flex flex-col items-center justify-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-lg ${bookmark.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {bookmark.name.charAt(0)}
                </div>
                <span className="text-xs text-center line-clamp-2">{bookmark.name}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
