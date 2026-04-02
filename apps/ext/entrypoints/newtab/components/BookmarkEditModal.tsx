import { useState, useEffect } from "react"
import { Loader2, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { fetchWebsiteInfo, normalizeUrl, isValidUrl } from "@/lib/website"
import { cn } from "@/lib/utils"

function checkImageAvailable(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

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
  const [logo, setLogo] = useState(initialData?.logo || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [isLoading, setIsLoading] = useState(false)
  const [iconSources, setIconSources] = useState<{ url: string; available: boolean }[]>([])
  const [selectedIconIndex, setSelectedIconIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name)
        setUrl(initialData.url)
        setLogo(initialData.logo || "")
        setDescription(initialData.description || "")
      } else {
        setName("")
        setUrl("")
        setLogo("")
        setDescription("")
      }
      setIconSources([])
      setSelectedIconIndex(0)
    }
  }, [initialData, isOpen])

  const handleFetchInfo = async () => {
    const normalizedUrl = normalizeUrl(url)
    if (!isValidUrl(normalizedUrl)) return

    setIsLoading(true)
    try {
      const info = await fetchWebsiteInfo(normalizedUrl)

      // Check which icon sources are available
      const sources: { url: string; available: boolean }[] = []

      // Source 1: fetched logo
      if (info.logo) {
        const ok = await checkImageAvailable(info.logo)
        sources.push({ url: info.logo, available: ok })
      }

      // Source 2: jsdelivr GitHub SVG service
      const domain = (info.domain || normalizedUrl.split('/')[2]?.replace('www.', '') || '').split('.')[0]
      const jsdelivrUrl = `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${domain}/default.svg`
      const jsdelivrOk = await checkImageAvailable(jsdelivrUrl)
      sources.push({ url: jsdelivrUrl, available: jsdelivrOk })

      setIconSources(sources)

      // Auto-select first available source
      const firstAvailable = sources.findIndex(s => s.available)
      if (firstAvailable >= 0) {
        setSelectedIconIndex(firstAvailable)
        setLogo(sources[firstAvailable].url)
      } else if (info.logo) {
        setLogo(info.logo)
        setSelectedIconIndex(0)
      }

      if (!name && info.title) {
        setName(info.title)
      }
    } catch {
      setIconSources([])
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
      logo: logo || undefined,
      description: description || undefined,
      color: initialData?.color,
    })
    onClose()
  }

  const getDisplayIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    }
    if (logo) {
      return (
        <img
          src={logo}
          alt=""
          className="w-8 h-8 rounded-lg object-contain"
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-xl bg-black border border-border flex items-center justify-center">
              {getDisplayIcon() || (
                <span className="text-lg font-bold text-muted-foreground">
                  {(name || url || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">网址</label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="例如 github.com"
                className="rounded-lg border-border flex-1 bg-background text-foreground"
              />
              <Button
                variant="outline"
                onClick={handleFetchInfo}
                disabled={isLoading}
                className="border-border hover:border-accent text-foreground rounded-lg font-medium transition-colors"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "获取"}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., GitHub"
              className="rounded-lg border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Logo URL</label>
            <div className="flex gap-2">
              <Input
                value={logo}
                onChange={async (e) => {
                  const val = e.target.value
                  setLogo(val)
                  // Auto-check if manually edited logo URL is available
                  if (val && val.startsWith('http')) {
                    const ok = await checkImageAvailable(val)
                    if (ok) {
                      setIconSources([{ url: val, available: true }])
                      setSelectedIconIndex(0)
                    }
                  }
                }}
                placeholder="https://example.com/logo.png"
                className="rounded-lg border-border flex-1 bg-background text-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open("https://www.thesvg.org/", "_blank")}
                className="border-border hover:border-accent rounded-lg transition-colors shrink-0 w-10 h-10 p-0 overflow-hidden bg-black"
                title="在 thesvg.org 查找图标"
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/thesvg/default.svg"
                  alt="查找图标"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </Button>
            </div>
          </div>
          {iconSources.filter(s => s.available).length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">选择图标</label>
              <div className="flex gap-2">
                {iconSources.map((source, i) => (
                  <button
                    key={source.url}
                    onClick={() => {
                      setSelectedIconIndex(i)
                      setLogo(source.url)
                    }}
                    className={cn(
                      "relative w-10 h-10 rounded-lg border-2 bg-black overflow-hidden transition-all",
                      selectedIconIndex === i
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-border hover:border-accent/50"
                    )}
                  >
                    <img
                      src={source.url}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    {selectedIconIndex === i && (
                      <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">备注（选填）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加备注信息..."
              rows={2}
              className="w-full rounded-lg border border-border bg-background text-foreground text-sm px-3 py-2 resize-none placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border hover:border-accent text-foreground rounded-lg font-medium transition-colors"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-colors"
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
