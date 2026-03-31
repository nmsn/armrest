import { api } from "./api-client"

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export async function getFaviconUrl(url: string, size: number = 32): Promise<string> {
  try {
    const result = await api.favicon(url, size)
    if (result.data) {
      return result.data.favicon
    }
  } catch (error) {
    console.error("Favicon fetch error:", error)
  }
  // fallback
  const domain = extractDomain(url)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

export interface WebsiteMetadata {
  title: string
  description?: string
  favicon: string
  logo?: string
  domain: string
  image?: string
}

export async function fetchWebsiteInfo(url: string): Promise<WebsiteMetadata> {
  const domain = extractDomain(url)
  const normalizedUrl = normalizeUrl(url)

  // Fallback favicon/logo
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  const fallbackLogo = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

  try {
    const result = await api.metadata(normalizedUrl)

    if (result.data) {
      return {
        title: result.data.title || domain.charAt(0).toUpperCase() + domain.slice(1),
        description: result.data.description,
        image: result.data.image,
        logo: result.data.logo || fallbackLogo,
        favicon: result.data.favicon || fallbackFavicon,
        domain,
      }
    }
  } catch (error) {
    console.error("Failed to fetch website metadata:", error)
  }

  // Fallback if API call fails
  return {
    title: domain.charAt(0).toUpperCase() + domain.slice(1),
    favicon: fallbackFavicon,
    logo: fallbackLogo,
    domain,
  }
}

export async function fetchWebsiteInfoSimple(url: string): Promise<{
  name: string
  favicon: string
  logo?: string
  domain: string
}> {
  const info = await fetchWebsiteInfo(url)
  return {
    name: info.title,
    favicon: info.favicon,
    logo: info.logo,
    domain: info.domain,
  }
}
