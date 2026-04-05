const TIME_UNITS = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const

const API_CONFIG = {} as const

const STORAGE_KEYS = {
  BOOKMARKS: 'armrest_bookmarks',
  THEME: 'armrest-theme-config',
  DAILY_DATA: 'armrest-daily-data',
  READ_LATER: 'armrest_readlater',
  WORD_HISTORY: 'armrest_word_history',
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

const WEATHER_CODE_MAP: Record<string, { name: string; description: string }> = {
  '00': { name: '晴', description: 'Sunny/Clear' },
  '01': { name: '多云', description: 'Sunny/Cloudy' },
  '02': { name: '阴', description: 'Overcast' },
  '03': { name: '阵雨', description: 'Shower' },
  '04': { name: '雷阵雨', description: 'Thundershower' },
  '05': { name: '雷阵雨伴有冰雹', description: 'Thundershower with hail' },
  '06': { name: '雨夹雪', description: 'Sleet' },
  '07': { name: '小雨', description: 'Light rain' },
  '08': { name: '中雨', description: 'Moderate rain' },
  '09': { name: '大雨', description: 'Heavy rain' },
  '10': { name: '暴雨', description: 'Storm' },
  '11': { name: '大暴雨', description: 'Heavy storm' },
  '12': { name: '特大暴雨', description: 'Severe storm' },
  '13': { name: '阵雪', description: 'Snow shower' },
  '14': { name: '小雪', description: 'Light snow' },
  '15': { name: '中雪', description: 'Moderate snow' },
  '16': { name: '大雪', description: 'Heavy snow' },
  '17': { name: '暴雪', description: 'Blizzard' },
  '18': { name: '雾', description: 'Fog' },
  '19': { name: '冻雨', description: 'Freezing rain' },
  '20': { name: '沙尘暴', description: 'Sandstorm' },
  '21': { name: '小到中雨', description: 'Light to moderate rain' },
  '22': { name: '中到大雨', description: 'Moderate to heavy rain' },
  '23': { name: '大到暴雨', description: 'Heavy to storm' },
  '24': { name: '暴雨到大暴雨', description: 'Storm to heavy storm' },
  '25': { name: '大暴雨到特大暴雨', description: 'Heavy storm to severe storm' },
  '26': { name: '小到中雪', description: 'Light to moderate snow' },
  '27': { name: '中到大雪', description: 'Moderate to heavy snow' },
  '28': { name: '大到暴雪', description: 'Heavy to blizzard' },
  '29': { name: '浮尘', description: 'Floating dust' },
  '30': { name: '扬沙', description: 'Blowing sand' },
  '31': { name: '强沙尘暴', description: 'Strong sandstorm' },
  '32': { name: '浓雾', description: 'Dense fog' },
  '33': { name: '强浓雾', description: 'Strong dense fog' },
  '34': { name: '霾', description: 'Haze' },
  '35': { name: '中度霾', description: 'Moderate haze' },
  '36': { name: '重度霾', description: 'Heavy haze' },
  '37': { name: '严重霾', description: 'Severe haze' },
  '38': { name: '大雾', description: 'Heavy fog' },
  '39': { name: '特强浓雾', description: 'Extra strong dense fog' },
  '99': { name: '无', description: 'No weather data' },
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
  THEME_CONFIG,
  GEOLOCATION_CONFIG,
  UI_CONFIG,
  DEFAULT_VALUES,
  WEATHER_CODE_MAP,
}
