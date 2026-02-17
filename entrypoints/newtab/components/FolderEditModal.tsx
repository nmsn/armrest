import { useState, useEffect } from "react"
import {
  Code,
  Wrench,
  Palette,
  Users,
  Bookmark,
  Settings,
  Folder,
  Star,
  Check,
  Sparkles,
  Home,
  Search,
  Heart,
  Mail,
  Calendar,
  Clock,
  Link,
  Image,
  Music,
  Video,
  File,
  Trash2,
  Edit2,
  Save,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { BOOKMARK_CONFIG } from "@/lib/constants"

const ICON_COMPONENTS: Record<string, any> = {
  code: Code,
  wrench: Wrench,
  palette: Palette,
  users: Users,
  bookmark: Bookmark,
  settings: Settings,
  folder: Folder,
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

export interface FolderFormData {
  name: string
  icon: string
  color: string
}

interface FolderEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FolderFormData) => void
  initialData?: FolderFormData
  title?: string
}

export function FolderEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = "Add Folder"
}: FolderEditModalProps) {
  const [name, setName] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("folder")
  const [selectedColor, setSelectedColor] = useState<string>(BOOKMARK_CONFIG.FOLDER_COLORS[0])
  const [showMoreIcons, setShowMoreIcons] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name)
        setSelectedIcon(initialData.icon)
        setSelectedColor(initialData.color)
      } else {
        setName("")
        setSelectedIcon("folder")
        setSelectedColor(BOOKMARK_CONFIG.COLOR_OPTIONS[0])
      }
      setShowMoreIcons(false)
    }
  }, [initialData, isOpen])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor
    })
    onClose()
  }

  const allIconOptions = [
    ...BOOKMARK_CONFIG.ICON_OPTIONS,
    ...(showMoreIcons ? BOOKMARK_CONFIG.MORE_ICON_OPTIONS : [])
  ]

  const getIconComponent = (iconId: string) => {
    return ICON_COMPONENTS[iconId] || Folder
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Preview</label>
            <div className="flex items-center justify-center py-4 border border-border rounded-xl bg-surface">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedColor }}
              >
                {(() => {
                  const Icon = getIconComponent(selectedIcon)
                  return <Icon className="w-8 h-8 text-white" />
                })()}
              </div>
              <span className="ml-4 text-lg font-medium text-foreground">
                {name || "Folder Name"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="rounded-lg border-border bg-background text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {allIconOptions.map((option) => {
                const Icon = getIconComponent(option.id)
                const isSelected = selectedIcon === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedIcon(option.id)}
                    className={`p-3 rounded-xl border transition-all ${isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
                      }`}
                    title={option.label}
                    type="button"
                  >
                    <Icon className={`w-5 h-5 mx-auto ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
                  </button>
                )
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoreIcons(!showMoreIcons)}
              className="w-full mt-2 text-sm text-muted-foreground"
            >
              {showMoreIcons ? (
                <ChevronUp className="w-4 h-4 mr-2" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-2" />
              )}
              {showMoreIcons ? "Show Less" : "Show More"}
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {BOOKMARK_CONFIG.COLOR_OPTIONS.map((color) => {
                const isSelected = selectedColor === color
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 rounded-xl transition-all ${isSelected ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                    style={{ backgroundColor: color }}
                    type="button"
                  >
                    {isSelected && <Check className="w-5 h-5 text-white mx-auto" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-accent hover:bg-accent-dark text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
