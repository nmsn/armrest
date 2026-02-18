import { Folder, Bookmark as BookmarkIcon, Code, Wrench, Palette, Users, Settings, Star, Sparkles, Home, Search, Heart, Mail, Calendar, Clock, Link, Image, Music, Video, File, Trash2, Edit2, Save, Share2 } from "lucide-react"
import { BookmarkFolder } from "@/lib/bookmarks"

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

interface FolderSidebarProps {
  folders: BookmarkFolder[]
  selectedId: string | null
  onSelect: (id: string) => void
  showAll?: boolean
  allLabel?: string
}

export function FolderSidebar({
  folders,
  selectedId,
  onSelect,
  showAll = true,
  allLabel = "All"
}: FolderSidebarProps) {
  const getIconComponent = (iconId: string) => {
    const iconKey = (iconId || "folder") as keyof typeof ICON_COMPONENTS
    return ICON_COMPONENTS[iconKey] || Folder
  }

  return (
    <div className="w-11 shrink-0 flex flex-col justify-center py-2 gap-1">
      {showAll && (
        <button
          onClick={() => onSelect("all")}
          className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-colors ${selectedId === "all"
            ? "bg-accent text-white"
            : "text-muted hover:bg-accent/10 hover:text-accent"
            }`}
          title={allLabel}
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>
      )}
      {folders.map((folder) => {
        const FolderIcon = getIconComponent(folder.icon || "folder")
        return (
          <button
            key={folder.id}
            onClick={() => onSelect(folder.id)}
            className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-colors ${selectedId === folder.id
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
  )
}
