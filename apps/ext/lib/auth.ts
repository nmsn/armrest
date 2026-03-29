import { api } from './api-client';

export interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

let currentUser: User | null = null;

export async function checkAuth(): Promise<User | null> {
  try {
    const session = await api.auth.getSession();
    currentUser = session.user;
    return currentUser;
  } catch {
    currentUser = null;
    return null;
  }
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export async function signOut(): Promise<void> {
  await api.auth.signOut();
  currentUser = null;
  await chrome.storage.local.remove('auth_token');
}