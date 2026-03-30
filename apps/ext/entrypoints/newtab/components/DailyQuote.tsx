import { useState, useEffect, useCallback } from "react"
import { Quote, Loader2, RefreshCw } from "lucide-react"
import { DailyQuoteData, getDailyQuote } from "@/lib/daily"

interface DailyQuoteProps {
  className?: string
  compact?: boolean
}

export function DailyQuote({ className = "", compact = false }: DailyQuoteProps) {
  const [quote, setQuote] = useState<DailyQuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDailyQuote()
      setQuote(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取一言失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuote()
  }, [fetchQuote])

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">加载一言...</span>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Quote className="w-4 h-4" />
        <span className="text-sm">一言不可用</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`group flex items-center gap-2 ${className}`}>
        <Quote className="w-3.5 h-3.5 text-accent/60 shrink-0" />
        <p className="text-xs text-muted-foreground italic line-clamp-2 flex-1">
          "{quote.content}"
        </p>
        <button
          onClick={fetchQuote}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-accent/10 shrink-0"
          title="刷新一言"
        >
          <RefreshCw className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    )
  }

  return (
    <div className={`group relative ${className}`}>
      <div className="flex items-start gap-2">
        <Quote className="w-4 h-4 text-accent/60 mt-0.5 shrink-0" />
        <div className="max-w-xs">
          <p className="text-sm text-foreground/80 italic leading-relaxed line-clamp-3">
            "{quote.content}"
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            — {quote.author}
          </p>
        </div>
      </div>
      <button
        onClick={fetchQuote}
        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-accent/10"
        title="刷新一言"
      >
        <RefreshCw className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  )
}
