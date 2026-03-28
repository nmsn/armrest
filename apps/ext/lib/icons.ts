import { Folder, Bookmark as BookmarkIcon, Code, Wrench, Palette, Users, Settings, Star, Sparkles, Home, Search, Heart, Mail, Calendar, Clock, Link, Image, Music, Video, File, Trash2, Edit2, Save, Share2 } from "lucide-react"

export interface IconOption {
  id: string
  label: string
}

export const ICON_OPTIONS: IconOption[] = [
  { id: "folder", label: "Folder" },
  { id: "code", label: "Code" },
  { id: "wrench", label: "Tools" },
  { id: "palette", label: "Design" },
  { id: "users", label: "Social" },
  { id: "bookmark", label: "Bookmark" },
  { id: "star", label: "Star" },
  { id: "sparkles", label: "AI" },
  { id: "home", label: "Home" },
  { id: "search", label: "Search" },
  { id: "heart", label: "Heart" },
  { id: "mail", label: "Mail" },
  { id: "calendar", label: "Calendar" },
  { id: "clock", label: "Clock" },
  { id: "link", label: "Link" },
  { id: "image", label: "Image" },
  { id: "music", label: "Music" },
  { id: "video", label: "Video" },
  { id: "file", label: "File" },
  { id: "settings", label: "Settings" },
  { id: "trash", label: "Trash" },
  { id: "edit", label: "Edit" },
  { id: "save", label: "Save" },
  { id: "share", label: "Share" },
]

export const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  code: Code,
  wrench: Wrench,
  palette: Palette,
  users: Users,
  bookmark: BookmarkIcon,
  settings: Settings,
  star: Star,
  sparkles: Sparkles,
  home: Home,
  search: Search,
  heart: Heart,
  mail: Mail,
  calendar: Calendar,
  clock: Clock,
  link: Link,
  image: Image,
  music: Music,
  video: Video,
  file: File,
  trash: Trash2,
  edit: Edit2,
  save: Save,
  share: Share2,
}

export function getIconComponent(iconId: string) {
  return ICON_COMPONENTS[iconId] || Folder
}
