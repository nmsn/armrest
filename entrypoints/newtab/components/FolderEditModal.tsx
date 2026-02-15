import { useState, useEffect } from "react"
import { Code, Wrench, Palette, Users, Bookmark, Settings, Folder, Star, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const ICON_OPTIONS = [
  { id: "code", icon: Code, label: "Code" },
  { id: "wrench", icon: Wrench, label: "Tools" },
  { id: "palette", icon: Palette, label: "Design" },
  { id: "users", icon: Users, label: "Social" },
  { id: "bookmark", icon: Bookmark, label: "Bookmark" },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "folder", icon: Folder, label: "Folder" },
  { id: "star", icon: Star, label: "Star" },
]

const COLOR_OPTIONS = [
  "#6366F1",
  "#10B981",
  "#EC4899",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#14B8A6",
]

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
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0])

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name)
        setSelectedIcon(initialData.icon)
        setSelectedColor(initialData.color)
      } else {
        setName("")
        setSelectedIcon("folder")
        setSelectedColor(COLOR_OPTIONS[0])
      }
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
                  const iconOption = ICON_OPTIONS.find(i => i.id === selectedIcon)
                  const Icon = iconOption?.icon || Folder
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
              {ICON_OPTIONS.map((option) => {
                const Icon = option.icon
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
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => {
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
