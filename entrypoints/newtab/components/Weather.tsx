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
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">加载天气...</span>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Cloud className="w-4 h-4" />
        <span className="text-sm">天气不可用</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 text-left">
      <div className="p-3 bg-accent/10 rounded-xl">
        <Cloud className="w-6 h-6 text-accent" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{weather.city}</span>
        </div>
        <div className="text-lg font-semibold text-foreground">{weather.temperature}</div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{weather.weather}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            {weather.wind}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            {weather.humidity}
          </span>
        </div>
      </div>
    </div>
  )
}
