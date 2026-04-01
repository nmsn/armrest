// apps/server/src/routes/60s/test.ts
import { Hono } from 'hono';
import { getQuote } from '../../services/daily-cache';
import { getHistory } from '../../services/daily-cache';
import { getNews } from '../../services/daily-cache';
import type { Env } from '../../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  // For local dev, use SQLite directly
  const isLocal = 'local' in c.env && (c.env as { local?: boolean }).local === true;
  const dbEnv = isLocal ? { local: true } as Env : c.env;

  const [quoteData, historyData, newsData] = await Promise.all([
    getQuote(dbEnv),
    getHistory(dbEnv),
    getNews(dbEnv),
  ]);

  const quoteHtml = quoteData
    ? `<blockquote>"${quoteData.content}"</blockquote>`
    : '<p>暂无一言数据</p>';

  const historyHtml = historyData?.events.length
    ? `<ul>${historyData.events.map(e => `<li><strong>${e.year}</strong> ${e.title}</li>`).join('')}</ul>`
    : '<p>暂无历史上的今天数据</p>';

  const newsHtml = newsData?.news.length
    ? `<ul>${newsData.news.map(n => `<li><a href="${n.url}" target="_blank">${n.title}</a> <span>${n.source}</span></li>`).join('')}</ul>`
    : '<p>暂无AI新闻数据</p>';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>60s 测试</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1 { text-align: center; color: #333; }
    section { margin-bottom: 32px; border: 1px solid #eee; border-radius: 8px; padding: 20px; }
    h2 { margin-top: 0; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    blockquote { font-size: 1.2em; text-align: center; margin: 0; padding: 16px; background: #f9f9f9; border-radius: 8px; }
    cite { display: block; margin-top: 8px; font-size: 0.85em; color: #888; font-style: normal; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    li strong { color: #e67e22; }
    span { color: #888; font-size: 0.85em; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .refresh { text-align: center; margin-top: 32px; }
    .refresh a { background: #3498db; color: #fff; padding: 10px 24px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>📅 60s 每日数据</h1>

  <section>
    <h2>💬 一言</h2>
    ${quoteHtml}
  </section>

  <section>
    <h2>📆 历史上的今天</h2>
    ${historyHtml}
  </section>

  <section>
    <h2>🤖 AI 科技新闻</h2>
    ${newsHtml}
  </section>

  <div class="refresh">
    <a href="/api/60s/test">🔄 刷新</a>
  </div>
</body>
</html>`;

  return c.html(html);
});

export { router as testRouter };
