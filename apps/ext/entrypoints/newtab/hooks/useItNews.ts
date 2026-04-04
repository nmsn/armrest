import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"

export interface ItNewsItem {
  title: string
  description?: string
  link: string
}

interface ItNewsResponse {
  data?: { news?: ItNewsItem[] }
  error: string | null
}

export function useItNews() {
  const [news, setNews] = useState<ItNewsItem[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchNews() {
    setLoading(true)
    try {
      const result = await api.itNews60s() as ItNewsResponse
      if (result.data?.news) {
        setNews(result.data.news)
      }
    } catch (error) {
      console.error("Failed to fetch IT news:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return { news, loading, refresh: fetchNews }
}
