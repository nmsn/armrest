export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function getFaviconUrl(url: string, size: number = 32): string {
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

async function getMetadataFromProxy(url: string): Promise<Partial<WebsiteMetadata>> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`

  try {
    const response = await fetch(proxyUrl)
    const data = await response.json()

    if (data.contents) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, "text/html")

      const title = doc.querySelector("title")?.textContent || ""
      const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") || ""
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || ""

      return { title, description, image: ogImage }
    }
  } catch (error) {
    console.error("Proxy fetch error:", error)
  }

  return {}
}

async function getMetadataFromMicrolink(url: string): Promise<Partial<WebsiteMetadata>> {
  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true`)
    const data = await response.json()

    if (data.status === "success" && data.data) {
      const { title, description, image, logo, favicon } = data.data
      return {
        title: title || "",
        description: description || "",
        image: image?.url || "",
        logo: logo?.url || "",
        favicon: favicon?.url || "",
      }
    }
  } catch (error) {
    console.error("Microlink fetch error:", error)
  }

  return {}
}

export async function fetchWebsiteInfo(url: string): Promise<WebsiteMetadata> {
  const domain = extractDomain(url)
  const normalizedUrl = normalizeUrl(url)

  const baseInfo: WebsiteMetadata = {
    title: domain.charAt(0).toUpperCase() + domain.slice(1),
    favicon: getFaviconUrl(url, 64),
    logo: getFaviconUrl(url, 128),
    domain,
  }

  try {
    const [proxyMetadata, microlinkMetadata] = await Promise.all([
      getMetadataFromProxy(normalizedUrl),
      getMetadataFromMicrolink(normalizedUrl),
    ])

    const mergedMetadata = {
      ...baseInfo,
      ...proxyMetadata,
      ...microlinkMetadata,
    }

    if (mergedMetadata.title && mergedMetadata.title !== domain) {
      baseInfo.title = mergedMetadata.title
    }

    if (mergedMetadata.description) {
      baseInfo.description = mergedMetadata.description
    }

    if (mergedMetadata.image) {
      baseInfo.image = mergedMetadata.image
    }

    if (mergedMetadata.logo) {
      baseInfo.logo = mergedMetadata.logo
    }

    if (mergedMetadata.favicon) {
      baseInfo.favicon = mergedMetadata.favicon
    }

    return baseInfo
  } catch (error) {
    console.error("Failed to fetch website metadata:", error)
    return baseInfo
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
