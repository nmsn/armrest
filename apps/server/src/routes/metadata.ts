import { Hono } from 'hono';

interface MicrolinkResponse {
  status?: string;
  data?: {
    title?: string;
    description?: string;
    image?: { url?: string };
    logo?: { url?: string };
    favicon?: { url?: string };
  };
}

interface AllOriginsResponse {
  contents?: string;
}

const router = new Hono();

router.get('/metadata', async (c) => {
  const url = c.req.query('url');

  if (!url) {
    return c.json({ data: null, error: 'Missing required parameter: url' }, 400);
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return c.json({ data: null, error: 'Invalid URL' }, 400);
  }

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const start = Date.now();

  try {
    // Fetch from both sources in parallel
    const [proxyResponse, microlinkResponse] = await Promise.all([
      fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`),
      fetch(`https://api.microlink.io?url=${encodeURIComponent(normalizedUrl)}&palette=true`),
    ]);

    const duration = Date.now() - start;
    console.log(`[metadata] GET /metadata?url=${url} → 200 (${duration}ms)`);

    let title = '';
    let description = '';
    let image = '';
    let logo = '';
    let favicon = '';

    // Parse Microlink response (takes priority)
    if (microlinkResponse.ok) {
      const microlinkData = await microlinkResponse.json() as MicrolinkResponse;
      if (microlinkData.status === 'success' && microlinkData.data) {
        const { title: t, description: d, image: img, logo: l, favicon: f } = microlinkData.data;
        title = t || '';
        description = d || '';
        image = img?.url || '';
        logo = l?.url || '';
        favicon = f?.url || '';
      }
    }

    // Parse AllOrigins response (fallback for missing fields)
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json() as AllOriginsResponse;
      if (proxyData.contents) {
        // AllOrigins doesn't parse HTML in Workers, so we can't extract metadata from it
        // This is a limitation - in practice, Microlink alone may be sufficient
        // We'll keep this as a placeholder for future enhancement
      }
    }

    // Extract domain for fallback title
    try {
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname.replace(/^www\./, '');
      if (!title) {
        title = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    } catch {
      // ignore
    }

    return c.json({
      data: {
        title,
        description,
        image,
        logo,
        favicon,
      },
      error: null,
    });
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`[metadata] GET /metadata?url=${url} → 500 (${duration}ms) ${err}`);
    return c.json({ data: null, error: String(err) });
  }
});

export { router as metadataRouter };