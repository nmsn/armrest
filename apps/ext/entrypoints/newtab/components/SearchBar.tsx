import { SearchIcon } from "@/components/ui/saerch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onSearch: () => void
  onSearchKeyDown: (e: React.KeyboardEvent) => void
  intentDisplayText?: string
}

export function SearchBar({ searchQuery, onSearchQueryChange, onSearch, onSearchKeyDown, intentDisplayText }: SearchBarProps) {
  return (
    <div className="flex-1">
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-0">
          {intentDisplayText ? (
            <p className="px-1 text-[11px] leading-4 text-muted-foreground">{intentDisplayText}</p>
          ) : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center">
          <Input
            type="text"
            placeholder="Search or enter URL..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            className="h-9 w-full rounded-lg border-border bg-card pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus:border-accent focus:ring-0"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
            onClick={onSearch}
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
