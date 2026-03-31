import { CACHE_CONFIG, STORAGE_KEYS, DEFAULT_VALUES } from "./constants"
import { api } from "./api-client"

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
  weatherCity?: string
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

function isCacheValid(data: DailyData, dataType: DataType, city?: string): boolean {
  const lastUpdatedKey = `${dataType}LastUpdated` as keyof DailyData
  const lastUpdated = data[lastUpdatedKey] as number | undefined

  if (!lastUpdated) return false

  if (dataType === 'weather' && city) {
    const cachedCity = data.weatherCity
    if (cachedCity !== city) return false
  }

  const configKey = dataType === 'weather' ? 'WEATHER' : 'DAILY_QUOTE'
  const expiry = CACHE_CONFIG[configKey].EXPIRY
  return Date.now() - lastUpdated < expiry
}

export async function getWeather(city: string = DEFAULT_VALUES.FALLBACK_CITY): Promise<WeatherData | null> {
  try {
    const storedData = await getStoredData()

    if (storedData?.weather && storedData && isCacheValid(storedData, 'weather', city)) {
      return storedData.weather
    }

    const result = await api.weather60s(city)

    if (result.data) {
      const weather: WeatherData = {
        city: result.data.city,
        temperature: result.data.temperature,
        weather: result.data.weather,
        wind: result.data.wind,
        humidity: result.data.humidity,
        updateTime: result.data.updateTime,
      }

      const currentData = await getStoredData()
      await setStoredData({
        ...currentData,
        weather,
        weatherLastUpdated: Date.now(),
        weatherCity: city,
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
  try {
    const storedData = await getStoredData()

    if (storedData?.dailyQuote && storedData && isCacheValid(storedData, 'dailyQuote')) {
      return storedData.dailyQuote
    }

    const result = await api.quote60s()

    if (result.data) {
      const dailyQuote: DailyQuoteData = {
        content: result.data.content,
        author: result.data.author,
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
