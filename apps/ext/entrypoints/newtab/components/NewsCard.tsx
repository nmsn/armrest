import { ExternalLink } from "lucide-react"
import type { AiNewsItem } from "../hooks/useAiNews"

interface NewsCardProps {
  news: AiNewsItem[]
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="app-card h-full flex flex-col">
      <div className="app-card-header">
        <span className="app-card-title">Today's News</span>
        <button className="app-card-action">More</button>
      </div>
      <div className="grid grid-cols-1 gap-1 flex-1 overflow-hidden">
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
              {item.source && (
                <span className="text-[10px] text-muted-foreground/40">{item.source}</span>
              )}
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-accent shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  )
}
