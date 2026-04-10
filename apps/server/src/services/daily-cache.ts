import { eq, lt } from 'drizzle-orm';
import { getDb } from '../db';
import { dailyQuotes, dailyHistory, dailyAiNews, dailyItNews, dailyHackerNews } from '../db/schema';
import type { RuntimeContext } from './runtime-context';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

export interface CachedQuote { content: string; date: string; }
export interface CachedHistory { events: Array<{ year: string; title: string }>; date: string; }
export interface CachedNews { news: Array<{ title: string; source?: string; url?: string }>; date: string; }
export interface CachedItNews { news: Array<{ title: string; description?: string; link: string }> }
export interface CachedHackerNews { stories: Array<{ id: number; title: string; url: string; score: number; by: string; time: string }> }

function isExpired(fetchedAt: Date | null, ttlMs: number): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > ttlMs;
}

// ==================== Quote ====================
export async function getQuote(env: RuntimeContext): Promise<CachedQuote | null> {
  const db = getDb(env);
  const today = new Date().toISOString().split('T')[0];
  const rows = await db.select().from(dailyQuotes).where(eq(dailyQuotes.date, today)).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt, SEVEN_DAYS_MS)) return null;
  return { content: row.content, date: row.date };
}

export async function setQuote(env: RuntimeContext, content: string, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyQuotes).values({ content, date }).onConflictDoUpdate({
    target: dailyQuotes.date,
    set: { content, fetchedAt: new Date() },
  });
}

// ==================== History ====================
export async function getHistory(env: RuntimeContext): Promise<CachedHistory | null> {
  const db = getDb(env);
  const today = new Date().toISOString().split('T')[0];
  const rows = await db.select().from(dailyHistory).where(eq(dailyHistory.date, today)).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt, SEVEN_DAYS_MS)) return null;
  return { events: JSON.parse(row.events), date: row.date };
}

export async function setHistory(env: RuntimeContext, events: Array<{ year: string; title: string }>, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyHistory).values({ events: JSON.stringify(events), date }).onConflictDoUpdate({
    target: dailyHistory.date,
    set: { events: JSON.stringify(events), fetchedAt: new Date() },
  });
}

// ==================== News ====================
export async function getNews(env: RuntimeContext): Promise<CachedNews | null> {
  const db = getDb(env);
  const today = new Date().toISOString().split('T')[0];
  const rows = await db.select().from(dailyAiNews).where(eq(dailyAiNews.date, today)).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt, SEVEN_DAYS_MS)) return null;
  return { news: JSON.parse(row.news), date: row.date };
}

export async function setNews(env: RuntimeContext, news: Array<{ title: string; source?: string; url?: string }>, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyAiNews).values({ news: JSON.stringify(news), date }).onConflictDoUpdate({
    target: dailyAiNews.date,
    set: { news: JSON.stringify(news), fetchedAt: new Date() },
  });
}

// ==================== IT News ====================
export async function getItNews(env: RuntimeContext): Promise<CachedItNews | null> {
  const db = getDb(env);
  const today = new Date().toISOString().split('T')[0];
  const rows = await db.select().from(dailyItNews).where(eq(dailyItNews.date, today)).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt, SEVEN_DAYS_MS)) return null;
  return { news: JSON.parse(row.news) };
}

export async function setItNews(env: RuntimeContext, news: Array<{ title: string; description?: string; link: string }>, date: string): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyItNews).values({ news: JSON.stringify(news), date }).onConflictDoUpdate({
    target: dailyItNews.date,
    set: { news: JSON.stringify(news), fetchedAt: new Date() },
  });
}

// ==================== Hacker News ====================
export async function getHackerNews(env: RuntimeContext): Promise<CachedHackerNews | null> {
  const db = getDb(env);
  const rows = await db.select().from(dailyHackerNews).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  if (isExpired(row.fetchedAt, ONE_HOUR_MS)) return null;
  return { stories: JSON.parse(row.stories) };
}

export async function setHackerNews(env: RuntimeContext, stories: Array<{ id: number; title: string; url: string; score: number; by: string; time: string }>): Promise<void> {
  const db = getDb(env);
  await db.insert(dailyHackerNews).values({ id: 1, stories: JSON.stringify(stories) }).onConflictDoUpdate({
    target: dailyHackerNews.id,
    set: { stories: JSON.stringify(stories), fetchedAt: new Date() },
  });
}

// ==================== Cleanup ====================
export async function cleanExpired(env: RuntimeContext): Promise<void> {
  const db = getDb(env);
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);
  await db.delete(dailyQuotes).where(lt(dailyQuotes.fetchedAt, cutoff));
  await db.delete(dailyHistory).where(lt(dailyHistory.fetchedAt, cutoff));
  await db.delete(dailyAiNews).where(lt(dailyAiNews.fetchedAt, cutoff));
}
