import { GEOLOCATION_CONFIG } from "./constants"
import { ReverseGeocodeResponse } from "./api"
import { api } from "./api-client"

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

    const result = await api.geocode(latitude, longitude)

    if (result.data) {
      return result.data.city || result.data.locality || result.data.principalSubdivision || result.data.countryName || ''
    }

    throw new Error('City name not found in response')
  } catch (error) {
    throw error
  }
}

export { getUserLocation, getCityNameByCoordinates }
export type { UserLocation }
