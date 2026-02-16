const DEBUG_MODE = true

const TIME_UNITS = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const

const API_CONFIG = {
  API_60S: {
    BASE: 'https://60s.viki.moe',
    ENDPOINTS: {
      WEATHER: '/v2/weather/forecast',
      HISTORY: '/v2/today-in-history',
      DAILY_BACKGROUND: '/v2/bing',
      HITOKOTO: '/v2/hitokoto',
    },
  },
  API_BIGDATACLOUD: {
    BASE: 'https://api.bigdatacloud.net',
    ENDPOINTS: {
      REVERSE_GEOCODE: '/data/reverse-geocode-client',
    },
  },
} as const

const STORAGE_KEYS = {
  BOOKMARKS: 'armrest_bookmarks',
  THEME: 'armrest-theme-config',
  DAILY_DATA: 'armrest-daily-data',
} as const

const CACHE_CONFIG = {
  WEATHER: {
    EXPIRY: 1 * TIME_UNITS.HOUR,
  },
  DAILY_QUOTE: {
    EXPIRY: 1 * TIME_UNITS.DAY,
  },
} as const

const BOOKMARK_CONFIG = {
  CURRENT_VERSION: 1,
  DEFAULT_FOLDERS: [
    { name: 'Work', icon: 'code' },
    { name: 'Tools', icon: 'wrench' },
    { name: 'Design', icon: 'palette' },
    { name: 'Social', icon: 'users' },
  ],
} as const

const THEME_CONFIG = {
  DEFAULT_MODE: 'system' as const,
  DEFAULT_BACKGROUND_COLOR: '#FAFAFA',
  DEFAULT_BACKGROUND_IMAGE: '',
} as const

const GEOLOCATION_CONFIG = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 5000,
  MAXIMUM_AGE: 0,
  LOCALITY_LANGUAGE: 'zh',
} as const

const UI_CONFIG = {
  ICON_SIZES: {
    SMALL: 16,
    MEDIUM: 24,
    LARGE: 32,
  },
  BORDER_RADIUS: {
    SMALL: '0.5rem',
    MEDIUM: '0.75rem',
    LARGE: '1rem',
  },
  TRANSITION_DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
  },
} as const

const DEFAULT_VALUES = {
  CITY: '杭州',
  FALLBACK_CITY: '北京',
  WEATHER_UNKNOWN: '未知',
  HITOKOTO_AUTHOR: '一言',
  HITOKOTO_DEFAULT: '暂无',
} as const

export {
  DEBUG_MODE,
  TIME_UNITS,
  API_CONFIG,
  STORAGE_KEYS,
  CACHE_CONFIG,
  BOOKMARK_CONFIG,
  THEME_CONFIG,
  GEOLOCATION_CONFIG,
  UI_CONFIG,
  DEFAULT_VALUES,
}
