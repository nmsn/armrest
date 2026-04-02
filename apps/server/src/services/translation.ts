import { eq, and, gte } from 'drizzle-orm';
import { getDb } from '../db';
import { translations } from '../db/schema';
import type { Env } from '../index';

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

export async function translate(
  env: Env,
  options: TranslateOptions,
): Promise<TranslateResult | null> {
  const { text, from = 'auto', to = 'auto', encoding } = options;

  const params = new URLSearchParams({ text, from, to });
  if (encoding) params.set('encoding', encoding);

  try {
    const response = await fetch(`https://60s.viki.moe/v2/fanyi?${params}`);
    if (!response.ok) return null;

    const result = (await response.json()) as { code: number; data?: TranslateResult };
    if (result.code === 200 && result.data) return result.data;
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
