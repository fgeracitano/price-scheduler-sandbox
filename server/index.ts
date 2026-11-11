import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { app } from './app';
import { config } from './config';

const PORT = Number(process.env.API_PORT ?? 4100);

const root = new Hono().use(logger()).route('/', app);

serve({ fetch: root.fetch, port: PORT }, ({ port }) => {
  console.log(
    `API listening on http://localhost:${port}/api ` +
      `(latency ${config.latency.join('–')} ms, failure rate ${config.failureRate})`,
  );
});
