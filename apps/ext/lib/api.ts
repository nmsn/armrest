export interface ReverseGeocodeResponse {
  latitude: number
  longitude: number
  city?: string
  locality?: string
  countryName?: string
  principalSubdivision?: string
}

export interface GeocodeResponse {
  city?: string
  locality?: string
  countryName?: string
  principalSubdivision?: string
}

export interface WeatherResponse {
  city: string
  temperature: string
  weather: string
  weatherCode: string
  wind: string
  humidity: string
  updateTime: string
}
