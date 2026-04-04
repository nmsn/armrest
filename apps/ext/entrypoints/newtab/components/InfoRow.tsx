import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeftIcon } from "@/components/ui/arrow-left"
import { ArrowRightIcon } from "@/components/ui/arrow-right"
import { RefreshCCWIcon } from "@/components/ui/refresh-ccw"
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
  { key: "ai", title: "AI News" },
  { key: "it", title: "IT News" },
  { key: "hacker", title: "Hacker News" },
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

  const title = CATEGORIES[activeIndex].title
  const news = getNews()
  const loading = getLoading()

  return { title, news, loading, direction, goNext, goPrev, refresh }
}

export function InfoRow() {
  const { title, news, loading, direction, goNext, goPrev, refresh } = useNewsCategory()

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <>
      {/* News + Word — side by side */}
      <div className="news-word-row">
        <div className="app-card h-full flex flex-col">
          <div className="app-card-header">
            <span className="app-card-title">{title}</span>
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
          </div>
          <div className="grid grid-cols-1 gap-1 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={title}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="grid grid-cols-1 gap-1 flex-1 overflow-hidden"
              >
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
                  news.map((item, i) => (
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
                    </a>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
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
