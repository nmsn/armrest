import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  githubId: text('github_id').unique(),
  email: text('email'),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmarks),
  folders: many(folders),
}));

export const folders = sqliteTable('folders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').default('folder'),
  color: text('color').default('#6366F1'),
  position: integer('position').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
  bookmarks: many(bookmarks),
}));

export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  folderId: text('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  logo: text('logo'),
  description: text('description'),
  color: text('color').default('#6366F1'),
  position: integer('position').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  folder: one(folders, {
    fields: [bookmarks.folderId],
    references: [folders.id],
  }),
}));

// 一言缓存
export const dailyQuotes = sqliteTable('daily_quotes', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  date: text('date').notNull().unique(), // YYYY-MM-DD
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// 历史上的今天缓存
export const dailyHistory = sqliteTable('daily_history', {
  id: integer('id').primaryKey(),
  events: text('events').notNull(), // JSON string
  date: text('date').notNull().unique(), // YYYY-MM-DD
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// AI 新闻缓存
export const dailyAiNews = sqliteTable('daily_ai_news', {
  id: integer('id').primaryKey(),
  news: text('news').notNull(), // JSON string
  date: text('date').notNull().unique(), // YYYY-MM-DD
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// IT 资讯缓存
export const dailyItNews = sqliteTable('daily_it_news', {
  id: integer('id').primaryKey(),
  news: text('news').notNull(), // JSON string
  date: text('date').notNull().unique(), // YYYY-MM-DD
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Hacker News 热帖缓存
export const dailyHackerNews = sqliteTable('daily_hacker_news', {
  id: integer('id').primaryKey().default(1), // singleton: always id=1
  stories: text('stories').notNull(), // JSON string
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// 翻译记录
export const translations = sqliteTable('translations', {
  id: integer('id').primaryKey(),
  userId: text('user_id').notNull(),
  sourceText: text('source_text').notNull(),
  sourceType: text('source_type').notNull(),
  sourceTypeDesc: text('source_type_desc'),
  sourcePronounce: text('source_pronounce'),
  targetText: text('target_text').notNull(),
  targetType: text('target_type').notNull(),
  targetTypeDesc: text('target_type_desc'),
  targetPronounce: text('target_pronounce'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type DailyQuote = typeof dailyQuotes.$inferSelect;
export type NewDailyQuote = typeof dailyQuotes.$inferInsert;
export type DailyHistory = typeof dailyHistory.$inferSelect;
export type NewDailyHistory = typeof dailyHistory.$inferInsert;
export type DailyAiNews = typeof dailyAiNews.$inferSelect;
export type NewDailyAiNews = typeof dailyAiNews.$inferInsert;
export type DailyItNews = typeof dailyItNews.$inferSelect;
export type NewDailyItNews = typeof dailyItNews.$inferInsert;
export type DailyHackerNews = typeof dailyHackerNews.$inferSelect;
export type NewDailyHackerNews = typeof dailyHackerNews.$inferInsert;
export type Translation = typeof translations.$inferSelect;
export type NewTranslation = typeof translations.$inferInsert;