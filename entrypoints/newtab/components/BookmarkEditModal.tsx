import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { WebsiteMetadata, fetchWebsiteInfo, normalizeUrl, isValidUrl } from "@/lib/website"

interface BookmarkFormData {
  name: string
  url: string
  logo?: string
  description?: string
  color?: string
}

interface BookmarkEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: BookmarkFormData) => void
  initialData?: BookmarkFormData
  title?: string
}

export function BookmarkEditModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = "Add Bookmark"
}: BookmarkEditModalProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [url, setUrl] = useState(initialData?.url || "")
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name)
        setUrl(initialData.url)
      } else {
        setName("")
        setUrl("")
      }
      setWebsiteInfo(null)
    }
  }, [initialData, isOpen])

  const handleFetchInfo = async () => {
    const normalizedUrl = normalizeUrl(url)
    if (!isValidUrl(normalizedUrl)) return

    setIsLoading(true)
    try {
      const info = await fetchWebsiteInfo(normalizedUrl)
      setWebsiteInfo(info)
      if (!name && info.title) {
        setName(info.title)
      }
    } catch {
      setWebsiteInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    const normalizedUrl = normalizeUrl(url)
    if (!name.trim() || !normalizedUrl) return

    onSave({
      name: name.trim(),
      url: normalizedUrl,
      logo: websiteInfo?.logo,
      description: websiteInfo?.description,
      color: initialData?.color,
    })
    onClose()
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
            if (parent) parent.innerHTML = (name || url || '?').charAt(0).toUpperCase()
          }}
        />
      )
    }
    return null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-xl bg-white border border-border flex items-center justify-center">
              {getDisplayIcon() || (
                <span className="text-lg font-bold text-muted">
                  {(name || url || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Website Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GitHub"
              className="rounded-lg border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Website URL</label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="github.com"
                className="rounded-lg border-border flex-1"
              />
              <Button
                variant="outline"
                onClick={handleFetchInfo}
                disabled={isLoading}
                className="border-border hover:border-primary text-primary rounded-lg font-medium transition-colors"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "获取"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="flex-1 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border hover:border-primary text-primary rounded-lg font-medium transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
