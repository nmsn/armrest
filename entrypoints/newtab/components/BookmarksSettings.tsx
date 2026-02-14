import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Pencil, FolderPlus, Code, Wrench, Palette, Users, Bookmark, Upload, Download, Settings, Folder, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  BookmarkFolder,
  getBookmarks,
  deleteFolder,
  deleteBookmark,
  exportBookmarks,
  importBookmarks,
} from "@/lib/bookmarks"
import { FolderEditModal, FolderFormData } from "./FolderEditModal"
import { BookmarkEditModal } from "./BookmarkEditModal"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  wrench: Wrench,
  palette: Palette,
  users: Users,
  bookmark: Bookmark,
  settings: Settings,
  folder: Folder,
  star: Star,
}

function generateColor(): string {
  const colors = [
    "#4285F4", "#EA4335", "#FBBC05", "#34A853",
    "#24292F", "#FC6D26", "#0052CC", "#4A154B",
    "#F24E1E", "#FF0000", "#1DA1F2", "#FF4500",
    "#5E6AD2", "#10B981", "#8B5CF6", "#EC4899",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

interface BookmarksSettingsProps {
  folders?: BookmarkFolder[]
  onBookmarkAdded?: () => void
  isBookmarkModalOpen: boolean
  onBookmarkModalClose: () => void
  onBookmarkModalOpen?: () => void
  editingBookmark: { id: string; name: string; url: string; color?: string } | null
  onSaveBookmark: (data: { name: string; url: string; logo?: string; description?: string; color?: string }) => Promise<void>
  onEditBookmark?: (bookmark: { id: string; name: string; url: string; color?: string }) => void
  isFolderModalOpen: boolean
  onFolderModalClose: () => void
  onFolderModalOpen?: () => void
  editingFolder: { id: string; data: { name: string; icon: string; color: string } } | null
  onSaveFolder: (data: { name: string; icon: string; color: string }) => Promise<void>
  onOpenFolderModal?: (folder?: { id: string; data: { name: string; icon: string; color: string } }) => void
}

export function BookmarksSettings({ folders: folderOptions, onBookmarkAdded, isBookmarkModalOpen, onBookmarkModalClose, onBookmarkModalOpen, editingBookmark, onSaveBookmark, onEditBookmark, isFolderModalOpen, onFolderModalClose, onFolderModalOpen, editingFolder, onSaveFolder, onOpenFolderModal }: BookmarksSettingsProps) {
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const loadBookmarks = useCallback(async () => {
    try {
      const data = await getBookmarks()
      setFolders(data.folders)
      if (!activeFolderId && data.folders.length > 0) {
        setActiveFolderId(data.folders[0].id)
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error)
    }
  }, [activeFolderId])

  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  const activeFolder = folders.find(f => f.id === activeFolderId)

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder and all its bookmarks?")) return
    try {
      await deleteFolder(folderId)
      if (activeFolderId === folderId) {
        setActiveFolderId(folders[0]?.id || "")
      }
      await loadBookmarks()
      onBookmarkAdded?.()
    } catch (error) {
      console.error("Failed to delete folder:", error)
    }
  }

  const handleModalSave = (data: { name: string; icon: string; color: string }) => {
    onSaveFolder(data)
    onFolderModalClose()
  }

  const handleDelete = async (bookmarkId: string) => {
    if (!activeFolderId) return
    try {
      await deleteBookmark(activeFolderId, bookmarkId)
      await loadBookmarks()
      onBookmarkAdded?.()
    } catch (error) {
      console.error("Failed to delete bookmark:", error)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const json = await exportBookmarks()
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `armrest-bookmarks-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export bookmarks:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsImporting(true)
      try {
        const text = await file.text()
        const merge = confirm("Merge with existing bookmarks? Click OK to merge, Cancel to replace.")
        await importBookmarks(text, merge)
        await loadBookmarks()
        onBookmarkAdded?.()
      } catch (error) {
        console.error("Failed to import bookmarks:", error)
        alert("Failed to import bookmarks. Please check the file format.")
      } finally {
        setIsImporting(false)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-primary">Folders</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="text-muted hover:text-accent h-8 w-8 p-0"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImport}
            disabled={isImporting}
            className="text-muted hover:text-accent h-8 w-8 p-0"
            title="Import"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {folders.map((folder) => {
          const IconComponent = ICON_MAP[folder.icon || "folder"]
          return (
            <div
              key={folder.id}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-colors ${activeFolderId === folder.id
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
                }`}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: folder.color || "#6366F1" }}
              >
                {IconComponent && <IconComponent className="w-3.5 h-3.5 text-white" />}
              </div>
              <button
                onClick={() => setActiveFolderId(folder.id)}
                className="flex-1 text-left text-sm font-medium text-primary"
              >
                {folder.name}
              </button>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenFolderModal?.({
                    id: folder.id,
                    data: {
                      name: folder.name,
                      icon: folder.icon || "folder",
                      color: folder.color || "#6366F1"
                    }
                  })}
                  className="h-5 w-5 p-0 text-muted hover:bg-gray-100"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="h-5 w-5 p-0 text-muted hover:bg-gray-100"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )
        })}
        <Button
          variant="ghost"
          onClick={() => onOpenFolderModal?.()}
          className="h-8 px-2 border border-dashed border-border text-muted hover:border-accent rounded-lg bg-surface hover:bg-gray-100"
        >
          <FolderPlus className="w-3.5 h-3.5 mr-1" />
          <span className="text-sm">新增</span>
        </Button>
      </div>

      {activeFolder && (
        <>
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-primary mb-3">
              Bookmarks in "{activeFolder.name}"
            </h3>

            <Button
              variant="outline"
              onClick={() => {
                onBookmarkModalOpen?.()
              }}
              className="w-full border-border hover:border-primary text-primary rounded-xl font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeFolder.bookmarks.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No bookmarks yet</p>
            ) : (
              activeFolder.bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:border-accent/30 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: bookmark.color || "#6366F1" }}
                  >
                    {bookmark.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary font-medium truncate">{bookmark.name}</p>
                    <p className="text-xs text-muted truncate">{bookmark.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onEditBookmark?.({ id: bookmark.id, name: bookmark.name, url: bookmark.url, color: bookmark.color })
                    }}
                    className="text-muted hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(bookmark.id)}
                    className="text-muted hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* <FolderEditModal
        isOpen={isFolderModalOpen}
        onClose={onFolderModalClose}
        onSave={handleModalSave}
        initialData={editingFolder?.data}
        title={editingFolder ? "Edit Folder" : "Add Folder"}
      /> */}

      {/* <BookmarkEditModal
        isOpen={isBookmarkModalOpen}
        onClose={() => {
          setIsAdding(false)
          onBookmarkModalClose()
        }}
        onSave={async (data) => {
          await onSaveBookmark(data)
          setIsAdding(false)
        }}
        initialData={editingBookmark || undefined}
        title={editingBookmark ? "Edit Bookmark" : "Add Bookmark"}
      /> */}
    </div>
  )
}
