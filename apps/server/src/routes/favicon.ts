import { Hono } from 'hono';

const router = new Hono();

router.get('/favicon', async (c) => {
  const url = c.req.query('url');
  const size = c.req.query('size') || '32';

  if (!url) {
    return c.json({ data: null, error: 'Missing required parameter: url' }, 400);
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return c.json({ data: null, error: 'Invalid URL' }, 400);
  }

  const parsedSize = parseInt(size, 10);
  if (isNaN(parsedSize) || parsedSize < 1 || parsedSize > 512) {
    return c.json({ data: null, error: 'Invalid size: must be between 1 and 512' }, 400);
  }

  const start = Date.now();
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${parsedSize}`;

    const duration = Date.now() - start;
    console.log(`[favicon] GET /favicon?url=${url}&size=${size} → 200 (${duration}ms)`);

    return c.json({
      data: { favicon: faviconUrl },
      error: null,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[favicon] GET /favicon?url=${url}&size=${size} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as faviconRouter };