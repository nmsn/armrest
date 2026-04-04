import { ExternalLink } from "lucide-react"
import { motion } from "motion/react"

interface NewsItem {
  title: string
  url: string
  subtitle?: string
}

interface NewsCardProps {
  title: string
  news: NewsItem[]
  loading: boolean
}

export function NewsCard({ title, news, loading }: NewsCardProps) {
  return (
    <div className="app-card h-full flex flex-col">
      <div className="app-card-header">
        <span className="app-card-title">{title}</span>
      </div>
      <div className="grid grid-cols-1 gap-1 flex-1 overflow-hidden">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-2 py-1.5">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="h-2.5 w-full bg-accent/10 rounded animate-pulse" />
                <div className="h-2 w-16 bg-accent/10 rounded animate-pulse" />
              </div>
            </div>
          ))
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-1 flex-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
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
                  <span className="text-xs text-muted-foreground group-hover:text-foreground line-clamp-2 leading-snug block">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="text-[10px] text-muted-foreground/40">{item.subtitle}</span>
                  )}
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-accent shrink-0 mt-0.5" />
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
