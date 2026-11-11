import type { Category, Product, Schedule } from '../src/api/schemas';
import { CATEGORIES } from '../src/api/schemas';

/** Small deterministic PRNG so every run gets the same catalog. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BRANDS = [
  'Northfield',
  'Atelier Rowe',
  'Calder & Finch',
  'Maison Lune',
  'Ostra',
  'Vale Studio',
  'Harrow & Co',
  'Pellam',
];

const CATALOG: Record<
  Category,
  { materials: string[]; items: string[]; priceRange: [number, number] }
> = {
  Boots: {
    materials: ['Leather', 'Suede', 'Waxed Leather', 'Shearling-Lined'],
    items: ['Chelsea Boot', 'Combat Boot', 'Hiking Boot', 'Ankle Boot', 'Knee-High Boot'],
    priceRange: [120, 480],
  },
  Sneakers: {
    materials: ['Leather', 'Suede', 'Canvas', 'Mesh'],
    items: ['Court Sneaker', 'Runner', 'High-Top', 'Slip-On', 'Trail Runner'],
    priceRange: [60, 260],
  },
  Bags: {
    materials: ['Leather', 'Canvas', 'Nylon', 'Pebbled Leather'],
    items: ['Tote', 'Crossbody', 'Weekender', 'Backpack', 'Belt Bag'],
    priceRange: [45, 900],
  },
  Outerwear: {
    materials: ['Wool', 'Cotton', 'Down', 'Waxed Cotton'],
    items: ['Trench Coat', 'Puffer Jacket', 'Overcoat', 'Field Jacket', 'Parka'],
    priceRange: [150, 1200],
  },
  Knitwear: {
    materials: ['Merino', 'Cashmere', 'Lambswool', 'Cotton'],
    items: ['Crewneck Sweater', 'Cardigan', 'Turtleneck', 'Cable Knit', 'Quarter Zip'],
    priceRange: [29, 380],
  },
  Accessories: {
    materials: ['Leather', 'Cashmere', 'Wool', 'Silk'],
    items: ['Scarf', 'Belt', 'Beanie', 'Gloves', 'Card Holder'],
    priceRange: [19, 220],
  },
};

const ENDINGS = [0, 0, 99, 99, 99, 50];

export function seedProducts(count = 200): Product[] {
  const rand = mulberry32(42);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)] as T;

  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[i % CATEGORIES.length] as Category;
    const { materials, items, priceRange } = CATALOG[category];
    const [min, max] = priceRange;
    const dollars = Math.floor(min + rand() * (max - min));
    const ending = pick(ENDINGS);
    const priceCents = ending === 0 ? dollars * 100 : dollars * 100 + ending;
    const n = String(i + 1).padStart(3, '0');
    return {
      id: `p_${n}`,
      sku: `${category.slice(0, 3).toUpperCase()}-${1000 + i}`,
      name: `${pick(materials)} ${pick(items)}`,
      brand: pick(BRANDS),
      category,
      priceCents,
      livePriceCents: null,
      stock: Math.floor(rand() * 400),
    };
  });
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function seedSchedules(products: Product[], now = Date.now()): Schedule[] {
  const hour = Math.floor(now / HOUR) * HOUR;
  const iso = (ms: number) => new Date(ms).toISOString();
  const make = (
    id: string,
    product: Product,
    pct: number,
    start: number,
    end: number,
    note?: string,
  ): Schedule => ({
    id,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    previousPriceCents: product.priceCents,
    newPriceCents: Math.round((product.priceCents * (100 - pct)) / 100),
    startsAt: iso(start),
    endsAt: iso(end),
    note,
    createdAt: iso(hour - 10 * DAY),
  });

  const at = (i: number) => products[i] as Product;
  return [
    make('s_001', at(0), 20, hour - 1 * DAY, hour + 3 * DAY, 'Boot week'),
    make('s_002', at(7), 15, hour - 6 * HOUR, hour + 2 * DAY),
    make('s_003', at(13), 30, hour + 2 * DAY, hour + 5 * DAY, 'Weekend flash sale'),
    make('s_004', at(2), 25, hour + 4 * DAY, hour + 11 * DAY),
    make('s_005', at(21), 40, hour - 9 * DAY, hour - 2 * DAY, 'Clearance'),
  ];
}
