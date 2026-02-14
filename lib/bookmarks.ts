export interface Bookmark {
  id: string
  name: string
  url: string
  description?: string
  logo?: string
  color?: string
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

const STORAGE_KEY = "armrest_bookmarks"
const CURRENT_VERSION = 1

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getDefaultState(): BookmarkState {
  return {
    version: CURRENT_VERSION,
    folders: [
      {
        id: generateId(),
        name: "Work",
        icon: "code",
        color: "#6366F1",
        bookmarks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: generateId(),
        name: "Tools",
        icon: "wrench",
        color: "#10B981",
        bookmarks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: generateId(),
        name: "Design",
        icon: "palette",
        color: "#EC4899",
        bookmarks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: generateId(),
        name: "Social",
        icon: "users",
        color: "#F59E0B",
        bookmarks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
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
        resolve(data)
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
  bookmark: Omit<Bookmark, "id" | "createdAt" | "updatedAt">
): Promise<BookmarkState> {
  const state = await getBookmarks()
  const folder = state.folders.find((f) => f.id === folderId)
  if (!folder) {
    throw new Error("Folder not found")
  }
  const newBookmark: Bookmark = {
    ...bookmark,
    id: generateId(),
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
  updates: Partial<Omit<Bookmark, "id" | "createdAt" | "updatedAt">>
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
  toFolder.bookmarks.push(bookmark)
  fromFolder.updatedAt = Date.now()
  toFolder.updatedAt = Date.now()
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
      await saveBookmarks(imported)
      return imported
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
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })),
        })
      }
    }
    await saveBookmarks(currentState)
    return currentState
  } catch (error) {
    throw new Error(`Failed to import bookmarks: ${error}`)
  }
}

export async function clearAllBookmarks(): Promise<void> {
  const defaultState = getDefaultState()
  await saveBookmarks(defaultState)
}
