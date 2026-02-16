const DEBUG_MODE = true

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
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  })
}

/**
 * 通过地理坐标获取城市名称
 * @param latitude - 纬度
 * @param longitude - 经度
 * @returns Promise<string> - 城市名称
 * @throws {Error} - 网络错误、API错误或参数无效时抛出异常
 */
async function getCityNameByCoordinates(latitude: number, longitude: number): Promise<string> {
  if (DEBUG_MODE) {
    console.group('[Geo] 🌍 Reverse Geocoding Request')
    console.log('📍 Latitude:', latitude)
    console.log('📍 Longitude:', longitude)
  }

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
    requestUrl.searchParams.append('localityLanguage', 'zh')

    if (DEBUG_MODE) {
      console.log('📍 Request URL:', requestUrl.toString())
    }

    const startTime = Date.now()
    const response = await fetch(requestUrl.toString())
    const responseTime = Date.now() - startTime

    if (DEBUG_MODE) {
      console.log('✅ Status:', response.status, response.statusText)
      console.log('⏱️ Response time:', responseTime, 'ms')
    }

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status} ${response.statusText}`)
    }

    const result: ReverseGeocodeResponse = await response.json()

    if (DEBUG_MODE) {
      console.log('📄 Raw response:', result)
    }

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

    if (DEBUG_MODE) {
      console.log('🏙️ Extracted city name:', cityName)
      console.groupEnd()
    }

    return cityName
  } catch (error) {
    if (DEBUG_MODE) {
      console.group('[Geo] 🌍 Reverse Geocoding Error')
      console.error('❌ Error type:', error instanceof Error ? error.constructor.name : 'Unknown')
      console.error('❌ Error message:', error instanceof Error ? error.message : error)
      console.error('📍 Coordinates:', { latitude, longitude })
      console.groupEnd()
    }

    throw error
  }
}

export { getUserLocation, getCityNameByCoordinates }
export type { UserLocation }
