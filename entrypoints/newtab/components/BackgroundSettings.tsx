"use client"

import * as React from "react"
import { Sun, Moon, Monitor, Image, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeMode, getThemeConfig, setThemeConfig, applyTheme } from "@/lib/theme"

interface BackgroundSettingsProps {
  backgroundColor?: string
  backgroundImage?: string
  onBackgroundChange?: (color: string, image: string) => void
}

const THEME_COLORS = [
  "#FAFAFA",
  "#F5F5F5",
  "#EFEEEE",
  "#E8E4DE",
  "#F3E8FF",
  "#E0F2FE",
  "#FEF3C7",
  "#DCFCE7",
]

const DARK_THEME_COLORS = [
  { color: "#0F172A", name: "Dark Slate", rgb: "rgb(15, 23, 42)", usage: "主背景 - 深蓝灰色，适合暗色主题" },
  { color: "#1E1B4B", name: "Dark Indigo", rgb: "rgb(30, 27, 75)", usage: "主背景 - 深靛蓝色，优雅深沉" },
  { color: "#18181B", name: "Dark Zinc", rgb: "rgb(24, 24, 27)", usage: "主背景 - 深灰色，经典暗色" },
  { color: "#1F2937", name: "Dark Gray", rgb: "rgb(31, 41, 55)", usage: "卡片背景 - 中灰色，分层效果" },
  { color: "#111827", name: "True Black", rgb: "rgb(17, 24, 39)", usage: "强调背景 - 纯黑色，高对比" },
]

const BACKGROUND_IMAGES = [
  { name: "None", url: "" },
  { name: "Gradient 1", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80" },
  { name: "Gradient 2", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80" },
  { name: "Nature", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80" },
  { name: "Ocean", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80" },
  { name: "Mountain", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80" },
]

export function BackgroundSettings({ backgroundColor: externalBgColor, backgroundImage: externalBgImage, onBackgroundChange }: BackgroundSettingsProps) {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("system")
  const [backgroundColor, setBackgroundColor] = React.useState("#FAFAFA")
  const [backgroundImage, setBackgroundImage] = React.useState("")
  const [customColor, setCustomColor] = React.useState("#FAFAFA")

  React.useEffect(() => {
    async function loadConfig() {
      const config = await getThemeConfig()
      setThemeMode(config.mode)
      setBackgroundColor(config.backgroundColor)
      setBackgroundImage(config.backgroundImage)
      setCustomColor(config.backgroundColor)
    }
    loadConfig()
  }, [])

  const handleThemeChange = async (mode: ThemeMode) => {
    setThemeMode(mode)
    await setThemeConfig({ mode })
    applyTheme(mode)
  }

  const handleColorChange = async (color: string) => {
    setBackgroundColor(color)
    setCustomColor(color)
    await setThemeConfig({ backgroundColor: color })
    onBackgroundChange?.(color, backgroundImage)
  }

  const handleImageChange = async (image: string) => {
    setBackgroundImage(image)
    await setThemeConfig({ backgroundImage: image })
    onBackgroundChange?.(backgroundColor, image)
  }

  const effectiveBgColor = externalBgColor ?? backgroundColor
  const effectiveBgImage = externalBgImage ?? backgroundImage

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme Mode
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={themeMode === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange("light")}
            className={themeMode === "light" ? "bg-accent hover:bg-accent-dark text-white" : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/10"}
          >
            <Sun className="w-4 h-4 mr-2" />
            Light
          </Button>
          <Button
            variant={themeMode === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange("dark")}
            className={themeMode === "dark" ? "bg-accent hover:bg-accent-dark text-white" : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/10"}
          >
            <Moon className="w-4 h-4 mr-2" />
            Dark
          </Button>
          <Button
            variant={themeMode === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange("system")}
            className={themeMode === "system" ? "bg-accent hover:bg-accent-dark text-white" : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/10"}
          >
            <Monitor className="w-4 h-4 mr-2" />
            System
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Background Color
        </h3>

        {themeMode === "dark" ? (
          <div className="grid grid-cols-5 gap-3 mb-4">
            {DARK_THEME_COLORS.map((item) => (
              <button
                key={item.color}
                onClick={() => handleColorChange(item.color)}
                className={`w-full aspect-video rounded-lg border-2 transition-all duration-200 cursor-pointer relative ${effectiveBgColor === item.color ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-accent/50"
                  }`}
                style={{ backgroundColor: item.color }}
                aria-label={`Select background color ${item.color}`}
                title={item.usage}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {THEME_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-full aspect-video rounded-lg border-2 transition-all duration-200 cursor-pointer relative ${effectiveBgColor === color ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-accent/50"
                  }`}
                style={{ backgroundColor: color }}
                aria-label={`Select background color ${color}`}
              />
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-12 h-10 p-1 rounded-lg border-border cursor-pointer"
          />
          <Input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            onBlur={() => handleColorChange(customColor)}
            onKeyDown={(e) => e.key === "Enter" && handleColorChange(customColor)}
            placeholder="#FAFAFA"
            className="flex-1 border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={() => handleColorChange(customColor)}
            className="bg-accent hover:bg-accent-dark text-white"
          >
            Apply
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Background Image</h3>
        <div className="grid grid-cols-3 gap-3">
          {BACKGROUND_IMAGES.map((img) => (
            <button
              key={img.name}
              onClick={() => handleImageChange(img.url)}
              className={`relative aspect-video rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer ${effectiveBgImage === img.url ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-accent/50"
                }`}
              aria-label={`Select background image ${img.name}`}
            >
              {img.url ? (
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">None</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
        <div
          className="w-full aspect-video rounded-xl border border-border overflow-hidden"
          style={{
            backgroundColor: effectiveBgColor,
            backgroundImage: effectiveBgImage ? `url(${effectiveBgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {effectiveBgImage && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-foreground/50 text-sm">Background Preview</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


