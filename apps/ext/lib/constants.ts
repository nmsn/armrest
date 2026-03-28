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
      WEATHER: '/v2/weather',
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
    { name: 'Work', icon: 'code', color: '#3B82F6', bookmarks: [] },
    { name: 'Tools', icon: 'wrench', color: '#10B981', bookmarks: [] },
    { name: 'Design', icon: 'palette', color: '#F59E0B', bookmarks: [] },
    {
      name: 'AI', icon: 'sparkles', color: '#8B5CF6', bookmarks: [
        { name: 'Grok', url: 'https://x.com/i/grok', color: '#10B981' },
        { name: 'Claude', url: 'https://claude.ai', color: '#EC4899' },
        { name: 'GLM', url: 'https://www.zhipuai.cn/', color: '#6366F1' },
        { name: 'DeepSeek', url: 'https://www.deepseek.com/', color: '#3B82F6' },
        { name: 'DeepWiki', url: 'https://deepwiki.com/', color: '#8B5CF6' },
        { name: 'Skills.sh', url: 'https://skills.sh/', color: '#F59E0B' },
      ]
    },
  ],
  ICON_OPTIONS: [
    { id: 'folder', label: 'Folder' },
    { id: 'code', label: 'Code' },
    { id: 'wrench', label: 'Tools' },
    { id: 'palette', label: 'Design' },
    { id: 'users', label: 'Social' },
    { id: 'bookmark', label: 'Bookmark' },
    { id: 'star', label: 'Star' },
    { id: 'sparkles', label: 'AI' },
    { id: 'home', label: 'Home' },
    { id: 'search', label: 'Search' },
    { id: 'heart', label: 'Heart' },
    { id: 'mail', label: 'Mail' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'clock', label: 'Clock' },
    { id: 'link', label: 'Link' },
    { id: 'image', label: 'Image' },
    { id: 'music', label: 'Music' },
    { id: 'video', label: 'Video' },
    { id: 'file', label: 'File' },
    { id: 'settings', label: 'Settings' },
    { id: 'trash', label: 'Trash' },
    { id: 'edit', label: 'Edit' },
    { id: 'save', label: 'Save' },
    { id: 'share', label: 'Share' },
  ],
  FOLDER_COLORS: [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#6B7280',
  ],
  DEFAULT_FOLDER_COLOR: '#3B82F6',
  BOOKMARK_COLORS: [
    '#6366F1',
    '#10B981',
    '#EC4899',
    '#F59E0B',
    '#EF4444',
    '#3B82F6',
    '#8B5CF6',
    '#14B8A6',
  ],
} as const

const THEME_COLORS = [
  "#FAFAFA",
  "#F5F5F5",
  "#EFEEEE",
  "#E8E4DE",
  "#F3E8FF",
  "#E0F2FE",
  "#FEF3C7",
  "#DCFCE7",
]

const DARK_THEME_COLORS = [
  "#0F172A",
  "#1E1B4B",
  "#18181B",
  "#1F2937",
  "#111827",
  "#312E81",
  "#0F1729",
  "#1A1A2E",
]

const BACKGROUND_IMAGES = [
  { name: "None", url: "" },
  { name: "Gradient 1", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80" },
  { name: "Gradient 2", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80" },
  { name: "Nature", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80" },
  { name: "Ocean", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80" },
  { name: "Mountain", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80" },
]

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
  TIME_UNITS,
  API_CONFIG,
  STORAGE_KEYS,
  CACHE_CONFIG,
  BOOKMARK_CONFIG,
  THEME_COLORS,
  DARK_THEME_COLORS,
  BACKGROUND_IMAGES,
  THEME_CONFIG,
  GEOLOCATION_CONFIG,
  UI_CONFIG,
  DEFAULT_VALUES,
}
