import { Code, Wrench, Palette, Users, Bookmark as BookmarkIcon, Folder, Star, Sparkles } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { BookmarkFolder } from "@/lib/bookmarks"

const FOLDER_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  wrench: Wrench,
  palette: Palette,
  users: Users,
  bookmark: BookmarkIcon,
  settings: Folder,
  folder: Folder,
  star: Star,
  sparkles: Sparkles,
}

const FOLDER_ITEM_ID_PREFIX = "folder-item:"

function getFolderItemDragId(folderId: string): string {
  return `${FOLDER_ITEM_ID_PREFIX}${folderId}`
}

interface FolderListProps {
  folders: BookmarkFolder[]
  activeIndex: number
  onSelect: (index: number) => void
}

interface SortableFolderItemProps {
  folder: BookmarkFolder
  index: number
  isActive: boolean
  onSelect: (index: number) => void
}

function SortableFolderItem({ folder, index, isActive, onSelect }: SortableFolderItemProps) {
  const {
    isOver,
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: getFolderItemDragId(folder.id),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  const FolderIcon = FOLDER_ICON_MAP[folder.icon || "folder"] || Folder

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(index)}
      {...attributes}
      {...listeners}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${isOver ? "ring-2 ring-accent/40" : ""
        } ${isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
        }`}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: folder.color || "#6366F1" }}
      >
        <FolderIcon className="w-3 h-3 text-white" />
      </div>
      <span className="truncate">{folder.name}</span>
    </button>
  )
}

export function FolderList({ folders, activeIndex, onSelect }: FolderListProps) {
  const folderIds = folders.map((folder) => getFolderItemDragId(folder.id))

  return (
    <SortableContext items={folderIds} strategy={verticalListSortingStrategy}>
      <div className="space-y-1">
        {folders.map((folder, index) => (
          <SortableFolderItem
            key={folder.id}
            folder={folder}
            index={index}
            isActive={activeIndex === index}
            onSelect={onSelect}
          />
        ))}
      </div>
    </SortableContext>
  )
}

export { getFolderItemDragId }
