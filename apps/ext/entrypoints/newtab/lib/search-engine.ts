import type { Intent, FavoriteItem } from "../search-intent"

export { INTENT_LABELS } from "../search-intent"
export type { Intent, FavoriteItem }

export function toNavigableUrl(input: string): string | null {
  const q = input.trim()
  if (!q || /\s/.test(q)) return null
  if (/^https?:\/\//i.test(q)) return q
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(q)) return `https://${q}`
  return null
}

export function executeSearch(
  intent: Intent,
  query: string,
  favoriteItems: FavoriteItem[]
) {
  const q = query.trim()
  if (!q) return

  console.info("[search-intent]", { input_text: query, intent })

  switch (intent) {
    case "FAVORITE": {
      const favorite = favoriteItems.find(
        (f) =>
          [f.name, f.url, f.path ?? ""].some((s) =>
            s.trim().toLowerCase() === q.toLowerCase()
          ) ||
          [f.name, f.url, f.path ?? ""].some((s) =>
            s.trim().toLowerCase().startsWith(q.toLowerCase())
          )
      )
      if (favorite) {
        chrome.tabs.create({ url: favorite.url })
        return
      }
      chrome.tabs.create({
        url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      })
      return
    }
    case "DICT": {
      chrome.tabs.create({
        url: `https://www.dictionary.com/browse/${encodeURIComponent(q)}`,
      })
      return
    }
    case "AI": {
      chrome.tabs.create({
        url: `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
      })
      return
    }
    case "GOOGLE":
    default: {
      const maybeUrl = toNavigableUrl(q)
      if (maybeUrl) {
        chrome.tabs.create({ url: maybeUrl })
        return
      }
      chrome.tabs.create({
        url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      })
    }
  }
}
