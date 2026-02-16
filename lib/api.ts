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
  },
}

export const API_BIGDATACLOUD = {
  base: API_CONFIG.API_BIGDATACLOUD.BASE,
  api: {
    reverseGeocode: API_CONFIG.API_BIGDATACLOUD.ENDPOINTS.REVERSE_GEOCODE,
  },
}

export const API_GOOGLE = {
  base: 'https://www.google.com',
  api: {
    favicon: '/s2/favicons',
    search: '/search',
  },
}

export const API_ALLORIGINS = {
  base: 'https://api.allorigins.win',
  api: {
    proxy: '/get',
  },
}

export const API_MICROLINK = {
  base: 'https://api.microlink.io',
  api: {
    metadata: '',
  },
}

const API_UNSPLASH = {
  base: 'https://images.unsplash.com',
  api: {
    photo: '/photo',
  },
}

export const API_60S_CONFIG = {
  weather: {
    name: '天气预报',
    description: '获取指定城市的天气数据',
    method: 'GET',
    baseUrl: API_60S.base,
    endpoint: API_60S.api.weather,
    params: {
      city: '城市名称（中文）',
    },
    cacheExpiry: 1 * 60 * 60 * 1000,
  },
  history: {
    name: '历史上的今天',
    description: '获取历史上的今天事件',
    method: 'GET',
    baseUrl: API_60S.base,
    endpoint: API_60S.api.history,
  },
  dailyBackground: {
    name: '每日壁纸',
    description: '获取每日 Bing 背景图',
    method: 'GET',
    baseUrl: API_60S.base,
    endpoint: API_60S.api.dailyBackground,
  },
  hitokoto: {
    name: '每日一言',
    description: '获取每日一句经典语录',
    method: 'GET',
    baseUrl: API_60S.base,
    endpoint: API_60S.api.hitokoto,
    cacheExpiry: 24 * 60 * 60 * 1000,
  },
}

export const API_BIGDATACLOUD_CONFIG = {
  reverseGeocode: {
    name: '逆地理编码',
    description: '通过经纬度获取城市名称',
    method: 'GET',
    baseUrl: API_BIGDATACLOUD.base,
    endpoint: API_BIGDATACLOUD.api.reverseGeocode,
    params: {
      latitude: '纬度（-90 到 90）',
      longitude: '经度（-180 到 180）',
      localityLanguage: '返回语言（zh 为中文）',
    },
  },
}

export const API_GOOGLE_CONFIG = {
  favicon: {
    name: '网站图标',
    description: '获取网站 Favicon 图标',
    method: 'GET',
    baseUrl: API_GOOGLE.base,
    endpoint: API_GOOGLE.api.favicon,
    params: {
      domain: '网站域名',
      sz: '图标尺寸（像素）',
    },
  },
  search: {
    name: '网页搜索',
    description: 'Google 搜索服务',
    method: 'GET',
    baseUrl: API_GOOGLE.base,
    endpoint: API_GOOGLE.api.search,
    params: {
      q: '搜索关键词',
    },
  },
}

export const API_ALLORIGINS_CONFIG = {
  proxy: {
    name: '跨域代理',
    description: '通过代理服务器获取网页内容，绕过 CORS 限制',
    method: 'GET',
    baseUrl: API_ALLORIGINS.base,
    endpoint: API_ALLORIGINS.api.proxy,
    params: {
      url: '目标网页 URL',
    },
  },
}

export const API_MICROLINK_CONFIG = {
  metadata: {
    name: '网站元数据',
    description: '获取网站标题、描述、图片、Logo 等元信息',
    method: 'GET',
    baseUrl: API_MICROLINK.base,
    endpoint: API_MICROLINK.api.metadata,
    params: {
      url: '目标网站 URL',
      palette: '是否提取主题色（true/false）',
    },
  },
}

export const API_UNSPLASH_CONFIG = {
  photo: {
    name: '背景图片',
    description: '提供预设的背景图片资源',
    method: 'GET',
    baseUrl: API_UNSPLASH.base,
    endpoint: API_UNSPLASH.api.photo,
    presets: [
      { name: 'Gradient 1', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80' },
      { name: 'Gradient 2', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80' },
      { name: 'Nature', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80' },
      { name: 'Ocean', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80' },
      { name: 'Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80' },
    ],
  },
}

// export type { ReverseGeocodeResponse }
