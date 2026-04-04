import { ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { ReactNode } from "react"

interface NewsItem {
  title: string
  url: string
  subtitle?: string
}

interface NewsCardProps {
  title: string
  news: NewsItem[]
  loading: boolean
  headerRight?: ReactNode
  animationKey?: string
  direction?: number
}

export function NewsCard({ title, news, loading, headerRight, animationKey, direction = 1 }: NewsCardProps) {
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <div className="app-card flex flex-col h-64 overflow-hidden">
      <div className="app-card-header">
        <span className="app-card-title">{title}</span>
        {headerRight}
      </div>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {loading ? (
          <div className="grid grid-cols-1 gap-1 h-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-2 py-1.5">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="h-2.5 w-full bg-accent/10 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-accent/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={animationKey ?? title}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="grid grid-cols-1 gap-1 h-full"
            >
              {news.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-accent/5 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground line-clamp-2 leading-snug block">
                          {item.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <span className="text-xs">{item.subtitle}</span>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-accent shrink-0 mt-0.5" />
                </a>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
