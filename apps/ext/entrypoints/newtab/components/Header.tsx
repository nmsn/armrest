import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function Header({ searchQuery, onSearchQueryChange, onSearch, onKeyDown }: HeaderProps) {
  return (
    <div className="app-header-left">
      <div className="app-logo">Arm<span>rest</span></div>

      <div className="app-header-search">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search or enter URL..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-10 rounded-xl border-border bg-card pr-12 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1 h-8 w-8 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
            onClick={onSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
