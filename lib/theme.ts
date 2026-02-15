export type ThemeMode = "light" | "dark" | "system"

export interface ThemeConfig {
  mode: ThemeMode
  backgroundColor: string
  backgroundImage: string
}

const THEME_STORAGE_KEY = "armrest-theme-config"

export const defaultThemeConfig: ThemeConfig = {
  mode: "system",
  backgroundColor: "#FAFAFA",
  backgroundImage: "",
}

export async function getThemeConfig(): Promise<ThemeConfig> {
  try {
    const result = await chrome.storage.sync.get(THEME_STORAGE_KEY)
    const stored = result[THEME_STORAGE_KEY] as ThemeConfig | undefined
    if (stored) {
      return {
        ...defaultThemeConfig,
        ...stored,
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
    const newConfig = { ...current, ...config }
    await chrome.storage.sync.set({
      [THEME_STORAGE_KEY]: newConfig,
    })
  } catch (error) {
    console.error("Failed to set theme config:", error)
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
