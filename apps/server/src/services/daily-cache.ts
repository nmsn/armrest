import { eq, lt } from 'drizzle-orm';
import { getDb } from '../db';
import { dailyQuotes, dailyHistory, dailyNews } from '../db/schema';
import type { Env } from '../index';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface CachedQuote { content: string; author: string; date: string; }
export interface CachedHistory { events: Array<{ year: string; title: string }>; date: string; }
export interface CachedNews { news: Array<{ title: string; source?: string; url?: string }>; date: string; }

function isExpired(fetchedAt: Date | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > SEVEN_DAYS_MS;
}

// ==================== Quote ====================
export async function getQuote(env: Env): Promise<CachedQuote | null> {
  const db = getDb(env);
  const rows = await db.select().from(dailyQuotes).where(eq(dailyQuotes.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { content: row.content, author: row.author, date: row.date };
}

export async function setQuote(env: Env, content: string, author: string, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyQuotes).values({ id: 'latest', content, author, date }).onConflictDoUpdate({
    target: dailyQuotes.id,
    set: { content, author, date, fetchedAt: new Date() },
  });
}

// ==================== History ====================
export async function getHistory(env: Env): Promise<CachedHistory | null> {
  const db = getDb(env);
  const rows = await db.select().from(dailyHistory).where(eq(dailyHistory.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { events: JSON.parse(row.events), date: row.date };
}

export async function setHistory(env: Env, events: Array<{ year: string; title: string }>, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyHistory).values({ id: 'latest', events: JSON.stringify(events), date }).onConflictDoUpdate({
    target: dailyHistory.id,
    set: { events: JSON.stringify(events), date, fetchedAt: new Date() },
  });
}

// ==================== News ====================
export async function getNews(env: Env): Promise<CachedNews | null> {
  const db = getDb(env);
  const rows = await db.select().from(dailyNews).where(eq(dailyNews.id, 'latest')).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt)) return null;
  return { news: JSON.parse(row.news), date: row.date };
}

export async function setNews(env: Env, news: Array<{ title: string; source?: string; url?: string }>, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyNews).values({ id: 'latest', news: JSON.stringify(news), date }).onConflictDoUpdate({
    target: dailyNews.id,
    set: { news: JSON.stringify(news), date, fetchedAt: new Date() },
  });
}

// ==================== Cleanup ====================
export async function cleanExpired(env: Env): Promise<void> {
  const db = getDb(env);
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);
  await db.delete(dailyQuotes).where(lt(dailyQuotes.fetchedAt, cutoff));
  await db.delete(dailyHistory).where(lt(dailyHistory.fetchedAt, cutoff));
  await db.delete(dailyNews).where(lt(dailyNews.fetchedAt, cutoff));
}