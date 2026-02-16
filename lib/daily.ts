const DEBUG_MODE = true

import { API_60S } from "./api"

export interface WeatherData {
  city: string
  temperature: string
  weather: string
  wind: string
  humidity: string
  updateTime: string
}

export interface DailyQuoteData {
  content: string
  author: string
}

export interface DailyData {
  weather?: WeatherData
  dailyQuote?: DailyQuoteData
  weatherLastUpdated?: number
  dailyQuoteLastUpdated?: number
}

const DAILY_STORAGE_KEY = "armrest-daily-data"

const TIME_UNITS = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
}

const CACHE_CONFIG = {
  weather: {
    expiry: 1 * TIME_UNITS.HOUR,
  },
  dailyQuote: {
    expiry: 1 * TIME_UNITS.DAY,
  },
}

async function getStoredData(): Promise<DailyData | null> {
  try {
    const result = await chrome.storage.local.get(DAILY_STORAGE_KEY)
    const data = result[DAILY_STORAGE_KEY] as DailyData | undefined
    return data || null
  } catch (error) {
    console.error("[Daily] Failed to get stored data:", error)
    return null
  }
}

async function setStoredData(data: DailyData): Promise<void> {
  try {
    await chrome.storage.local.set({
      [DAILY_STORAGE_KEY]: data,
    })
  } catch (error) {
    console.error("[Daily] Failed to store data:", error)
  }
}

type DataType = 'weather' | 'dailyQuote'

function isCacheValid(data: DailyData, dataType: DataType): boolean {
  const lastUpdatedKey = `${dataType}LastUpdated` as keyof DailyData
  const lastUpdated = data[lastUpdatedKey] as number | undefined

  if (!lastUpdated) return false

  const expiry = CACHE_CONFIG[dataType].expiry
  const isValid = Date.now() - lastUpdated < expiry

  if (DEBUG_MODE) {
    console.log(`[Daily] 📦 Cache check for ${dataType}:`, {
      lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : 'never',
      expiry: `${expiry / TIME_UNITS.HOUR} hours`,
      age: lastUpdated ? `${(Date.now() - lastUpdated) / TIME_UNITS.MINUTE} minutes` : 'N/A',
      isValid,
    })
  }

  return isValid
}

export async function getWeather(city: string = "北京"): Promise<WeatherData | null> {
  const requestUrl = `${API_60S.base}${API_60S.api.weather}?city=${encodeURIComponent(city)}`
  const startTime = Date.now()

  if (DEBUG_MODE) {
    console.group(`[Daily] 🌤️ Weather API Request`)
    console.log("📍 Request URL:", requestUrl)
    console.log("🏙️ City:", city)
  }

  try {
    const storedData = await getStoredData()

    if (storedData?.weather && storedData && isCacheValid(storedData, 'weather')) {
      if (DEBUG_MODE) {
        console.log("💾 Using cached weather data")
        console.log("📦 Cached data:", storedData.weather)
        console.groupEnd()
      }
      return storedData.weather
    }

    const response = await fetch(requestUrl)
    const responseTime = Date.now() - startTime

    if (DEBUG_MODE) {
      console.log("✅ Status:", response.status, response.statusText)
      console.log("⏱️ Response time:", responseTime, "ms")
    }

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const result = await response.json()

    if (DEBUG_MODE) {
      console.log("📄 Raw response:", result)
    }

    if (result.code === 200 && result.data) {
      const location = result.data.location
      const todayForecast = result.data.daily_forecast?.[0]
      const currentHourly = result.data.hourly_forecast?.[0]

      const weather: WeatherData = {
        city: location?.city || location?.name || city,
        temperature: todayForecast
          ? `${todayForecast.min_temperature}°C ~ ${todayForecast.max_temperature}°C`
          : currentHourly
            ? `${currentHourly.temperature}°C`
            : "未知",
        weather: todayForecast?.day_condition || currentHourly?.condition || "未知",
        wind: todayForecast
          ? `${todayForecast.day_wind_direction} ${todayForecast.day_wind_power}级`
          : currentHourly
            ? `${currentHourly.wind_direction} ${currentHourly.wind_power}级`
            : "未知",
        humidity: todayForecast?.air_quality || "未知",
        updateTime: new Date().toLocaleString("zh-CN"),
      }

      if (DEBUG_MODE) {
        console.log("📋 Parsed weather data:")
        console.log("   🏙️ City:", weather.city)
        console.log("   🌡️ Temperature:", weather.temperature)
        console.log("   ☁️ Weather:", weather.weather)
        console.log("   💨 Wind:", weather.wind)
        console.log("   💧 Humidity:", weather.humidity)
        console.log("   🕐 Update time:", weather.updateTime)
      }

      const currentData = await getStoredData()
      await setStoredData({
        ...currentData,
        weather,
        weatherLastUpdated: Date.now(),
      })

      if (DEBUG_MODE) {
        console.log("💾 Weather data cached successfully")
        console.groupEnd()
      }

      return weather
    }

    if (DEBUG_MODE) {
      console.error("❌ API returned error code:", result.code)
      console.groupEnd()
    }

    return null
  } catch (error) {
    const responseTime = Date.now() - startTime
    if (DEBUG_MODE) {
      console.group(`[Daily] 🌤️ Weather API Error`)
      console.error("❌ Error type:", error instanceof Error ? error.constructor.name : "Unknown")
      console.error("❌ Error message:", error instanceof Error ? error.message : error)
      console.error("📍 Request URL:", requestUrl)
      console.error("⏱️ Response time:", responseTime, "ms")
      console.groupEnd()
    }

    const storedData = await getStoredData()
    return storedData?.weather || null
  }
}

