import { createApp } from './app/create-app';
import type { AppEnv } from './app/types';

export default {
  async fetch(request: Request, env: AppEnv['Bindings'], ctx: ExecutionContext) {
    const app = createApp(env);
    return app.fetch(request, { Bindings: env });
  }
};