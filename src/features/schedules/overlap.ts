import type { Schedule } from '@/api/schemas';

export interface TimeWindow {
  startsAt: string;
  endsAt: string;
}

/** True when two scheduling windows share any instant. */
export function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  return a.startsAt <= b.endsAt && b.startsAt <= a.endsAt;
}

/** First existing schedule for the same product whose window overlaps the candidate. */
export function findConflict(
  candidate: TimeWindow & { productId: string },
  existing: readonly Schedule[],
): Schedule | undefined {
  return existing.find((s) => s.productId === candidate.productId && overlaps(s, candidate));
}
