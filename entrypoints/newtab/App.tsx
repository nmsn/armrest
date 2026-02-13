import { useState } from "react"
import { Settings, Search, Palette, Bookmark } from "lucide-react"
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

export default function App() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<SettingsTab>("background")

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Armrest Dashboard</h1>
      <Clock />
      <div className="mt-8 flex items-center gap-2">
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
                  variant={activeTab === "background" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTab("background")}
                  title="Background"
                >
                  <Palette className="h-5 w-5" />
                </Button>
                <Button
                  variant={activeTab === "bookmarks" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTab("bookmarks")}
                  title="Bookmarks"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === "background" ? (
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
