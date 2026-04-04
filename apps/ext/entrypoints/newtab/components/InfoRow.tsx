import { useState, useCallback } from "react"
import { ArrowLeftIcon } from "@/components/ui/arrow-left"
import { ArrowRightIcon } from "@/components/ui/arrow-right"
import { RefreshCCWIcon } from "@/components/ui/refresh-ccw"
import { NewsCard } from "./NewsCard"
import { WordCard } from "./WordCard"
import { DailyQuote } from "./DailyQuote"
import { ReadLater } from "./ReadLater"
import { useAiNews, useItNews, useHackerNews } from "../hooks"

type Category = "ai" | "it" | "hacker"

interface CategoryConfig {
  key: Category
  title: string
}

const CATEGORIES: CategoryConfig[] = [
  { key: "it", title: "IT News" },
  { key: "hacker", title: "Hacker News" },
  { key: "ai", title: "AI News" },
]

function useNewsCategory() {
  const aiNews = useAiNews()
  const itNews = useItNews()
  const hackerNews = useHackerNews()

  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const activeCategory = CATEGORIES[activeIndex].key

  const getNews = useCallback(() => {
    switch (activeCategory) {
      case "ai": return aiNews.news.map((n) => ({ title: n.title, url: n.url, subtitle: n.source }))
      case "it": return itNews.news.map((n) => ({ title: n.title, url: n.link, subtitle: n.description }))
      case "hacker": return hackerNews.news.map((n) => ({ title: n.title, url: n.url, subtitle: `${n.score} pts · ${n.by}` }))
    }
  }, [activeCategory, aiNews.news, itNews.news, hackerNews.news])

  const getLoading = useCallback(() => {
    switch (activeCategory) {
      case "ai": return aiNews.loading
      case "it": return itNews.loading
      case "hacker": return hackerNews.loading
    }
  }, [activeCategory, aiNews.loading, itNews.loading, hackerNews.loading])

  const getRefresh = useCallback(() => {
    switch (activeCategory) {
      case "ai": return aiNews.refresh
      case "it": return itNews.refresh
      case "hacker": return hackerNews.refresh
    }
  }, [activeCategory, aiNews.refresh, itNews.refresh, hackerNews.refresh])

  const goNext = useCallback(() => {
    setDirection(1)
    setActiveIndex((i) => (i + 1) % CATEGORIES.length)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setActiveIndex((i) => (i - 1 + CATEGORIES.length) % CATEGORIES.length)
  }, [])

  const refresh = useCallback(() => {
    getRefresh()()
  }, [getRefresh])

  return {
    title: CATEGORIES[activeIndex].title,
    animationKey: activeCategory,
    news: getNews(),
    loading: getLoading(),
    direction,
    goNext,
    goPrev,
    refresh,
  }
}

export function InfoRow() {
  const { title, animationKey, news, loading, direction, goNext, goPrev, refresh } = useNewsCategory()

  const headerRight = (
    <div className="flex items-center gap-1">
      <button
        onClick={goPrev}
        className="p-1 rounded hover:bg-accent/10 transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon size={14} />
      </button>
      <button
        onClick={goNext}
        className="p-1 rounded hover:bg-accent/10 transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowRightIcon size={14} />
      </button>
      <button
        onClick={refresh}
        disabled={loading}
        className="p-1 rounded hover:bg-accent/10 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <RefreshCCWIcon size={14} />
      </button>
    </div>
  )

  return (
    <>
      {/* News + Word — side by side */}
      <div className="news-word-row">
        <NewsCard
          title={title}
          news={news}
          loading={loading}
          headerRight={headerRight}
          animationKey={animationKey}
          direction={direction}
        />
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
