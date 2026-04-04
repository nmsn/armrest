import { NewsCard } from "./NewsCard"
import { WordCard } from "./WordCard"
import { DailyQuote } from "./DailyQuote"
import { ReadLater } from "./ReadLater"
import { useAiNews } from "../hooks/useAiNews"

export function InfoRow() {
  const { news } = useAiNews()

  return (
    <>
      {/* News + Word — side by side */}
      <div className="news-word-row">
        <NewsCard news={news} />
        <WordCard />
      </div>

      {/* ReadLater + Quote — 1fr 2fr */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 2fr" }}>
        <div className="app-card flex items-center justify-center px-6" style={{ height: "80px" }}>
          <DailyQuote compact />
        </div>
        <ReadLater />
      </div>
    </>
  )
}
