import { API_CONFIG } from "./constants"

export interface ReverseGeocodeResponse {
  latitude: number
  longitude: number
  city?: string
  locality?: string
  countryName?: string
  principalSubdivision?: string
}

export const API_60S = {
  base: API_CONFIG.API_60S.BASE,
  api: {
    weather: API_CONFIG.API_60S.ENDPOINTS.WEATHER,
    history: API_CONFIG.API_60S.ENDPOINTS.HISTORY,
    dailyBackground: API_CONFIG.API_60S.ENDPOINTS.DAILY_BACKGROUND,
    hitokoto: API_CONFIG.API_60S.ENDPOINTS.HITOKOTO,
    readWorld: API_CONFIG.API_60S.ENDPOINTS.READ_WORLD,
    aiNews: API_CONFIG.API_60S.ENDPOINTS.AI_NEWS,
  },
}

export const API_BIGDATACLOUD = {
  base: API_CONFIG.API_BIGDATACLOUD.BASE,
  api: {
    reverseGeocode: API_CONFIG.API_BIGDATACLOUD.ENDPOINTS.REVERSE_GEOCODE,
  },
}
