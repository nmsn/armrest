import { NewsCard } from "./NewsCard"
import { WordCard } from "./WordCard"
import { DailyQuote } from "./DailyQuote"

export function InfoRow() {
  return (
    <>
      {/* News + Word — side by side */}
      <div className="news-word-row">
        <NewsCard />
        <WordCard />
      </div>

      {/* Quote — full width */}
      <div className="app-card flex items-center justify-center px-6" style={{ height: "80px" }}>
        <DailyQuote compact />
      </div>
    </>
  )
}
