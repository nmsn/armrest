import { useCallback, useEffect, useRef, useState } from "react"
import { MoonIcon } from "./moon"
import { SunIcon } from "./sun"
import { MonitorCheckIcon } from "./monitor-check"
import { flushSync } from "react-dom"
import { Button } from "./button"
import { getThemeConfig, setThemeConfig, applyTheme, type ThemeMode } from "@/lib/theme"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [mode, setMode] = useState<ThemeMode>("system")
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    getThemeConfig().then((config) => {
      setMode(config.mode)
      applyTheme(config.mode)
    })
  }, [])

  const applyMode = async (newMode: ThemeMode) => {
    applyTheme(newMode)
    await setThemeConfig({ mode: newMode })
  }

  useEffect(() => {
    if (mode !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyMode("system")

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [mode])

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current
    if (!button) return

    const { top, left, width, height } = button.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    )

    const cycleMode: ThemeMode[] = ["light", "dark", "system"]
    const nextMode = cycleMode[(cycleMode.indexOf(mode) + 1) % cycleMode.length]

    const applyNextTheme = () => {
      setMode(nextMode)
      applyMode(nextMode)
    }

    if (typeof document.startViewTransition !== "function") {
      applyNextTheme()
      return
    }

    const transition = document.startViewTransition(() => {
      flushSync(applyNextTheme)
    })

    const ready = transition?.ready
    if (ready && typeof ready.then === "function") {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
    }
  }, [mode, duration])

  const ThemeIcon = mode === "light" ? SunIcon : mode === "dark" ? MoonIcon : MonitorCheckIcon

  return (
    <Button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(className)}
      {...props}
    >
      <ThemeIcon className="h-4 w-4 text-muted-foreground hover:text-accent transition-colors" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
