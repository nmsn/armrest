import { useState, useMemo, useCallback } from "react"
import { resolveIntent, INTENT_LABELS, type FavoriteItem } from "../search-intent"
import { executeSearch, type Intent as SearchIntent } from "../lib/search-engine"

export function useSearch(favoriteItems: FavoriteItem[]) {
  const [searchQuery, setSearchQuery] = useState("")

  const resolved = useMemo(
    () => resolveIntent(searchQuery, favoriteItems),
    [searchQuery, favoriteItems]
  )

  const handleSearch = useCallback(() => {
    const q = (resolved.q || searchQuery).trim()
    if (!q) return
    executeSearch(resolved.intent as SearchIntent, q, favoriteItems)
  }, [resolved, searchQuery, favoriteItems])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const intentDisplayText =
    resolved.reason === "prefix"
      ? `将执行：${INTENT_LABELS[resolved.intent as SearchIntent]}`
      : undefined

  return {
    searchQuery,
    resolved,
    intentDisplayText,
    handleSearchQueryChange,
    handleSearch,
    handleKeyDown,
  }
}
