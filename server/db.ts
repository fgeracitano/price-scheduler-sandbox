import type { Product, Schedule } from '../src/api/schemas';
import { seedProducts, seedSchedules } from './seed';

/** In-memory data store. Lives as long as the server process. */
export interface Db {
  products: Product[];
  schedules: Schedule[];
}

export const db: Db = createDb();

export function createDb(): Db {
  const products = seedProducts();
  return { products, schedules: seedSchedules(products) };
}

export function resetDb(): void {
  Object.assign(db, createDb());
}
