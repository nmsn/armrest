import { eq, and, gte } from 'drizzle-orm';
import { getDb } from '../db';
import { translations } from '../db/schema';
import type { Env } from '../index';

export async function callFreeDictionaryAPI(word: string): Promise<Record<string, any> | null> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    if (!response.ok) return null;
    return await response.json() as Record<string, any>;
  } catch {
    return null;
  }
}

interface TranslateOptions {
  text: string;
  from?: string;
  to?: string;
  encoding?: string;
}

interface TranslateResult {
  source: {
    text: string;
    type: string;
    typeDesc: string;
    pronounce: string;
  };
  target: {
    text: string;
    type: string;
    typeDesc: string;
    pronounce: string;
  };
  dictionaryData: Record<string, any> | null;
}

interface RawTranslateResult {
  source: {
    text: string;
    type: string;
    type_desc: string;
    pronounce: string;
  };
  target: {
    text: string;
    type: string;
    type_desc: string;
    pronounce: string;
  };
}

// Map common language codes to API-supported codes
const languageCodeMap: Record<string, string> = {
  zh: 'zh-CHS',
  'zh-Hant': 'zh-CHT',
};

export async function translate(
  env: Env,
  options: TranslateOptions,
): Promise<TranslateResult | null> {
  const { text, from = 'auto', to = 'auto', encoding } = options;

  // Normalize language codes to API-supported values
  const normalizedFrom = languageCodeMap[from] || from;
  const normalizedTo = languageCodeMap[to] || to;

  const params = new URLSearchParams({ text, from: normalizedFrom, to: normalizedTo });
  if (encoding) params.set('encoding', encoding);

  try {
    const response = await fetch(`https://60s.viki.moe/v2/fanyi?${params}`);
    if (!response.ok) return null;

    const result = (await response.json()) as { code: number; data?: RawTranslateResult };
    if (result.code === 200 && result.data) {
      // Call FreeDictionary API to get pronunciation data
      const freeDictData = await callFreeDictionaryAPI(text);

      // Extract phonetic from FreeDict response if available
      let pronounce = result.data.source.pronounce;
      if (freeDictData && Array.isArray(freeDictData) && freeDictData.length > 0) {
        const entry = freeDictData[0];
        // Use phonetic field if available, otherwise find first phonetic with text
        const phonetic = entry.phonetic || (entry.phonetics?.find(p => p.text)?.text);
        if (phonetic) {
          pronounce = phonetic;
        }
      }

      // Map snake_case to camelCase
      return {
        source: {
          text: result.data.source.text,
          type: result.data.source.type,
          typeDesc: result.data.source.type_desc,
          pronounce: pronounce,
        },
        target: {
          text: result.data.target.text,
          type: result.data.target.type,
          typeDesc: result.data.target.type_desc,
          pronounce: result.data.target.pronounce,
        },
        dictionaryData: freeDictData,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveTranslation(
  env: Env,
  userId: string,
  sourceText: string,
  sourceType: string,
  sourceTypeDesc: string | null,
  sourcePronounce: string | null,
  targetText: string,
  targetType: string,
  targetTypeDesc: string | null,
  targetPronounce: string | null,
): Promise<number> {
  const db = getDb(env);
  const rows = await (db.insert(translations).values({
    userId,
    sourceText,
    sourceType,
    sourceTypeDesc,
    sourcePronounce,
    targetText,
    targetType,
    targetTypeDesc,
    targetPronounce,
  }) as any).returning({ id: translations.id });
  return rows[0].id;
}

export async function getTodayTranslations(env: Env, userId: string) {
  const db = getDb(env) as any;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      id: translations.id,
      sourceText: translations.sourceText,
      sourceType: translations.sourceType,
      sourceTypeDesc: translations.sourceTypeDesc,
      sourcePronounce: translations.sourcePronounce,
      targetText: translations.targetText,
      targetType: translations.targetType,
      targetTypeDesc: translations.targetTypeDesc,
      targetPronounce: translations.targetPronounce,
      createdAt: translations.createdAt,
    })
    .from(translations)
    .where(and(
      eq(translations.userId, userId),
      gte(translations.createdAt, today),
    ))
    .orderBy(translations.createdAt);

  return rows;
}
