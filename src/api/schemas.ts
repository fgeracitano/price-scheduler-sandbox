import { z } from 'zod';

export const CATEGORIES = [
  'Boots',
  'Sneakers',
  'Bags',
  'Outerwear',
  'Knitwear',
  'Accessories',
] as const;

export const categorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof categorySchema>;

const cents = z.number().int();

export const productSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  brand: z.string(),
  category: categorySchema,
  priceCents: cents.positive(),
  /** Price currently in effect if a scheduled change is live, otherwise null. */
  livePriceCents: cents.nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
});
export type Product = z.infer<typeof productSchema>;

export const productListSchema = z.object({
  items: z.array(productSchema),
  total: z.number().int(),
});
export type ProductList = z.infer<typeof productListSchema>;

export const scheduleSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  sku: z.string(),
  previousPriceCents: cents.positive(),
  newPriceCents: cents.nonnegative(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  note: z.string().max(200).optional(),
  createdAt: z.iso.datetime(),
});
export type Schedule = z.infer<typeof scheduleSchema>;

export const scheduleListSchema = z.array(scheduleSchema);

export const newScheduleSchema = scheduleSchema
  .pick({ productId: true, newPriceCents: true, startsAt: true, endsAt: true, note: true })
  .refine((s) => s.endsAt > s.startsAt, { message: 'endsAt must be after startsAt' });
export type NewSchedule = z.infer<typeof newScheduleSchema>;
