const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions {
  method?: string;
  body?: unknown;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // For cookie-based auth, credentials: 'include' handles it automatically
  // For bearer token fallback
  const token = await chrome.storage.local.get('auth_token');
  if (token.auth_token) {
    return { Authorization: `Bearer ${token.auth_token}` };
  }
  return {};
}

export const api = {
  bookmarks: {
    list: () => apiRequest('/api/bookmarks'),
    create: (data: CreateBookmarkData) => apiRequest('/api/bookmarks', { method: 'POST', body: data }),
    update: (id: string, data: UpdateBookmarkData) => apiRequest(`/api/bookmarks/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiRequest(`/api/bookmarks/${id}`, { method: 'DELETE' }),
    sync: (data: { bookmarks: CreateBookmarkData[] }) => apiRequest('/api/bookmarks/sync', { method: 'POST', body: data }),
  },
  auth: {
    getSession: () => apiRequest('/auth/session'),
    signOut: () => apiRequest('/auth/sign-out', { method: 'POST' }),
  },
  weather: {
    get: (lat: number, lon: number) => apiRequest(`/api/weather?latitude=${lat}&longitude=${lon}`),
  },
  weather60s: (city: string) => apiRequest(`/api/60s/weather?city=${encodeURIComponent(city)}`),
  quote60s: () => apiRequest('/api/60s/quote'),
  history60s: () => apiRequest('/api/60s/history'),
  aiNews60s: () => apiRequest('/api/60s/ai-news'),
  bing60s: () => apiRequest('/api/60s/bing'),
  geocode: (lat: number, lon: number) => apiRequest(`/api/geocode?lat=${lat}&lon=${lon}`),
  favicon: (url: string, size?: number) => apiRequest(`/api/favicon?url=${encodeURIComponent(url)}${size ? `&size=${size}` : ''}`),
  metadata: (url: string) => apiRequest(`/api/metadata?url=${encodeURIComponent(url)}`),
};

interface CreateBookmarkData {
  folderId: string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  color?: string;
}

interface UpdateBookmarkData extends Partial<CreateBookmarkData> {}