export type Intent = "FAVORITE" | "DICT" | "AI" | "GOOGLE"

export const INTENT_LABELS: Record<Intent, string> = {
  FAVORITE: "收藏夹",
  DICT: "词典",
  AI: "AI 搜索",
  GOOGLE: "Google",
}

export interface ResolveResult {
  intent: Intent
  q: string
  reason: "prefix" | "favorite_match" | "dict_rule" | "question_rule" | "fallback"
  alternatives: Intent[]
}

const PREFIX_INTENT_MAP: Record<string, Intent> = {
  "ai:": "AI",
  "dict:": "DICT",
  "fav:": "FAVORITE",
  "g:": "GOOGLE",
}

const QUESTION_HINTS = ["?", "？", "为什么", "怎么", "what", "how", "why"]
const TLD_HINTS = [".com", ".cn", ".io", ".dev", ".org", ".net"]

export interface FavoriteItem {
  name: string
  url: string
  path?: string
}

export function resolveIntent(input: string, favorites: FavoriteItem[]): ResolveResult {
  const raw = input.trim()
  if (!raw) {
    return { intent: "GOOGLE", q: "", reason: "fallback", alternatives: [] }
  }

  const prefixed = parsePrefix(raw)
  if (prefixed) {
    return {
      intent: prefixed.intent,
      q: prefixed.q,
      reason: "prefix",
      alternatives: getAlternatives(prefixed.intent),
    }
  }

  const hitFavorite = findFavoriteMatch(raw, favorites)
  if (hitFavorite) {
    return {
      intent: "FAVORITE",
      q: raw,
      reason: "favorite_match",
      alternatives: getAlternatives("FAVORITE"),
    }
  }

  if (matchDict(raw)) {
    return {
      intent: "DICT",
      q: raw,
      reason: "dict_rule",
      alternatives: getAlternatives("DICT"),
    }
  }

  if (matchQuestion(raw)) {
    return {
      intent: "AI",
      q: raw,
      reason: "question_rule",
      alternatives: getAlternatives("AI"),
    }
  }

  return {
    intent: "GOOGLE",
    q: raw,
    reason: "fallback",
    alternatives: getAlternatives("GOOGLE"),
  }
}

function parsePrefix(input: string): { intent: Intent; q: string } | null {
  const lower = input.toLowerCase()
  for (const prefix of Object.keys(PREFIX_INTENT_MAP)) {
    if (lower.startsWith(prefix)) {
      return {
        intent: PREFIX_INTENT_MAP[prefix],
        q: input.slice(prefix.length).trim(),
      }
    }
  }
  return null
}

export function findFavoriteMatch(input: string, favorites: FavoriteItem[]): FavoriteItem | null {
  const q = normalize(input)
  if (!q) return null

  let startsWithMatch: FavoriteItem | null = null
  let includesMatch: FavoriteItem | null = null

  for (const favorite of favorites) {
    const fields = [favorite.name, favorite.url, favorite.path ?? ""].map(normalize)

    if (fields.some((s) => s === q)) return favorite

    if (!startsWithMatch && fields.some((s) => s.startsWith(q) || q.startsWith(s))) {
      startsWithMatch = favorite
      continue
    }

    if (!includesMatch && fields.some((s) => s.includes(q) || q.includes(s))) {
      includesMatch = favorite
    }
  }

  return startsWithMatch ?? includesMatch
}

function matchDict(input: string): boolean {
  const q = input.trim()
  if (!q || q.includes(" ")) return false
  if (q.length < 2 || q.length > 32) return false

  const lower = q.toLowerCase()
  if (lower.includes("/") || TLD_HINTS.some((tld) => lower.includes(tld))) return false

  const letters = (q.match(/[a-zA-Z]/g) ?? []).length
  return letters / q.length >= 0.7
}

function matchQuestion(input: string): boolean {
  const lower = input.toLowerCase()
  if (QUESTION_HINTS.some((k) => lower.includes(k))) return true
  if (input.length > 20 && /\s/.test(input)) return true
  return false
}

function getAlternatives(primary: Intent): Intent[] {
  return (["FAVORITE", "DICT", "AI", "GOOGLE"] as Intent[]).filter((i) => i !== primary)
}

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

