import type { Schedule } from '@/api/schemas';

export type ScheduleStatus = 'upcoming' | 'live' | 'expired';

export function scheduleStatus(
  s: Pick<Schedule, 'startsAt' | 'endsAt'>,
  now: Date,
): ScheduleStatus {
  const t = now.toISOString();
  if (t < s.startsAt) return 'upcoming';
  if (t >= s.endsAt) return 'expired';
  return 'live';
}
