import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, X, Loader2, Upload, Download, Pencil, Check, FolderPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchWebsiteInfo, normalizeUrl, isValidUrl, WebsiteMetadata } from "@/lib/website"
import {
  Bookmark,
  BookmarkFolder,
  getBookmarks,
  addFolder,
  updateFolder,
  deleteFolder,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  exportBookmarks,
  importBookmarks,
} from "@/lib/bookmarks"

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
  folders: { id: string; name: string; icon?: string }[]
  onBookmarkAdded?: () => void
}

export function BookmarksSettings({ folders: folderOptions, onBookmarkAdded }: BookmarksSettingsProps) {
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [isEditingFolder, setIsEditingFolder] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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

  useEffect(() => {
    const fetchInfo = async () => {
      const normalizedUrl = normalizeUrl(newUrl)
      if (isValidUrl(normalizedUrl)) {
        setIsLoading(true)
        try {
          const info = await fetchWebsiteInfo(normalizedUrl)
          setWebsiteInfo(info)
          if (!newName) {
            setNewName(info.title)
          }
        } catch {
          setWebsiteInfo(null)
        } finally {
          setIsLoading(false)
        }
      } else {
        setWebsiteInfo(null)
      }
    }

    const timer = setTimeout(() => {
      if (newUrl.trim()) {
        fetchInfo()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [newUrl, newName])

  const activeFolder = folders.find(f => f.id === activeFolderId)

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await addFolder(newFolderName.trim())
      await loadBookmarks()
      onBookmarkAdded?.()
      setNewFolderName("")
      setIsAddingFolder(false)
    } catch (error) {
      console.error("Failed to add folder:", error)
    }
  }

  const handleUpdateFolder = async (folderId: string) => {
    if (!newFolderName.trim()) return
    try {
      await updateFolder(folderId, { name: newFolderName.trim() })
      await loadBookmarks()
      onBookmarkAdded?.()
      setNewFolderName("")
      setIsEditingFolder(false)
      setEditingFolderId(null)
    } catch (error) {
      console.error("Failed to update folder:", error)
    }
  }

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

  const handleAdd = async () => {
    const normalizedUrl = normalizeUrl(newUrl)
    if (!newName.trim() || !normalizedUrl || !activeFolderId) return

    try {
      const color = websiteInfo?.logo ? generateColor() : generateColor()
      await addBookmark(activeFolderId, {
        name: newName.trim(),
        url: normalizedUrl,
        description: websiteInfo?.description,
        logo: websiteInfo?.logo,
        color,
      })
      await loadBookmarks()
      onBookmarkAdded?.()
      setNewName("")
      setNewUrl("")
      setWebsiteInfo(null)
      setIsAdding(false)
    } catch (error) {
      console.error("Failed to add bookmark:", error)
    }
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

  const getDisplayIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-8 h-8 animate-spin text-muted" />
    }
    if (websiteInfo?.logo) {
      return (
        <img
          src={websiteInfo.logo}
          alt=""
          className="w-8 h-8 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            const parent = (e.target as HTMLImageElement).parentElement
            if (parent) parent.innerHTML = (newName || newUrl || '?').charAt(0).toUpperCase()
          }}
        />
      )
    }
    return null
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

      <div className="flex flex-wrap gap-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${activeFolderId === folder.id
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-secondary hover:border-accent/50"
              }`}
          >
            {editingFolderId === folder.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-6 w-24 text-xs py-1 px-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateFolder(folder.id)
                    if (e.key === "Escape") {
                      setIsEditingFolder(false)
                      setEditingFolderId(null)
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateFolder(folder.id)}
                  className="h-6 w-6 p-0 text-accent"
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveFolderId(folder.id)}
                  className="text-sm font-medium"
                >
                  {folder.name}
                </button>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingFolderId(folder.id)
                      setNewFolderName(folder.name)
                      setIsEditingFolder(true)
                    }}
                    className="h-5 w-5 p-0 text-muted hover:text-accent"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="h-5 w-5 p-0 text-muted hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        {isAddingFolder ? (
          <div className="flex items-center gap-1">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="h-7 w-28 text-xs py-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddFolder()
                if (e.key === "Escape") {
                  setIsAddingFolder(false)
                  setNewFolderName("")
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddFolder}
              className="h-7 w-7 p-0 text-accent"
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingFolder(true)}
            className="h-7 text-muted hover:text-accent"
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {activeFolder && (
        <>
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-primary mb-3">
              Bookmarks in "{activeFolder.name}"
            </h3>

            {isAdding ? (
              <div className="space-y-3 p-4 border border-border rounded-xl bg-surface">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center">
                    {getDisplayIcon() || (
                      <span className="text-lg font-bold text-muted">
                        {(newName || newUrl || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Website Name</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., GitHub"
                    className="rounded-lg border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block">Website URL</label>
                  <Input
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="github.com"
                    className="rounded-lg border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdd}
                    className="flex-1 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false)
                      setNewName("")
                      setNewUrl("")
                      setWebsiteInfo(null)
                    }}
                    className="border-border hover:border-primary text-primary rounded-lg font-medium transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAdding(true)}
                className="w-full border-border hover:border-primary text-primary rounded-xl font-medium transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
            )}
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
                    onClick={() => handleDelete(bookmark.id)}
                    className="text-muted hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
