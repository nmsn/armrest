// apps/server/src/routes/60s/index.ts
import { Hono } from 'hono';

import { weatherRouter } from './weather';
import { quoteRouter } from './quote';
import { historyRouter } from './history';
import { aiNewsRouter } from './ai-news';
import { itNewsRouter } from './it-news';
import { hackerNewsRouter } from './hacker-news';
import { bingRouter } from './bing';
import { testRouter } from './test';

const sixtyRouter = new Hono();

sixtyRouter.route('/weather', weatherRouter);
sixtyRouter.route('/quote', quoteRouter);
sixtyRouter.route('/history', historyRouter);
sixtyRouter.route('/ai-news', aiNewsRouter);
sixtyRouter.route('/it-news', itNewsRouter);
sixtyRouter.route('/hacker-news', hackerNewsRouter);
sixtyRouter.route('/bing', bingRouter);
sixtyRouter.route('/test', testRouter);

export { sixtyRouter };