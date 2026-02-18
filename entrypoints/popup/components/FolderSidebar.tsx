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
  showAll = true,
  allLabel = "All"
}: FolderSidebarProps) {
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
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
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
