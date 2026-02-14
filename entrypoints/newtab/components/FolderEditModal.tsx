import { useState, useEffect } from "react"
import { Code, Wrench, Palette, Users, Bookmark, Settings, Folder, Star, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#14B8A6", // Teal
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
    if (initialData) {
      setName(initialData.name)
      setSelectedIcon(initialData.icon)
      setSelectedColor(initialData.color)
    } else {
      setName("")
      setSelectedIcon("folder")
      setSelectedColor(COLOR_OPTIONS[0])
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">Preview</label>
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
              <span className="ml-4 text-lg font-medium text-primary">
                {name || "Folder Name"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-primary mb-2 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="rounded-lg border-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-primary mb-2 block">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = selectedIcon === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedIcon(option.id)}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                    title={option.label}
                  >
                    <Icon className={`w-5 h-5 mx-auto ${isSelected ? "text-accent" : "text-secondary"}`} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-primary mb-2 block">Color</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => {
                const isSelected = selectedColor === color
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 rounded-xl transition-all ${
                      isSelected ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && <Check className="w-5 h-5 text-white mx-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 bg-accent hover:bg-accent-dark text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
