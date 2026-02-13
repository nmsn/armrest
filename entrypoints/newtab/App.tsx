import { useState } from "react"
import { Settings, Search } from "lucide-react"
import Clock from "./components/Clock"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function App() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}` })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Armrest Dashboard</h1>
      <Clock />
      <div className="mt-8 flex items-center gap-2">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search Google..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-64 pr-10"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full max-w-sm top-0 right-0 left-auto mt-0 rounded-none">
            <DrawerHeader>
              <DrawerTitle>Settings</DrawerTitle>
              <DrawerDescription>
                Configure your dashboard preferences.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Settings panel content goes here.
              </p>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
