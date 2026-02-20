import { GEOLOCATION_CONFIG } from "./constants"
import { API_BIGDATACLOUD, ReverseGeocodeResponse } from "./api"

interface UserLocation {
  latitude: number
  longitude: number
  accuracy: number
}

function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: GEOLOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
        timeout: GEOLOCATION_CONFIG.TIMEOUT,
        maximumAge: GEOLOCATION_CONFIG.MAXIMUM_AGE
      }
    )
  })
}

async function getCityNameByCoordinates(latitude: number, longitude: number): Promise<string> {
  try {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Invalid coordinates: latitude and longitude must be numbers')
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid coordinates: latitude and longitude cannot be NaN')
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90')
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180')
    }

    const requestUrl = new URL(`${API_BIGDATACLOUD.base}${API_BIGDATACLOUD.api.reverseGeocode}`)
    requestUrl.searchParams.append('latitude', latitude.toString())
    requestUrl.searchParams.append('longitude', longitude.toString())
    requestUrl.searchParams.append('localityLanguage', GEOLOCATION_CONFIG.LOCALITY_LANGUAGE)

    const response = await fetch(requestUrl.toString())

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status} ${response.statusText}`)
    }

    const result: ReverseGeocodeResponse = await response.json()

    let cityName = result.city || result.locality || ''

    if (!cityName && result.principalSubdivision) {
      cityName = result.principalSubdivision
    }

    if (!cityName && result.countryName) {
      cityName = result.countryName
    }

    if (!cityName) {
      throw new Error('City name not found in response')
    }

    return cityName
  } catch (error) {
    throw error
  }
}

export { getUserLocation, getCityNameByCoordinates }
export type { UserLocation }
