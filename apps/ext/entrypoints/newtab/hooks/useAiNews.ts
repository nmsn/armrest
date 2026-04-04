import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"

export interface AiNewsItem {
  title: string
  source: string
  url: string
}

interface AiNewsResponse {
  data?: { news?: AiNewsItem[]; date?: string }
  error: string | null
}

export function useAiNews() {
  const [news, setNews] = useState<AiNewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const result = await api.aiNews60s() as AiNewsResponse
        if (result.data?.news) {
          setNews(result.data.news)
        }
      } catch (error) {
        console.error("Failed to fetch AI news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  return { news, loading }
}
