/**
 * Merchandisers schedule in store time regardless of where they are.
 * Instants are stored and sent as UTC ISO-8601 strings.
 */
export const STORE_TIME_ZONE = 'America/New_York';

/** Converts the date ("YYYY-MM-DD") and time ("HH:mm") entered in the form into a UTC instant. */
export function toInstant(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

const storeDateTime = new Intl.DateTimeFormat('en-US', {
  timeZone: STORE_TIME_ZONE,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const storeDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: STORE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** e.g. "Sat, Nov 14, 9:00 AM ET" */
export function formatStoreTime(iso: string): string {
  return `${storeDateTime.format(new Date(iso))} ET`;
}

/** Today's date in store time as "YYYY-MM-DD", for date input defaults. */
export function storeToday(now: Date = new Date()): string {
  return storeDate.format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
