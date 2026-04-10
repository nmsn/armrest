import { eq, and, gte } from 'drizzle-orm';
import { getDb } from '../db';
import { translations } from '../db/schema';
import type { RuntimeContext } from './runtime-context';

export async function callFreeDictionaryAPI(word: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    if (!response.ok) return null;
    return await response.json() as Record<string, unknown>;
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

async function call60sAPI(
  text: string,
  from: string,
  to: string,
  encoding?: string,
): Promise<RawTranslateResult | null> {
  const normalizedFrom = languageCodeMap[from] || from;
  const normalizedTo = languageCodeMap[to] || to;

  const params = new URLSearchParams({ text, from: normalizedFrom, to: normalizedTo });
  if (encoding) params.set('encoding', encoding);

  const response = await fetch(`https://60s.viki.moe/v2/fanyi?${params}`);
  if (!response.ok) return null;

  const result = (await response.json()) as { code: number; data?: RawTranslateResult };
  if (result.code === 200 && result.data) {
    return result.data;
  }
  return null;
}

export async function translate(
  env: RuntimeContext,
  options: TranslateOptions,
): Promise<TranslateResult | null> {
  const { text, from = 'auto', to = 'auto', encoding } = options;

  const data = await call60sAPI(text, from, to, encoding);
  if (!data) return null;

  return {
    source: {
      text: data.source.text,
      type: data.source.type,
      typeDesc: data.source.type_desc,
      pronounce: data.source.pronounce,
    },
    target: {
      text: data.target.text,
      type: data.target.type,
      typeDesc: data.target.type_desc,
      pronounce: data.target.pronounce,
    },
  };
}

export async function saveTranslation(
  env: RuntimeContext,
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
  const rows = await db.insert(translations).values({
    userId,
    sourceText,
    sourceType,
    sourceTypeDesc,
    sourcePronounce,
    targetText,
    targetType,
    targetTypeDesc,
    targetPronounce,
  }).returning();
  return rows[0].id;
}

export async function getTodayTranslations(env: RuntimeContext, userId: string) {
  const db = getDb(env);
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
