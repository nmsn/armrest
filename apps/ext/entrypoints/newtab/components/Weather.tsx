import { useState, useEffect, useCallback } from "react"
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Sun,
  CloudSun,
  Loader2,
} from "lucide-react"
import { WeatherData, getWeather, getCachedLocation, setCachedLocation } from "@/lib/daily"
import { getUserLocation, getCityNameByCoordinates } from "@/lib/geo"
import { DEFAULT_VALUES, WEATHER_CODE_MAP } from "@/lib/constants"

const WEATHER_ICON_MAP: Record<string, React.ElementType> = {
  '00': Sun, // 晴
  '01': CloudSun, // 多云
  '02': Cloud, // 阴
  '03': CloudRain, // 阵雨
  '04': CloudLightning, // 雷阵雨
  '05': CloudLightning, // 雷阵雨伴有冰雹
  '06': CloudSnow, // 雨夹雪
  '07': CloudRain, // 小雨
  '08': CloudRain, // 中雨
  '09': CloudRain, // 大雨
  '10': CloudRain, // 暴雨
  '11': CloudRain, // 大暴雨
  '12': CloudRain, // 特大暴雨
  '13': CloudSnow, // 阵雪
  '14': CloudSnow, // 小雪
  '15': CloudSnow, // 中雪
  '16': CloudSnow, // 大雪
  '17': CloudSnow, // 暴雪
  '18': CloudFog, // 雾
  '19': CloudRain, // 冻雨
  '20': Wind, // 沙尘暴
  '21': CloudRain, // 小到中雨
  '22': CloudRain, // 中到大雨
  '23': CloudRain, // 大到暴雨
  '24': CloudRain, // 暴雨到大暴雨
  '25': CloudRain, // 大暴雨到特大暴雨
  '26': CloudSnow, // 小到中雪
  '27': CloudSnow, // 中到大雪
  '28': CloudSnow, // 大到暴雪
  '29': Wind, // 浮尘
  '30': Wind, // 扬沙
  '31': Wind, // 强沙尘暴
  '32': CloudFog, // 浓雾
  '33': CloudFog, // 强浓雾
  '34': Wind, // 霾
  '35': Wind, // 中度霾
  '36': Wind, // 重度霾
  '37': Wind, // 严重霾
  '38': CloudFog, // 大雾
  '39': CloudFog, // 特强浓雾
  '99': Cloud, // 无数据
}

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
        // Try to get cached location first
        let cityName: string
        const cachedLocation = await getCachedLocation()

        if (cachedLocation) {
          cityName = cachedLocation.city
        } else {
          // No cache, fetch from geolocation API
          const location = await getUserLocation()
          cityName = await getCityNameByCoordinates(location.latitude, location.longitude)
          // Cache the location for future use
          await setCachedLocation({
            lat: location.latitude,
            lon: location.longitude,
            city: cityName,
          })
        }

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

  const WeatherIcon = WEATHER_ICON_MAP[weather.weatherCode] || Cloud
  const weatherInfo = WEATHER_CODE_MAP[weather.weatherCode]

  return (
    <div className="flex items-center justify-center gap-4 h-full">
      <WeatherIcon className="w-12 h-12 text-primary" />
      <div className="flex flex-col justify-center gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{weather.temperature}</span>
          <span className="text-sm text-muted-foreground">{weatherInfo?.name || weather.weather}</span>
        </div>
        <div className="text-xs text-muted-foreground/50">{weather.city}</div>
      </div>
    </div>
  )
}
