import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"

export interface HackerNewsItem {
  id: number
  title: string
  url: string
  score: number
  by: string
  time: string
}

interface HackerNewsResponse {
  data?: { stories?: HackerNewsItem[] }
  error: string | null
}

export function useHackerNews() {
  const [news, setNews] = useState<HackerNewsItem[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchNews() {
    setLoading(true)
    try {
      const result = await api.hackerNews60s() as HackerNewsResponse
      if (result.data?.stories) {
        setNews(result.data.stories)
      }
    } catch (error) {
      console.error("Failed to fetch Hacker News:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return { news, loading, refresh: fetchNews }
}
