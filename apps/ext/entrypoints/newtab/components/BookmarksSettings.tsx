import { useState, useCallback } from "react"
import { Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  exportBookmarks,
  importBookmarks,
} from "@/lib/bookmarks"

interface BookmarksSettingsProps {
  isLoggedIn?: boolean
  user?: { name?: string; image?: string } | null
  onLogin?: () => void
  onLogout?: () => void
}

export function BookmarksSettings({ isLoggedIn = false, user = null, onLogin, onLogout }: BookmarksSettingsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importData, setImportData] = useState<{ text: string } | null>(null)
  const [importMerge, setImportMerge] = useState(true)

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
        <h3 className="text-sm font-medium text-foreground">书签管理</h3>
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
