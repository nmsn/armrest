import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { translate, saveTranslation, getTodayTranslations } from '../../services/translation';
import type { AppEnv } from '../../app/types';
import { translateBodySchema } from './validators';

const router = new Hono<AppEnv>();

router.post('/', zValidator('json', translateBodySchema), async (c) => {
  const env = c.env;
  const userId = c.get('userId') || 'anonymous';
  const body = c.req.valid('json');

  const result = await translate(env, {
    text: body.text,
    from: body.from,
    to: body.to,
  });

  if (!result) {
    return c.json({ success: false, error: 'Translation failed' }, 500);
  }

  await saveTranslation(
    env,
    userId,
    result.source.text,
    result.source.type,
    result.source.typeDesc,
    result.source.pronounce,
    result.target.text,
    result.target.type,
    result.target.typeDesc,
    result.target.pronounce,
  );

  return c.json({ success: true, data: result });
});

router.get('/history', async (c) => {
  const env = c.env;
  const userId = c.get('userId') || 'anonymous';

  const rows = await getTodayTranslations(env, userId);
  return c.json({ success: true, data: rows });
});

export { router as translateRouter };