export async function getDailyQuote(): Promise<DailyQuoteData | null> {
  const requestUrl = `${API_60S.base}${API_60S.api.hitokoto}`
  const startTime = Date.now()

  if (DEBUG_MODE) {
    console.group(`[Daily] 📝 Daily Quote API Request`)
    console.log("📍 Request URL:", requestUrl)
  }

  try {
    const storedData = await getStoredData()

    if (storedData?.dailyQuote && storedData && isCacheValid(storedData, 'dailyQuote')) {
      if (DEBUG_MODE) {
        console.log("💾 Using cached daily quote data")
        console.log("📦 Cached data:", storedData.dailyQuote)
        console.groupEnd()
      }
      return storedData.dailyQuote
    }

    const response = await fetch(requestUrl)
    const responseTime = Date.now() - startTime

    if (DEBUG_MODE) {
      console.log("✅ Status:", response.status, response.statusText)
      console.log("⏱️ Response time:", responseTime, "ms")
    }

    if (!response.ok) {
      throw new Error(`Daily quote API error: ${response.status}`)
    }

    const result = await response.json()

    if (DEBUG_MODE) {
      console.log("📄 Raw response:", result)
    }

    if (result.code === 200 && result.data) {
      const dailyQuote: DailyQuoteData = {
        content: result.data.hitokoto || "暂无",
        author: "一言",
      }

      if (DEBUG_MODE) {
        console.log("📋 Parsed daily quote data:")
        console.log("   📝 Content:", dailyQuote.content)
        console.log("   ✍️ Author:", dailyQuote.author)
      }

      const currentData = await getStoredData()
      await setStoredData({
        ...currentData,
        dailyQuote,
        dailyQuoteLastUpdated: Date.now(),
      })

      if (DEBUG_MODE) {
        console.log("💾 Daily quote data cached successfully")
        console.groupEnd()
      }

      return dailyQuote
    }

    if (DEBUG_MODE) {
      console.error("❌ API returned error code:", result.code)
      console.groupEnd()
    }

    return null
  } catch (error) {
    const responseTime = Date.now() - startTime
    if (DEBUG_MODE) {
      console.group(`[Daily] 📝 Daily Quote API Error`)
      console.error("❌ Error type:", error instanceof Error ? error.constructor.name : "Unknown")
      console.error("❌ Error message:", error instanceof Error ? error.message : error)
      console.error("📍 Request URL:", requestUrl)
      console.error("⏱️ Response time:", responseTime, "ms")
      console.groupEnd()
    }

    const storedData = await getStoredData()
    return storedData?.dailyQuote || null
  }
}

export async function getAllDailyData(city: string = "北京"): Promise<DailyData> {
  if (DEBUG_MODE) {
    console.group("[Daily] 🚀 Fetching all daily data")
    console.log("⏰ Request time:", new Date().toISOString())
    console.log("🏙️ City:", city)
  }

  const [weather, dailyQuote] = await Promise.all([
    getWeather(city).catch(() => null),
    getDailyQuote().catch(() => null),
  ])

  const storedData = await getStoredData()
  const result = {
    weather: weather || undefined,
    dailyQuote: dailyQuote || undefined,
    weatherLastUpdated: storedData?.weatherLastUpdated,
    dailyQuoteLastUpdated: storedData?.dailyQuoteLastUpdated,
  }

  if (DEBUG_MODE) {
    console.log("📊 Final result:")
    console.log("   🌤️ Weather:", result.weather ? "✓ Loaded" : "✗ Not available")
    console.log("   📝 Daily quote:", result.dailyQuote ? "✓ Loaded" : "✗ Not available")
    console.groupEnd()
  }

  return result
}

export async function refreshDailyData(city: string = "北京"): Promise<DailyData> {
  if (DEBUG_MODE) {
    console.log("[Daily] 🔄 Force refreshing all daily data...")
  }

  await setStoredData({})
  return getAllDailyData(city)
}

export async function clearDailyCache(): Promise<void> {
  if (DEBUG_MODE) {
    console.log("[Daily] 🗑️ Clearing daily cache...")
  }

  try {
    await chrome.storage.local.remove(DAILY_STORAGE_KEY)
    if (DEBUG_MODE) {
      console.log("[Daily] ✅ Cache cleared successfully")
    }
  } catch (error) {
    console.error("[Daily] ❌ Failed to clear cache:", error)
  }
}

export interface DailyDataStatus {
  isCached: boolean
  weatherCached: boolean
  dailyQuoteCached: boolean
  weatherLastUpdated: number | null
  dailyQuoteLastUpdated: number | null
}

export async function getDailyDataStatus(): Promise<DailyDataStatus> {
  const data = await getStoredData()
  const status = {
    isCached: !!data && (!!data.weather || !!data.dailyQuote),
    weatherCached: !!data?.weather,
    dailyQuoteCached: !!data?.dailyQuote,
    weatherLastUpdated: data?.weatherLastUpdated || null,
    dailyQuoteLastUpdated: data?.dailyQuoteLastUpdated || null,
  }

  if (DEBUG_MODE) {
    console.group("[Daily] 📊 Cache Status")
    console.log("💾 Has cached data:", status.isCached)
    console.log("   🌤️ Weather cached:", status.weatherCached)
    console.log("   📝 Daily quote cached:", status.dailyQuoteCached)
    console.log("   🌤️ Weather last updated:", status.weatherLastUpdated ? new Date(status.weatherLastUpdated).toISOString() : "Never")
    console.log("   📝 Daily quote last updated:", status.dailyQuoteLastUpdated ? new Date(status.dailyQuoteLastUpdated).toISOString() : "Never")
    console.groupEnd()
  }

  return status
}
