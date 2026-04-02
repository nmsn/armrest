import { NewsCard } from "./NewsCard"
import { WordCard } from "./WordCard"
import { DailyQuote } from "./DailyQuote"
import { ReadLater } from "./ReadLater"

export function InfoRow() {
  return (
    <>
      {/* News + Word — side by side */}
      <div className="news-word-row">
        <NewsCard />
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
