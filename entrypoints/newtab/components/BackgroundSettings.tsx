import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { ThemeMode, ThemeConfig, getThemeConfig, setThemeConfig, applyTheme, subscribeToThemeChanges, defaultThemeConfig } from "@/lib/theme"

const PRESET_BACKGROUNDS = [
  { id: "paper", name: "Paper", color: "#FAFAFA", text: "Paper" },
  { id: "soft-gray", name: "Soft Gray", color: "#F5F5F5", text: "Soft Gray" },
  { id: "warm-white", name: "Warm White", color: "#FFF8F0", text: "Warm White" },
  { id: "cool-blue", name: "Cool Blue", color: "#F0F4FF", text: "Cool Blue" },
  { id: "mint", name: "Mint", color: "#F0FFF4", text: "Mint" },
  { id: "lavender", name: "Lavender", color: "#FAF5FF", text: "Lavender" },
  { id: "peach", name: "Peach", color: "#FFF5F0", text: "Peach" },
  { id: "sky", name: "Sky", color: "#F0FAFF", text: "Sky" },
]

interface BackgroundSettingsProps {
  backgroundColor?: string
  backgroundImage?: string
  onBackgroundChange?: (color: string, image: string) => void
}

export function BackgroundSettings({ backgroundColor: externalBgColor, backgroundImage: externalBgImage, onBackgroundChange }: BackgroundSettingsProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultThemeConfig.mode)
  const [backgroundColor, setBackgroundColor] = useState(defaultThemeConfig.backgroundColor)
  const [backgroundImage, setBackgroundImage] = useState(defaultThemeConfig.backgroundImage)
  const [customColor, setCustomColor] = useState(defaultThemeConfig.backgroundColor)
  const [isInitialized, setIsInitialized] = useState(false)

  const effectiveBgColor = externalBgColor ?? backgroundColor
  const effectiveBgImage = externalBgImage ?? backgroundImage

  useEffect(() => {
    async function loadConfig() {
      const config = await getThemeConfig()
      setThemeMode(config.mode)
      setBackgroundColor(config.backgroundColor)
      setBackgroundImage(config.backgroundImage)
      setCustomColor(config.backgroundColor)
      applyTheme(config.mode)
      onBackgroundChange?.(config.backgroundColor, config.backgroundImage)
      setIsInitialized(true)
    }
    loadConfig()
  }, [onBackgroundChange])

  useEffect(() => {
    if (!isInitialized) return

    const unsubscribe = subscribeToThemeChanges((config: ThemeConfig) => {
      setThemeMode(config.mode)
      setBackgroundColor(config.backgroundColor)
      setBackgroundImage(config.backgroundImage)
      setCustomColor(config.backgroundColor)
      applyTheme(config.mode)
      onBackgroundChange?.(config.backgroundColor, config.backgroundImage)
    })

    return () => unsubscribe()
  }, [isInitialized, onBackgroundChange])

  useEffect(() => {
    if (!isInitialized) return
    applyTheme(themeMode)
    setThemeConfig({ mode: themeMode })
  }, [themeMode, isInitialized])

  const handleBackgroundSelect = (color: string) => {
    setBackgroundColor(color)
    setCustomColor(color)
    setThemeConfig({ backgroundColor: color })
    onBackgroundChange?.(color, effectiveBgImage)
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    setBackgroundColor(color)
    setThemeConfig({ backgroundColor: color })
    onBackgroundChange?.(color, effectiveBgImage)
  }

  const handleApplyBackground = () => {
    if (effectiveBgImage) {
      setThemeConfig({ backgroundImage: effectiveBgImage })
      onBackgroundChange?.(effectiveBgColor, effectiveBgImage)
    }
  }

  const isSelected = (color: string) => effectiveBgColor === color

  if (!isInitialized) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-primary mb-3 block">Theme Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setThemeMode("light")}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${themeMode === "light"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-secondary hover:border-accent/50"
              }`}
          >
            Light
          </button>
          <button
            onClick={() => setThemeMode("dark")}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${themeMode === "dark"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-secondary hover:border-accent/50"
              }`}
          >
            Dark
          </button>
          <button
            onClick={() => setThemeMode("system")}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${themeMode === "system"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-secondary hover:border-accent/50"
              }`}
          >
            System
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-primary mb-3 block">Background Color</label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => handleBackgroundSelect(bg.color)}
              className={`relative h-12 rounded-lg border transition-all overflow-hidden ${isSelected(bg.color)
                ? "ring-2 ring-accent ring-offset-2"
                : "border-border hover:border-accent/50"
                }`}
              style={{ backgroundColor: bg.color }}
              title={bg.name}
            >
              {isSelected(bg.color) && (
                <Check className="absolute inset-0 m-auto w-4 h-4 text-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-primary mb-3 block">Custom Color</label>
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            className="h-10 w-14 p-1 rounded-lg border-border cursor-pointer"
          />
          <Input
            type="text"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            placeholder="#FFFFFF"
            className="flex-1 rounded-lg border-border text-sm"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="text-sm font-medium text-primary mb-3 block">Background Image URL</label>
        <Input
          type="text"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
          placeholder="https://..."
          className="rounded-lg border-border"
        />
      </div>

      <Button
        onClick={handleApplyBackground}
        className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl font-medium transition-colors"
      >
        Apply Background
      </Button>
    </div>
  )
}
