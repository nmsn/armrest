import { eq, and, asc } from 'drizzle-orm';

import { getDb, schema } from '../db';

interface CreateBookmarkInput {
  userId: string;
  folderId: string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  color?: string;
  position?: number;
}

interface UpdateBookmarkInput {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  color?: string;
  position?: number;
  folderId?: string;
}

export class BookmarkService {
  constructor(private db: ReturnType<typeof getDb>) {}

  async list(userId: string) {
    return this.db.select().from(schema.bookmarks)
      .where(eq(schema.bookmarks.userId, userId))
      .orderBy(asc(schema.bookmarks.position));
  }

  async create(input: CreateBookmarkInput) {
    const id = crypto.randomUUID();
    const now = new Date();

    await this.db.insert(schema.bookmarks).values({
      id,
      userId: input.userId,
      folderId: input.folderId || null,
      name: input.name,
      url: input.url,
      logo: input.logo,
      description: input.description,
      color: input.color,
      position: input.position || 0,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  async update(id: string, userId: string, input: UpdateBookmarkInput) {
    await this.db.update(schema.bookmarks)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.userId, userId)));
  }

  async delete(id: string, userId: string) {
    await this.db.delete(schema.bookmarks)
      .where(and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.userId, userId)));
  }

  async sync(userId: string, bookmarks: Array<Omit<CreateBookmarkInput, 'userId'> & { id?: string }>) {
    await this.db.delete(schema.bookmarks).where(eq(schema.bookmarks.userId, userId));

    for (const bookmark of bookmarks) {
      await this.create({
        userId,
        folderId: bookmark.folderId,
        name: bookmark.name,
        url: bookmark.url,
        logo: bookmark.logo,
        description: bookmark.description,
        color: bookmark.color,
        position: bookmark.position,
      });
    }
  }
}
