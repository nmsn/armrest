import { CACHE_CONFIG, STORAGE_KEYS, DEFAULT_VALUES } from "./constants"
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

const DAILY_STORAGE_KEY = STORAGE_KEYS.DAILY_DATA

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

  const configKey = dataType === 'weather' ? 'WEATHER' : 'DAILY_QUOTE'
  const expiry = CACHE_CONFIG[configKey].EXPIRY
  return Date.now() - lastUpdated < expiry
}

export async function getWeather(city: string = DEFAULT_VALUES.FALLBACK_CITY): Promise<WeatherData | null> {
  const requestUrl = `${API_60S.base}${API_60S.api.weather}?city=${encodeURIComponent(city)}`

  try {
    const storedData = await getStoredData()

    if (storedData?.weather && storedData && isCacheValid(storedData, 'weather')) {
      return storedData.weather
    }

    const response = await fetch(requestUrl)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const result = await response.json()

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
            : DEFAULT_VALUES.WEATHER_UNKNOWN,
        weather: todayForecast?.day_condition || currentHourly?.condition || DEFAULT_VALUES.WEATHER_UNKNOWN,
        wind: todayForecast
          ? `${todayForecast.day_wind_direction} ${todayForecast.day_wind_power}级`
          : currentHourly
            ? `${currentHourly.wind_direction} ${currentHourly.wind_power}级`
            : DEFAULT_VALUES.WEATHER_UNKNOWN,
        humidity: todayForecast?.air_quality || DEFAULT_VALUES.WEATHER_UNKNOWN,
        updateTime: new Date().toLocaleString("zh-CN"),
      }

      const currentData = await getStoredData()
      await setStoredData({
        ...currentData,
        weather,
        weatherLastUpdated: Date.now(),
      })

      return weather
    }

    return null
  } catch (error) {
    const storedData = await getStoredData()
    return storedData?.weather || null
  }
}

export async function getDailyQuote(): Promise<DailyQuoteData | null> {
  const requestUrl = `${API_60S.base}${API_60S.api.hitokoto}`

  try {
    const storedData = await getStoredData()

    if (storedData?.dailyQuote && storedData && isCacheValid(storedData, 'dailyQuote')) {
      return storedData.dailyQuote
    }

    const response = await fetch(requestUrl)

    if (!response.ok) {
      throw new Error(`Daily quote API error: ${response.status}`)
    }

    const result = await response.json()

    if (result.code === 200 && result.data) {
      const dailyQuote: DailyQuoteData = {
        content: result.data.hitokoto || DEFAULT_VALUES.HITOKOTO_DEFAULT,
        author: DEFAULT_VALUES.HITOKOTO_AUTHOR,
      }

      const currentData = await getStoredData()
      await setStoredData({
        ...currentData,
        dailyQuote,
        dailyQuoteLastUpdated: Date.now(),
      })

      return dailyQuote
    }

    return null
  } catch (error) {
    const storedData = await getStoredData()
    return storedData?.dailyQuote || null
  }
}
