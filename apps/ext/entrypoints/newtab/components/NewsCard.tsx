import { ExternalLink } from "lucide-react"

interface NewsItem {
  title: string
  url: string
  time: string
}

const MOCK_NEWS: NewsItem[] = [
  { title: "OpenAI releases GPT-5 with new multimodal interactions", url: "#", time: "10 min ago" },
  { title: "Apple WWDC 2026 announced: iOS 20 coming next month", url: "#", time: "32 min ago" },
  { title: "GitHub Copilot X adds code review for all languages", url: "#", time: "1 hour ago" },
  { title: "Cloudflare Workers now supports Python runtime", url: "#", time: "2 hours ago" },
  { title: "TypeScript 6.0 released: 40% performance improvement", url: "#", time: "3 hours ago" },
  { title: "AI coding tool Cursor raises $100M", url: "#", time: "5 hours ago" },
]

export function NewsCard() {
  return (
    <div className="app-card h-full flex flex-col">
      <div className="app-card-header">
        <span className="app-card-title">Today's News</span>
        <button className="app-card-action">More</button>
      </div>
      <div className="grid grid-cols-1 gap-1 flex-1 overflow-hidden">
        {MOCK_NEWS.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-accent/5 transition-colors group"
          >
            <span className="text-xs text-muted-foreground group-hover:text-foreground line-clamp-2 leading-snug">
              {item.title}
            </span>
            <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-accent shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  )
}
