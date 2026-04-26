import { createApp } from './app/create-app';
import type { AppEnv } from './app/types';

export default {
  async fetch(request: Request, env: AppEnv['Bindings'], ctx: ExecutionContext) {
    try {
      const app = createApp(env);
      return await app.fetch(request, env, ctx);
    } catch (err) {
      console.error('Unhandled error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};