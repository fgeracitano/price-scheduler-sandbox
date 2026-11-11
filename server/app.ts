import { Hono } from 'hono';
import { categorySchema, newScheduleSchema, type Schedule } from '../src/api/schemas';
import { findConflict } from '../src/features/schedules/overlap';
import { scheduleStatus } from '../src/features/schedules/status';
import { config } from './config';
import { db } from './db';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function livePrice(productId: string, now: Date): number | null {
  const live = db.schedules.find(
    (s) => s.productId === productId && scheduleStatus(s, now) === 'live',
  );
  return live ? live.newPriceCents : null;
}

export const app = new Hono().basePath('/api');

// Simulated network latency.
app.use('*', async (_c, next) => {
  const [min, max] = config.latency;
  if (max > 0) await sleep(Math.round(min + Math.random() * (max - min)));
  await next();
});

// Simulated transient failures on writes.
app.use('*', async (c, next) => {
  if (c.req.method !== 'GET' && Math.random() < config.failureRate) {
    return c.json({ message: 'Service temporarily unavailable' }, 503);
  }
  await next();
});

app.get('/products', (c) => {
  const q = c.req.query('q')?.trim().toLowerCase() ?? '';
  const category = categorySchema.safeParse(c.req.query('category'));
  const now = new Date();

  const items = db.products
    .filter((p) => !category.success || p.category === category.data)
    .filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    )
    .map((p) => ({ ...p, livePriceCents: livePrice(p.id, now) }));

  return c.json({ items, total: items.length });
});

app.get('/schedules', (c) => {
  const productId = c.req.query('productId');
  const items = db.schedules
    .filter((s) => !productId || s.productId === productId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return c.json(items);
});

app.post('/schedules', async (c) => {
  const parsed = newScheduleSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ message: 'Invalid schedule', issues: parsed.error.issues }, 400);
  }
  const input = parsed.data;
  const product = db.products.find((p) => p.id === input.productId);
  if (!product) return c.json({ message: 'Product not found' }, 404);

  const conflict = findConflict(input, db.schedules);
  if (conflict) {
    return c.json({ message: `Overlaps with scheduled change ${conflict.id}` }, 409);
  }

  const schedule: Schedule = {
    id: `s_${crypto.randomUUID().slice(0, 8)}`,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    previousPriceCents: product.priceCents,
    newPriceCents: input.newPriceCents,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    note: input.note,
    createdAt: new Date().toISOString(),
  };
  db.schedules.push(schedule);
  return c.json(schedule, 201);
});

app.delete('/schedules/:id', (c) => {
  const index = db.schedules.findIndex((s) => s.id === c.req.param('id'));
  if (index === -1) return c.json({ message: 'Schedule not found' }, 404);
  db.schedules.splice(index, 1);
  return c.body(null, 204);
});
