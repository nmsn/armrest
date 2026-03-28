import { STORAGE_KEYS, THEME_CONFIG, THEME_COLORS, DARK_THEME_COLORS } from "./constants"

export type ThemeMode = "light" | "dark" | "system"

export interface ThemeColorConfig {
  backgroundColor: string
  backgroundImage: string
}

export interface ThemeConfig {
  mode: ThemeMode
  light: ThemeColorConfig
  dark: ThemeColorConfig
}

const THEME_STORAGE_KEY = STORAGE_KEYS.THEME

export const defaultThemeConfig: ThemeConfig = {
  mode: THEME_CONFIG.DEFAULT_MODE,
  light: {
    backgroundColor: THEME_COLORS[0],
    backgroundImage: THEME_CONFIG.DEFAULT_BACKGROUND_IMAGE,
  },
  dark: {
    backgroundColor: DARK_THEME_COLORS[0],
    backgroundImage: THEME_CONFIG.DEFAULT_BACKGROUND_IMAGE,
  },
}

function getEffectiveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return mode
}

export async function getThemeConfig(): Promise<ThemeConfig> {
  try {
    const result = await chrome.storage.sync.get(THEME_STORAGE_KEY)
    const stored = result[THEME_STORAGE_KEY] as Partial<ThemeConfig> | undefined
    if (stored) {
      return {
        ...defaultThemeConfig,
        mode: stored.mode ?? defaultThemeConfig.mode,
        light: {
          ...defaultThemeConfig.light,
          ...stored.light,
        },
        dark: {
          ...defaultThemeConfig.dark,
          ...stored.dark,
        },
      }
    }
    return defaultThemeConfig
  } catch (error) {
    console.error("Failed to get theme config:", error)
    return defaultThemeConfig
  }
}

export async function setThemeConfig(config: Partial<ThemeConfig>): Promise<void> {
  try {
    const current = await getThemeConfig()
    const newConfig: ThemeConfig = {
      mode: config.mode ?? current.mode,
      light: {
        ...current.light,
        ...(config.light || {}),
      },
      dark: {
        ...current.dark,
        ...(config.dark || {}),
      },
    }
    await chrome.storage.sync.set({
      [THEME_STORAGE_KEY]: newConfig,
    })
  } catch (error) {
    console.error("Failed to set theme config:", error)
  }
}

export async function getCurrentBackground(): Promise<{ backgroundColor: string; backgroundImage: string }> {
  const config = await getThemeConfig()
  const effectiveTheme = getEffectiveTheme(config.mode)
  const themeConfig = config[effectiveTheme]
  return {
    backgroundColor: themeConfig.backgroundColor,
    backgroundImage: themeConfig.backgroundImage,
  }
}

export async function setBackgroundColor(color: string): Promise<void> {
  const config = await getThemeConfig()
  const effectiveTheme = getEffectiveTheme(config.mode)

  if (effectiveTheme === "dark") {
    await setThemeConfig({ dark: { ...config.dark, backgroundColor: color } })
  } else {
    await setThemeConfig({ light: { ...config.light, backgroundColor: color } })
  }
}

export async function setBackgroundImage(image: string): Promise<void> {
  const config = await getThemeConfig()
  const effectiveTheme = getEffectiveTheme(config.mode)

  if (effectiveTheme === "dark") {
    await setThemeConfig({ dark: { ...config.dark, backgroundImage: image } })
  } else {
    await setThemeConfig({ light: { ...config.light, backgroundImage: image } })
  }
}

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement
  if (mode === "dark") {
    root.classList.add("dark")
  } else if (mode === "light") {
    root.classList.remove("dark")
  } else {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }
}

export function subscribeToThemeChanges(
  callback: (config: ThemeConfig) => void
): () => void {
  const handleStorageChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    area: string
  ) => {
    if (area === "sync" && changes[THEME_STORAGE_KEY]) {
      const newConfig = changes[THEME_STORAGE_KEY].newValue as ThemeConfig
      if (newConfig) {
        callback(newConfig)
      }
    }
  }

  chrome.storage.onChanged.addListener(handleStorageChange)

  return () => {
    chrome.storage.onChanged.removeListener(handleStorageChange)
  }
}
