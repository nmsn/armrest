import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Pencil, FolderPlus, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  BookmarkFolder,
  getBookmarks,
  deleteFolder,
  deleteBookmark,
  exportBookmarks,
  importBookmarks,
} from "@/lib/bookmarks"
import { getIconComponent } from "@/lib/icons"

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
  isLoggedIn?: boolean
  user?: { name?: string; image?: string } | null
  onLogin?: () => void
  onLogout?: () => void
}

export function BookmarksSettings({ folders: _folderOptions, onBookmarkAdded, isBookmarkModalOpen: _isBookmarkModalOpen, onBookmarkModalClose: _onBookmarkModalClose, onBookmarkModalOpen, editingBookmark: _editingBookmark, onSaveBookmark: _onSaveBookmark, onEditBookmark, isFolderModalOpen: _isFolderModalOpen, onFolderModalClose: _onFolderModalClose, onFolderModalOpen: _onFolderModalOpen, editingFolder: _editingFolder, onSaveFolder: _onSaveFolder, onOpenFolderModal, isLoggedIn = false, user = null, onLogin, onLogout }: BookmarksSettingsProps) {
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

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "folder"; id: string } | { type: "bookmark"; folderId: string; id: string } | null>(null)
  const [importData, setImportData] = useState<{ text: string } | null>(null)
  const [importMerge, setImportMerge] = useState(true)

  const handleDeleteFolder = (folderId: string) => {
    setDeleteConfirm({ type: "folder", id: folderId })
  }

  const confirmDeleteFolder = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "folder") return
    const folderId = deleteConfirm.id
    try {
      await deleteFolder(folderId)
      if (activeFolderId === folderId) {
        setActiveFolderId(folders[0]?.id || "")
      }
      await loadBookmarks()
      onBookmarkAdded?.()
    } catch (error) {
      console.error("Failed to delete folder:", error)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleDeleteBookmark = (bookmarkId: string) => {
    if (!activeFolderId) return
    setDeleteConfirm({ type: "bookmark", folderId: activeFolderId, id: bookmarkId })
  }

  const confirmDeleteBookmark = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "bookmark") return
    const { folderId, id } = deleteConfirm
    try {
      await deleteBookmark(folderId, id)
      await loadBookmarks()
      onBookmarkAdded?.()
    } catch (error) {
      console.error("Failed to delete bookmark:", error)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const cancelDelete = () => setDeleteConfirm(null)

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

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      setImportData({ text })
    }
    input.click()
  }

  const confirmImport = async () => {
    if (!importData) return
    setIsImporting(true)
    try {
      await importBookmarks(importData.text, importMerge)
      await loadBookmarks()
      onBookmarkAdded?.()
      setImportData(null)
    } catch (error) {
      console.error("Failed to import bookmarks:", error)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 p-4 border-2 border-accent/30 rounded-xl bg-accent/5">
        <h3 className="text-lg font-semibold mb-3">云同步</h3>
        {isLoggedIn ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user?.image && <img src={user.image} className="w-8 h-8 rounded-full" />}
              <span className="text-sm">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>登出</Button>
          </div>
        ) : (
          <Button variant="default" className="w-full" onClick={onLogin}>登录以同步书签</Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Folders</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="text-muted-foreground hover:text-accent h-8 w-8 p-0"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImport}
            disabled={isImporting}
            className="text-muted-foreground hover:text-accent h-8 w-8 p-0"
            title="Import"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {folders.map((folder) => {
          const IconComponent = getIconComponent(folder.icon || "folder")
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
                className="flex-1 text-left text-sm font-medium text-foreground"
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
                  className="h-5 w-5 p-0 text-muted-foreground hover:bg-accent/10"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="h-5 w-5 p-0 text-muted-foreground hover:bg-accent/10"
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
          className="h-8 px-2 border border-dashed border-border text-muted-foreground hover:border-accent rounded-lg bg-surface hover:bg-accent/10"
        >
          <FolderPlus className="w-3.5 h-3.5 mr-1" />
          <span className="text-sm">新增</span>
        </Button>
      </div>

      {activeFolder && (
        <>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeFolder.bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">暂无书签</p>
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
                    <p className="text-sm text-foreground font-medium truncate">{bookmark.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onEditBookmark?.({ id: bookmark.id, name: bookmark.name, url: bookmark.url, color: bookmark.color })
                    }}
                    className="text-muted-foreground hover:bg-accent/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    className="text-muted-foreground hover:bg-accent/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-4 w-72 shadow-lg">
            <p className="text-sm font-medium text-foreground mb-3">
              {deleteConfirm.type === "folder"
                ? `确定删除文件夹"${folders.find(f => f.id === deleteConfirm.id)?.name}"？该操作不可恢复。`
                : "确定删除此书签？该操作不可恢复。"}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={cancelDelete}>取消</Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteConfirm.type === "folder" ? confirmDeleteFolder : confirmDeleteBookmark}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      )}

      {importData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-4 w-72 shadow-lg space-y-3">
            <p className="text-sm font-medium text-foreground">如何处理导入的书签？</p>
            <div className="flex gap-2">
              <Button
                variant={importMerge ? "default" : "outline"}
                size="sm"
                onClick={() => setImportMerge(true)}
                className="flex-1"
              >
                合并
              </Button>
              <Button
                variant={!importMerge ? "default" : "outline"}
                size="sm"
                onClick={() => setImportMerge(false)}
                className="flex-1"
              >
                替换
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setImportData(null)}>取消</Button>
              <Button variant="default" size="sm" onClick={confirmImport}>导入</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
