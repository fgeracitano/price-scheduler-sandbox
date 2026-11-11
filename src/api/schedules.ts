import { del, getJson, postJson } from './http';
import { scheduleListSchema, scheduleSchema, type NewSchedule, type Schedule } from './schemas';

export function fetchSchedules(productId?: string): Promise<Schedule[]> {
  const qs = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  return getJson(`/schedules${qs}`, scheduleListSchema);
}

export function createSchedule(input: NewSchedule): Promise<Schedule> {
  return postJson('/schedules', input, scheduleSchema);
}

export function cancelSchedule(id: string): Promise<void> {
  return del(`/schedules/${encodeURIComponent(id)}`);
}
