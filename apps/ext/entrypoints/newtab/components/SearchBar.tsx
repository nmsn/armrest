import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
  onSearchKeyDown: (e: React.KeyboardEvent) => void
}

export function SearchBar({ searchQuery, onSearchQueryChange, onSearch, onSearchKeyDown }: SearchBarProps) {
  return (
    <div className="relative flex-1 h-full flex items-center">
      <Input
        type="text"
        placeholder="Search or enter URL..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        onKeyDown={onSearchKeyDown}
        className="h-9 rounded-lg border-border bg-card pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
        onClick={onSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  )
}
