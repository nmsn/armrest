import { Hono } from 'hono';
import { translate, saveTranslation, getTodayTranslations } from '../services/translation';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

router.post('/', async (c) => {
  const isLocal = !c.env.DB;
  const env = isLocal ? { local: true } as unknown as Env : c.env;
  const userId = c.get('userId') || 'anonymous';
  const body = await c.req.json<{ text?: string; from?: string; to?: string }>();

  if (!body.text) {
    return c.json({ success: false, error: 'text is required' }, 400);
  }

  const result = await translate(env, {
    text: body.text,
    from: body.from,
    to: body.to,
  });

  if (!result) {
    return c.json({ success: false, error: 'Translation failed' }, 500);
  }

  // 保存记录
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
  const isLocal = !c.env.DB;
  const env = isLocal ? { local: true } as unknown as Env : c.env;
  const userId = c.get('userId') || 'anonymous';

  const rows = await getTodayTranslations(env, userId);
  return c.json({ success: true, data: rows });
});

export { router as translateRouter };
