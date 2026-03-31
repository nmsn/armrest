import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { github } from 'better-auth/social-providers';

import { getDb } from '../db';

interface AuthEnv {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  NODE_ENV: string;
}

export function createAuth(env: AuthEnv) {
  const db = getDb(env);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://api.example.com',
  });
}

export type Auth = ReturnType<typeof createAuth>;