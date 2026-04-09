import { Hono } from 'hono';
import type { Env } from '../index';

const router = new Hono<{ Bindings: Env }>();

interface DictionaryResult {
  word: string;
  phonetic: string;
  phoneticAudio: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

router.post('/', async (c) => {
  const body = await c.req.json<{ word?: string }>();

  // 输入校验
  if (!body.word || typeof body.word !== 'string') {
    return c.json({ success: false, error: '无效输入' }, 400);
  }

  const word = body.word.trim();
  const WORD_REGEX = /^[a-zA-Z][a-zA-Z'-]{0,49}$/;

  if (!WORD_REGEX.test(word)) {
    return c.json({ success: false, error: '无效输入' }, 400);
  }

  // 调用 Free Dictionary API
  const encodedWord = encodeURIComponent(word.toLowerCase());
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodedWord}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 404) {
        return c.json({ success: false, error: '单词未找到' }, 404);
      }
      return c.json({ success: false, error: '外部 API 错误' }, 502);
    }

    const data = await response.json();

    // API 返回是数组，取第一个
    if (!Array.isArray(data) || data.length === 0) {
      return c.json({ success: false, error: '单词未找到' }, 404);
    }

    const entry = data[0];

    // 校验 meanings
    if (!entry.meanings || !Array.isArray(entry.meanings) || entry.meanings.length === 0) {
      return c.json({ success: false, error: '该单词暂无释义' }, 200);
    }

    // 校验 meanings[].definitions
    const hasValidMeanings = entry.meanings.some(
      (m: any) => m.definitions && Array.isArray(m.definitions) && m.definitions.length > 0
    );
    if (!hasValidMeanings) {
      return c.json({ success: false, error: '该单词暂无释义' }, 200);
    }

    // 提取数据
    const phonetic = entry.phonetic || '';
    const phoneticAudio = entry.phonetics
      ?.find((p: any) => p.audio && p.audio.length > 0)
      ?.audio || '';

    const result: DictionaryResult = {
      word: entry.word,
      phonetic,
      phoneticAudio,
      meanings: entry.meanings.map((m: any) => ({
        partOfSpeech: m.partOfSpeech || '',
        definitions: (m.definitions || []).slice(0, 2).map((d: any) => ({
          definition: d.definition || '',
          example: d.example || undefined,
        })),
      })),
    };

    return c.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return c.json({ success: false, error: '网络超时' }, 500);
    }
    return c.json({ success: false, error: '网络错误' }, 500);
  }
});

export { router as dictionaryRouter };