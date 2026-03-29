import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getDb } from '../db';
import { BookmarkService } from '../services/bookmark';
import type { Env } from '../index';

const bookmarkSchema = z.object({
  folderId: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  logo: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  position: z.number().optional(),
});

const router = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

router.get('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);
  const bookmarks = await service.list(userId);
  return c.json(bookmarks);
});

router.post('/', zValidator('json', bookmarkSchema), async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);

  const id = await service.create({ userId, ...body });
  return c.json({ id, ...body });
});

router.put('/:id', zValidator('json', bookmarkSchema.partial()), async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const body = c.req.valid('json');

  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);
  await service.update(id, userId, body);

  return c.json({ success: true });
});

router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);
  await service.delete(id, userId);

  return c.json({ success: true });
});

export { router as bookmarksRouter };