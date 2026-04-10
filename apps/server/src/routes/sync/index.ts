import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { getDb } from '../../db';
import { BookmarkService } from '../../services/bookmark';
import type { AppEnv } from '../../app/types';
import { syncBodySchema } from './validators';

const router = new Hono<AppEnv>();

router.post('/', zValidator('json', syncBodySchema), async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = c.req.valid('json');
  const db = getDb(c.env);
  const service = new BookmarkService(db);

  await service.sync(userId, body.bookmarks);
  return c.json({ success: true });
});

export { router as syncRouter };
