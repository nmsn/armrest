export interface Bookmark {
  id: string
  name: string
  url: string
  description?: string
  logo?: string
  color?: string
  order: number
  createdAt: number
  updatedAt: number
}

export interface BookmarkFolder {
  id: string
  name: string
  icon?: string
  color?: string
  bookmarks: Bookmark[]
  createdAt: number
  updatedAt: number
}

export interface BookmarkState {
  folders: BookmarkFolder[]
  version: number
}

import { STORAGE_KEYS, BOOKMARK_CONFIG } from "./constants"

const STORAGE_KEY = STORAGE_KEYS.BOOKMARKS
const CURRENT_VERSION = BOOKMARK_CONFIG.CURRENT_VERSION

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function normalizeBookmarksOrder(bookmarks: Bookmark[]): { bookmarks: Bookmark[]; changed: boolean } {
  const sorted = [...bookmarks].sort((a, b) => {
    const aOrder = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER
    const bOrder = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER
    return aOrder - bOrder
  })

  let changed = false
  const normalized = sorted.map((bookmark, index) => {
    if (bookmark.order !== index || bookmarks[index]?.id !== bookmark.id) {
      changed = true
    }

    return {
      ...bookmark,
      order: index,
    }
  })

  return { bookmarks: normalized, changed }
}

function normalizeState(state: BookmarkState): { state: BookmarkState; changed: boolean } {
  let changed = false
  const normalizedFolders = state.folders.map((folder) => {
    const { bookmarks, changed: folderChanged } = normalizeBookmarksOrder(folder.bookmarks)
    if (folderChanged) {
      changed = true
    }

    return {
      ...folder,
      bookmarks,
    }
  })

  return {
    state: {
      ...state,
      folders: normalizedFolders,
    },
    changed,
  }
}

function getDefaultState(): BookmarkState {
  return {
    version: CURRENT_VERSION,
    folders: BOOKMARK_CONFIG.DEFAULT_FOLDERS.map((folder) => ({
      id: generateId(),
      name: folder.name,
      icon: folder.icon,
      color: folder.color,
      bookmarks: (folder.bookmarks || []).map((bookmark, index) => ({
        ...bookmark,
        id: generateId(),
        order: index,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })),
  }
}

export async function getBookmarks(): Promise<BookmarkState> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as BookmarkState | undefined
      if (!data || data.version !== CURRENT_VERSION) {
        const defaultState = getDefaultState()
        chrome.storage.sync.set({ [STORAGE_KEY]: defaultState })
        resolve(defaultState)
      } else {
        const { state: normalizedState, changed } = normalizeState(data)
        if (changed) {
          chrome.storage.sync.set({ [STORAGE_KEY]: normalizedState })
        }
        resolve(normalizedState)
      }
    })
  })
}

