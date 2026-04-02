import { useState, useEffect, useCallback } from "react"
import { Cloud, Loader2 } from "lucide-react"
import { WeatherData, getWeather } from "@/lib/daily"
import { getUserLocation, getCityNameByCoordinates } from "@/lib/geo"
import { DEFAULT_VALUES } from "@/lib/constants"

interface WeatherProps {
  city?: string
}

export function Weather({ city }: WeatherProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeather = useCallback(async (cityName: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWeather(cityName)
      setWeather(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取天气失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initWeather = async () => {
      if (city) {
        await fetchWeather(city)
        return
      }

      try {
        const location = await getUserLocation()
        const cityName = await getCityNameByCoordinates(location.latitude, location.longitude)
        await fetchWeather(cityName)
      } catch {
        await fetchWeather(DEFAULT_VALUES.FALLBACK_CITY)
      }
    }

    initWeather()
  }, [city, fetchWeather])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>...</span>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <Cloud className="w-3 h-3" />
        <span>--</span>
      </div>
    )
  }

  return (
    <div className="flex items-stretch gap-4">
      <div className="flex">
        <Cloud className="w-12 h-12 text-muted-foreground/60" />
      </div>
      <div className="flex flex-col justify-center gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{weather.temperature}</span>
          <span className="text-sm text-muted-foreground">{weather.weather}</span>
        </div>
        <div className="text-xs text-muted-foreground/50">{weather.city}</div>
      </div>
    </div>
  )
}
