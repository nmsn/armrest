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
