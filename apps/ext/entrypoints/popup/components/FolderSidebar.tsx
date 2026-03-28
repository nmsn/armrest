import { BookmarkFolder } from "@/lib/bookmarks"
import { getIconComponent } from "@/lib/icons"

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
}: FolderSidebarProps) {
  return (
    <div className="w-11 shrink-0 flex flex-col justify-center py-2 gap-1">
      {folders.map((folder) => {
        const FolderIcon = getIconComponent(folder.icon || "folder")
        const isSelected = selectedId === folder.id
        return (
          <button
            key={folder.id}
            onClick={() => onSelect(folder.id)}
            className={`w-8 h-8 mx-1 rounded-full flex items-center justify-center transition-colors ${isSelected
              ? "text-white"
              : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
              }`}
            style={isSelected ? { backgroundColor: folder.color || "#8B5CF6" } : undefined}
            title={folder.name}
          >
            <FolderIcon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}
