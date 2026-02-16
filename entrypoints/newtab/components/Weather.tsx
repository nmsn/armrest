import { useState, useEffect, useCallback } from "react"
import { Cloud, Wind, Droplets, MapPin, Loader2 } from "lucide-react"
import { WeatherData, getWeather } from "@/lib/daily"

interface WeatherProps {
  city?: string
}

export function Weather({ city = "北京" }: WeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWeather(city)
      setWeather(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取天气失败")
    } finally {
      setLoading(false)
    }
  }, [city])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>加载天气...</span>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <Cloud className="w-3 h-3" />
        <span>天气不可用</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
      <Cloud className="w-3 h-3" />
      <span>{weather.city}</span>
      <span>·</span>
      <span>{weather.temperature}</span>
      <span>·</span>
      <span>{weather.weather}</span>
      <span className="flex items-center gap-0.5">
        <Wind className="w-2.5 h-2.5" />
        {weather.wind}
      </span>
      <span className="flex items-center gap-0.5">
        <Droplets className="w-2.5 h-2.5" />
        {weather.humidity}
      </span>
    </div>
  )
}
