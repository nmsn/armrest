import ShinyText from '@/components/ShinyText.tsx'
import { useTheme } from '@/lib/theme'

export function Logo() {
  const { mode } = useTheme()
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="app-logo h-10 flex items-center justify-end px-2">
      <ShinyText
        text="✨ Armrest"
        className="font-semibold"
        speed={2}
        shineColor="#ffffff"
        color={isDark ? '#A78BFA' : '#8B5CF6'}
        disabled={false}
        pauseOnHover
      />
    </div>
  )
}
