"use client"

import * as React from "react"
import { Sun, Moon, Monitor, Image, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeMode, getThemeConfig, setThemeConfig, applyTheme, getCurrentBackground, setBackgroundColor, setBackgroundImage } from "@/lib/theme"
import { THEME_COLORS, DARK_THEME_COLORS, BACKGROUND_IMAGES } from "@/lib/constants"

interface BackgroundSettingsProps {
  backgroundColor?: string
  backgroundImage?: string
  onBackgroundChange?: (color: string, image: string) => void
}

export function BackgroundSettings({ backgroundColor: externalBgColor, backgroundImage: externalBgImage, onBackgroundChange }: BackgroundSettingsProps) {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("system")
  const [backgroundColor, setBgColor] = React.useState("#FAFAFA")
  const [backgroundImage, setBgImage] = React.useState("")
  const [customColor, setCustomColor] = React.useState("#FAFAFA")

  React.useEffect(() => {
    async function loadConfig() {
      const config = await getThemeConfig()
      setThemeMode(config.mode)
      const bg = await getCurrentBackground()
      setBgColor(bg.backgroundColor)
      setBgImage(bg.backgroundImage)
      setCustomColor(bg.backgroundColor)
    }
    loadConfig()
  }, [])

  const handleThemeChange = async (mode: ThemeMode) => {
    setThemeMode(mode)
    await setThemeConfig({ mode })
    applyTheme(mode)
    const bg = await getCurrentBackground()
    setBgColor(bg.backgroundColor)
    setBgImage(bg.backgroundImage)
    onBackgroundChange?.(bg.backgroundColor, bg.backgroundImage)
  }

  const handleColorChange = async (color: string) => {
    setBgColor(color)
    setCustomColor(color)
    await setBackgroundColor(color)
    onBackgroundChange?.(color, backgroundImage)
  }

  const handleImageChange = async (image: string) => {
    setBgImage(image)
    await setBackgroundImage(image)
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
          <div className="grid grid-cols-4 gap-3 mb-4">
            {DARK_THEME_COLORS.map((color) => (
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
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {THEME_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-full aspect-video rounded-lg border-2 transition-all duration-200 cursor-pointer ${effectiveBgColor === color ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-accent/50"
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


