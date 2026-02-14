import { useState, useRef } from "react"
import { Settings, Search, Bookmark, FolderOpen, Sparkles, Code, Palette, Wrench, Users } from "lucide-react"
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

type SettingsTab = "background" | "bookmarks"

interface BookmarkItem {
  name: string
  url: string
  color: string
}

interface FolderData {
  id: string
  name: string
  icon: React.ElementType
  bookmarks: BookmarkItem[]
}

const foldersData: FolderData[] = [
  {
    id: "work",
    name: "Work",
    icon: Code,
    bookmarks: [
      { name: "GitHub", url: "https://github.com", color: "bg-[#24292F]" },
      { name: "GitLab", url: "https://gitlab.com", color: "bg-[#FC6D26]" },
      { name: "Jira", url: "https://jira.com", color: "bg-[#0052CC]" },
      { name: "Slack", url: "https://slack.com", color: "bg-[#4A154B]" },
      { name: "Notion", url: "https://notion.so", color: "bg-primary" },
      { name: "Figma", url: "https://figma.com", color: "bg-[#F24E1E]" },
      { name: "Linear", url: "https://linear.app", color: "bg-[#5E6AD2]" },
      { name: "Vercel", url: "https://vercel.com", color: "bg-primary" },
      { name: "AWS", url: "https://aws.amazon.com", color: "bg-[#FF9900]" },
      { name: "Docker", url: "https://docker.com", color: "bg-[#2496ED]" },
    ],
  },
  {
    id: "tools",
    name: "Tools",
    icon: Wrench,
    bookmarks: [
      { name: "Google", url: "https://google.com", color: "bg-[#4285F4]" },
      { name: "YouTube", url: "https://youtube.com", color: "bg-[#FF0000]" },
      { name: "Stack Overflow", url: "https://stackoverflow.com", color: "bg-[#F48024]" },
      { name: "MDN", url: "https://developer.mozilla.org", color: "bg-[#000000]" },
      { name: "Can I Use", url: "https://caniuse.com", color: "bg-[#60AB9F]" },
      { name: "Regex101", url: "https://regex101.com", color: "bg-[#336791]" },
      { name: "JSONPlaceholder", url: "https://jsonplaceholder.typicode.com", color: "bg-[#FF6C37]" },
      { name: "CodePen", url: "https://codepen.io", color: "bg-[#000000]" },
      { name: "JSFiddle", url: "https://jsfiddle.net", color: "bg-[#1B1F24]" },
      { name: "Replit", url: "https://replit.com", color: "bg-[#F26207]" },
    ],
  },
  {
    id: "design",
    name: "Design",
    icon: Palette,
    bookmarks: [
      { name: "Dribbble", url: "https://dribbble.com", color: "bg-[#EA4C89]" },
      { name: "Behance", url: "https://behance.net", color: "bg-[#1769FF]" },
      { name: "Awwwards", url: "https://awwwards.com", color: "bg-[#000000]" },
      { name: "Unsplash", url: "https://unsplash.com", color: "bg-[#000000]" },
      { name: "Pexels", url: "https://pexels.com", color: "bg-[#05A081]" },
      { name: "Icons8", url: "https://icons8.com", color: "bg-[#1A1919]" },
      { name: "Heroicons", url: "https://heroicons.com", color: "bg-[#3B82F6]" },
      { name: "Lucide", url: "https://lucide.dev", color: "bg-[#10B981]" },
      { name: "ColorHunt", url: "https://colorhunt.co", color: "bg-[#FF6B6B]" },
      { name: "Coolors", url: "https://coolors.co", color: "bg-[#000000]" },
    ],
  },
  {
    id: "social",
    name: "Social",
    icon: Users,
    bookmarks: [
      { name: "Twitter", url: "https://twitter.com", color: "bg-[#1DA1F2]" },
      { name: "Reddit", url: "https://reddit.com", color: "bg-[#FF4500]" },
      { name: "Medium", url: "https://medium.com", color: "bg-primary" },
      { name: "LinkedIn", url: "https://linkedin.com", color: "bg-[#0A66C2]" },
      { name: "Hacker News", url: "https://news.ycombinator.com", color: "bg-[#FF6600]" },
      { name: "Product Hunt", url: "https://producthunt.com", color: "bg-[#DA552F]" },
      { name: "IndieHackers", url: "https://indiehackers.com", color: "bg-[#0C0C0C]" },
      { name: "Dev.to", url: "https://dev.to", color: "bg-[#0A0A0A]" },
      { name: "Hashnode", url: "https://hashnode.com", color: "bg-[#000000]" },
      { name: "V2EX", url: "https://v2ex.com", color: "bg-[#1B1F23]" },
    ],
  },
]

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
  const [bookmarks] = useState([
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

export default function App() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("background")
  const [activeFolderIndex, setActiveFolderIndex] = useState(0)
  const prevFolderIndexRef = useRef(0)

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
          <div className="w-44 shrink-0">
            <div className="border border-border rounded-2xl p-3 space-y-1 bg-white">
              {foldersData.map((folder, index) => {
                const Icon = activeFolderIndex === index ? FolderOpen : folder.icon
                return (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderChange(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${activeFolderIndex === index
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
                  {currentFolder.bookmarks.map((bookmark, index) => (
                    <button
                      key={index}
                      onClick={() => handleBookmarkClick(bookmark.url)}
                      className="group p-4 rounded-2xl border border-border bg-white hover:border-accent/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3"
                    >
                      <div className={`w-11 h-11 rounded-xl ${bookmark.color} flex items-center justify-center text-white text-sm font-bold transition-transform duration-200 group-hover:scale-105`}>
                        {bookmark.name.charAt(0)}
                      </div>
                      <span className="text-xs text-secondary text-center line-clamp-1 font-medium group-hover:text-primary transition-colors">{bookmark.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
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
