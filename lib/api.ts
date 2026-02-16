const API_60S = {
  base: 'https://60s.viki.moe',
  api: {
    weather: '/v2/weather/forecast',
    history: '/v2/today-in-history',
    dailyBackground: '/v2/bing',
    hitokoto: '/v2/hitokoto',
  },
}

const API_BIGDATACLOUD = {
  base: 'https://api.bigdatacloud.net',
  api: {
    reverseGeocode: '/data/reverse-geocode-client',
  },
}

interface ReverseGeocodeResponse {
  latitude: number
  longitude: number
  city?: string
  locality?: string
  countryName?: string
  principalSubdivision?: string
}

export { API_60S, API_BIGDATACLOUD }
export type { ReverseGeocodeResponse }