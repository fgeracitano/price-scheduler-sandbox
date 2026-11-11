import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { config } from '../../server/config';
import { resetDb } from '../../server/db';
import { server } from './server';

// Keep date assertions stable across developer machines and CI.
process.env.TZ = 'America/New_York';

config.latency = [0, 0];
config.failureRate = 0;

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
});
afterAll(() => server.close());
