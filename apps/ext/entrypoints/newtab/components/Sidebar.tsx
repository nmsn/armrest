import { Settings, Bookmark as BookmarkIcon, Sun, Moon, Monitor } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import Clock from "./Clock"
import { Weather } from "./Weather"
import { FolderList } from "./FolderList"
import { Logo } from "./Logo"
import { useTheme } from "@/lib/theme"
import type { BookmarkFolder } from "@/lib/bookmarks"

interface SidebarProps {
  folders: BookmarkFolder[]
  activeFolderIndex: number
  onFolderSelect: (index: number) => void
  onNewFolder: () => void
  activeSettingsTab: "bookmarks"
  onSettingsTabChange: (tab: "bookmarks") => void
  children: React.ReactNode
}

export function Sidebar({
  folders,
  activeFolderIndex,
  onFolderSelect,
  onNewFolder,
  activeSettingsTab,
  onSettingsTabChange,
  children,
}: SidebarProps) {
  const { mode, setMode } = useTheme()

  const ThemeIcon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor

  const cycleMode = () => {
    setMode(mode === "dark" ? "light" : mode === "light" ? "system" : "dark")
  }

  return (
    <div className="app-sidebar overflow-y-auto">
      {/* Logo */}
      <Logo />

      {/* Clock */}
      <div className="app-card" style={{ height: "172px" }}>
        <Clock />
      </div>

      {/* Weather */}
      <div className="app-card" style={{ height: "80px" }}>
        <Weather />
      </div>

      {/* Folders */}
      <div className="app-card flex flex-col" style={{ minHeight: "264px" }}>
        <div className="app-card-header">
          <span className="app-card-title">Folders</span>
          <button onClick={onNewFolder} className="app-card-action">
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FolderList
            folders={folders}
            activeIndex={activeFolderIndex}
            onSelect={onFolderSelect}
          />
        </div>
      </div>

      {/* Theme + Settings */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={cycleMode}
          title={`Theme: ${mode}`}
          className="h-9 w-9 rounded-lg border-border bg-card hover:border-accent/30 hover:bg-accent/10 transition-all"
        >
          <ThemeIcon className="h-4 w-4 text-muted-foreground hover:text-accent" />
        </Button>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-border bg-card hover:border-accent/30 hover:bg-accent/10 transition-all"
            >
              <Settings className="h-4 w-4 text-muted-foreground hover:text-accent" />
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
                  variant={activeSettingsTab === "bookmarks" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => onSettingsTabChange("bookmarks")}
                  title="Bookmarks"
                  className={`rounded-xl transition-colors ${activeSettingsTab === "bookmarks" ? "bg-accent hover:bg-accent-dark text-accent-foreground" : "text-muted-foreground hover:text-accent hover:bg-accent/10"}`}
                >
                  <BookmarkIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                {children}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
