import ShinyText from '@/components/ShinyText.tsx'

export function Logo() {
  return (
    <div className="app-logo h-10 flex items-center justify-end px-2">
      <ShinyText
        text="✨ Armrest"
        className="text-cyan-300"
        speed={2}
        shineColor="#ffffff"
        disabled={false}
        pauseOnHover
      />
    </div>
  )
}
