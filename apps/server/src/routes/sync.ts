import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

import { getDb } from '../db';
import { BookmarkService } from '../services/bookmark';
import type { Env } from '../index';

const syncSchema = z.object({
  bookmarks: z.array(z.object({
    id: z.string().optional(),
    folderId: z.string(),
    name: z.string().min(1),
    url: z.string().url(),
    logo: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    position: z.number().optional(),
  })),
});

type AppVariables = {
  userId: string;
};

const router = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// 挂载在 /api/bookmarks/sync，所以这里用 /
router.post('/', zValidator('json', syncSchema), async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = getDb({ DB: c.env.DB });
  const service = new BookmarkService(db);

  await service.sync(userId, body.bookmarks);
  return c.json({ success: true });
});

export { router as syncRouter };