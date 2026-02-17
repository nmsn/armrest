import { Folder, Bookmark as BookmarkIcon } from "lucide-react"

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  code: Folder,
  wrench: Folder,
  palette: Folder,
  users: Folder,
  bookmark: BookmarkIcon,
  sparkles: BookmarkIcon,
}

interface FolderItem {
  id: string
  name: string
  icon: string
  color: string
}

interface FolderSidebarProps {
  folders: FolderItem[]
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
    return ICON_COMPONENTS[iconId] || Folder
  }

  return (
    <div className="w-11 shrink-0 flex flex-col justify-center py-2 gap-1">
      {showAll && (
        <button
          onClick={() => onSelect("all")}
          className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-colors ${
            selectedId === "all"
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
            className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-colors ${
              selectedId === folder.id
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
