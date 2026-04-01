// apps/server/src/routes/60s/test.ts
import { Hono } from 'hono';
import { getQuote } from '../../services/daily-cache';
import { getHistory } from '../../services/daily-cache';
import { getNews } from '../../services/daily-cache';
import { translate, saveTranslation, getTodayTranslations } from '../../services/translation';
import type { Env } from '../../index';

const router = new Hono<{ Bindings: Env }>();

router.get('/', async (c) => {
  // For local dev (no DB binding), use SQLite directly
  const isLocal = !c.env.DB;
  const dbEnv = isLocal ? { local: true } as unknown as Env : c.env;

  const [quoteData, historyData, newsData, translationHistory] = await Promise.all([
    getQuote(dbEnv),
    getHistory(dbEnv),
    getNews(dbEnv),
    getTodayTranslations(dbEnv, 'local-user'),
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

  const translationHistoryHtml = translationHistory.length
    ? `<ul>${translationHistory.map(t => `<li><strong>${t.sourceText}</strong> → ${t.targetText} <span>(${t.sourceType} → ${t.targetType})</span></li>`).join('')}</ul>`
    : '<p>暂无翻译记录</p>';

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
    .refresh { text-align: center; margin-top: 32px; display: flex; gap: 12px; justify-content: center; align-items: center; }
    .refresh a, .refresh button { background: #3498db; color: #fff; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .refresh button:disabled { background: #aaa; cursor: not-allowed; }
    #status { text-align: center; margin-top: 16px; min-height: 24px; font-size: 14px; }
    /* translation */
    .translate-form { display: flex; gap: 8px; margin-bottom: 16px; }
    .translate-form input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .translate-form select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .translate-form button { background: #27ae60; }
    .translate-result { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-top: 12px; }
    .translate-result .source { margin-bottom: 8px; }
    .translate-result .target { font-size: 1.2em; font-weight: bold; color: #27ae60; }
    .translate-result .pronounce { font-size: 0.85em; color: #888; margin-top: 4px; }
    .history-list { max-height: 200px; overflow-y: auto; }
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

  <section>
    <h2>🌐 翻译</h2>
    <div class="translate-form">
      <input type="text" id="translateInput" placeholder="输入要翻译的文本..." value="hello" />
      <select id="fromLang"><option value="auto">自动</option></select>
      <span>→</span>
      <select id="toLang"><option value="zh-CHS">中文</option><option value="en">英语</option><option value="ja">日语</option><option value="ko">韩语</option><option value="fr">法语</option><option value="de">德语</option></select>
      <button id="translateBtn">翻译</button>
    </div>
    <div id="translateResult"></div>
    <div id="translateStatus"></div>
  </section>

  <section>
    <h2>📝 翻译历史（今日）</h2>
    <div class="history-list">${translationHistoryHtml}</div>
  </section>

  <div class="refresh">
    <button id="fetchBtn">📥 拉取并写入数据库</button>
    <a href="/api/60s/test">🔄 刷新</a>
  </div>
  <div id="status"></div>
  <script>
    // Translation
    document.getElementById('translateBtn').addEventListener('click', async () => {
      const text = document.getElementById('translateInput').value.trim();
      const from = document.getElementById('fromLang').value;
      const to = document.getElementById('toLang').value;
      const resultDiv = document.getElementById('translateResult');
      const statusDiv = document.getElementById('translateStatus');

      if (!text) {
        statusDiv.textContent = '请输入要翻译的文本';
        statusDiv.style.color = 'red';
        return;
      }

      const btn = document.getElementById('translateBtn');
      btn.disabled = true;
      btn.textContent = '翻译中...';
      statusDiv.textContent = '';
      resultDiv.innerHTML = '';

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, from, to }),
        });
        const result = await res.json();

        if (result.success) {
          const s = result.data.source;
          const t = result.data.target;
          const sPronounce = s.pronounce ? '<div class="pronounce">发音: ' + s.pronounce + '</div>' : '';
          const tPronounce = t.pronounce ? '<div class="pronounce">发音: ' + t.pronounce + '</div>' : '';
          resultDiv.innerHTML = '<div class="translate-result">' +
            '<div class="source">原文: ' + s.text + ' <span>(' + (s.typeDesc || s.type) + ')</span>' + sPronounce + '</div>' +
            '<div class="target">译文: ' + t.text + ' <span>(' + (t.typeDesc || t.type) + ')</span>' + tPronounce + '</div>' +
            '</div>';
          statusDiv.textContent = '✅ 翻译成功';
          statusDiv.style.color = 'green';
          // Reload page to update history
          setTimeout(() => location.reload(), 1000);
        } else {
          statusDiv.textContent = '❌ 翻译失败: ' + result.error;
          statusDiv.style.color = 'red';
        }
      } catch (e) {
        statusDiv.textContent = '❌ 请求失败: ' + e;
        statusDiv.style.color = 'red';
      } finally {
        btn.disabled = false;
        btn.textContent = '翻译';
      }
    });

    // Enter key to translate
    document.getElementById('translateInput').addEventListener('keypress', e => {
      if (e.key === 'Enter') document.getElementById('translateBtn').click();
    });

    // Fetch 60s data
    document.getElementById('fetchBtn').addEventListener('click', async () => {
      const btn = document.getElementById('fetchBtn');
      const status = document.getElementById('status');
      btn.disabled = true;
      btn.textContent = '写入中...';
      status.textContent = '';
      try {
        const res = await fetch('/internal/cron/fetch', { method: 'POST' });
        const result = await res.json();
        if (result.success) {
          status.textContent = '✅ 写入成功，耗时 ' + result.duration + 'ms';
          status.style.color = 'green';
          location.reload();
        } else {
          status.textContent = '❌ 写入失败: ' + result.error;
          status.style.color = 'red';
          btn.disabled = false;
          btn.textContent = '📥 拉取并写入数据库';
        }
      } catch (e) {
        status.textContent = '❌ 请求失败: ' + e;
        status.style.color = 'red';
        btn.disabled = false;
        btn.textContent = '📥 拉取并写入数据库';
      }
    });
  </script>
</body>
</html>`;

  return c.html(html);
});

export { router as testRouter };