export async function saveBookmarks(state: BookmarkState): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: state }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export async function addFolder(name: string, icon?: string, color?: string): Promise<BookmarkState> {
  const state = await getBookmarks()
  const newFolder: BookmarkFolder = {
    id: generateId(),
    name,
    icon,
    color,
    bookmarks: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  state.folders.push(newFolder)
  await saveBookmarks(state)
  return state
}

export async function updateFolder(
  folderId: string,
  updates: Partial<Pick<BookmarkFolder, "name" | "icon" | "color">>
): Promise<BookmarkState> {
  const state = await getBookmarks()
  const folderIndex = state.folders.findIndex((f) => f.id === folderId)
  if (folderIndex === -1) {
    throw new Error("Folder not found")
  }
  state.folders[folderIndex] = {
    ...state.folders[folderIndex],
    ...updates,
    updatedAt: Date.now(),
  }
  await saveBookmarks(state)
  return state
}

export async function deleteFolder(folderId: string): Promise<BookmarkState> {
  const state = await getBookmarks()
  state.folders = state.folders.filter((f) => f.id !== folderId)
  await saveBookmarks(state)
  return state
}

export async function addBookmark(
  folderId: string,
  bookmark: Omit<Bookmark, "id" | "order" | "createdAt" | "updatedAt">
): Promise<BookmarkState> {
  const state = await getBookmarks()
  const folder = state.folders.find((f) => f.id === folderId)
  if (!folder) {
    throw new Error("Folder not found")
  }
  const newBookmark: Bookmark = {
    ...bookmark,
    id: generateId(),
    order: folder.bookmarks.length,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  folder.bookmarks.push(newBookmark)
  folder.updatedAt = Date.now()
  await saveBookmarks(state)
  return state
}

export async function updateBookmark(
  folderId: string,
  bookmarkId: string,
  updates: Partial<Omit<Bookmark, "id" | "order" | "createdAt" | "updatedAt">>
): Promise<BookmarkState> {
  const state = await getBookmarks()
  const folder = state.folders.find((f) => f.id === folderId)
  if (!folder) {
    throw new Error("Folder not found")
  }
  const bookmarkIndex = folder.bookmarks.findIndex((b) => b.id === bookmarkId)
  if (bookmarkIndex === -1) {
    throw new Error("Bookmark not found")
  }
  folder.bookmarks[bookmarkIndex] = {
    ...folder.bookmarks[bookmarkIndex],
    ...updates,
    updatedAt: Date.now(),
  }
  folder.updatedAt = Date.now()
  await saveBookmarks(state)
  return state
}

export async function deleteBookmark(
  folderId: string,
  bookmarkId: string
): Promise<BookmarkState> {
  const state = await getBookmarks()
  const folder = state.folders.find((f) => f.id === folderId)
  if (!folder) {
    throw new Error("Folder not found")
  }
  folder.bookmarks = folder.bookmarks.filter((b) => b.id !== bookmarkId)
  folder.bookmarks = folder.bookmarks.map((bookmark, index) => ({
    ...bookmark,
    order: index,
  }))
  folder.updatedAt = Date.now()
  await saveBookmarks(state)
  return state
}

export async function moveBookmark(
  fromFolderId: string,
  toFolderId: string,
  bookmarkId: string
): Promise<BookmarkState> {
  const state = await getBookmarks()
  const fromFolder = state.folders.find((f) => f.id === fromFolderId)
  const toFolder = state.folders.find((f) => f.id === toFolderId)
  if (!fromFolder || !toFolder) {
    throw new Error("Folder not found")
  }
  const bookmarkIndex = fromFolder.bookmarks.findIndex((b) => b.id === bookmarkId)
  if (bookmarkIndex === -1) {
    throw new Error("Bookmark not found")
  }
  const [bookmark] = fromFolder.bookmarks.splice(bookmarkIndex, 1)
  bookmark.updatedAt = Date.now()
  bookmark.order = toFolder.bookmarks.length
  toFolder.bookmarks.push(bookmark)
  fromFolder.bookmarks = fromFolder.bookmarks.map((item, index) => ({
    ...item,
    order: index,
  }))
  toFolder.bookmarks = toFolder.bookmarks.map((item, index) => ({
    ...item,
    order: index,
  }))
  fromFolder.updatedAt = Date.now()
  toFolder.updatedAt = Date.now()
  await saveBookmarks(state)
  return state
}

export async function reorderBookmarks(
  folderId: string,
  orderedBookmarkIds: string[]
): Promise<BookmarkState> {
  const state = await getBookmarks()
  const folder = state.folders.find((f) => f.id === folderId)
  if (!folder) {
    throw new Error("Folder not found")
  }

  if (orderedBookmarkIds.length !== folder.bookmarks.length) {
    throw new Error("Invalid bookmark order")
  }

  const bookmarkMap = new Map(folder.bookmarks.map((bookmark) => [bookmark.id, bookmark]))
  const now = Date.now()
  folder.bookmarks = orderedBookmarkIds.map((bookmarkId, index) => {
    const bookmark = bookmarkMap.get(bookmarkId)
    if (!bookmark) {
      throw new Error("Invalid bookmark id in order")
    }

    return {
      ...bookmark,
      order: index,
      updatedAt: now,
    }
  })

  folder.updatedAt = now
  await saveBookmarks(state)
  return state
}

export async function exportBookmarks(): Promise<string> {
  const state = await getBookmarks()
  return JSON.stringify(state, null, 2)
}

export async function importBookmarks(
  jsonString: string,
  merge: boolean = false
): Promise<BookmarkState> {
  try {
    const imported = JSON.parse(jsonString) as BookmarkState
    if (!imported.folders || !Array.isArray(imported.folders)) {
      throw new Error("Invalid bookmark format")
    }
    if (!merge) {
      const { state: normalizedState } = normalizeState(imported)
      await saveBookmarks(normalizedState)
      return normalizedState
    }
    const currentState = await getBookmarks()
    const existingFolderNames = new Set(currentState.folders.map((f) => f.name))
    for (const folder of imported.folders) {
      if (existingFolderNames.has(folder.name)) {
        const existingFolder = currentState.folders.find((f) => f.name === folder.name)
        if (existingFolder) {
          const existingBookmarkUrls = new Set(existingFolder.bookmarks.map((b) => b.url))
          for (const bookmark of folder.bookmarks) {
            if (!existingBookmarkUrls.has(bookmark.url)) {
              existingFolder.bookmarks.push({
                ...bookmark,
                id: generateId(),
                order: existingFolder.bookmarks.length,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            }
          }
          existingFolder.updatedAt = Date.now()
        }
      } else {
        currentState.folders.push({
          ...folder,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          bookmarks: folder.bookmarks.map((b) => ({
            ...b,
            id: generateId(),
            order: typeof b.order === "number" ? b.order : 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
        })
      }
    }
    const { state: normalizedState } = normalizeState(currentState)
    await saveBookmarks(normalizedState)
    return normalizedState
  } catch (error) {
    throw new Error(`Failed to import bookmarks: ${error}`)
  }
}

export async function clearAllBookmarks(): Promise<void> {
  const defaultState = getDefaultState()
  await saveBookmarks(defaultState)
}
