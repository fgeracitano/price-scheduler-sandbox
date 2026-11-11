import { addDays, formatStoreTime, storeToday, toInstant } from './time';

describe('toInstant', () => {
  it('converts store time to UTC in winter (EST, UTC-5)', () => {
    expect(toInstant('2026-11-14', '09:00')).toBe('2026-11-14T14:00:00.000Z');
  });

  it('converts store time to UTC in summer (EDT, UTC-4)', () => {
    expect(toInstant('2026-07-04', '09:00')).toBe('2026-07-04T13:00:00.000Z');
  });
});

describe('formatStoreTime', () => {
  it('formats an instant in store time', () => {
    expect(formatStoreTime('2026-11-14T14:00:00.000Z')).toBe('Sat, Nov 14, 9:00 AM ET');
  });
});

describe('storeToday', () => {
  it('uses the store date, not UTC', () => {
    expect(storeToday(new Date('2026-11-15T03:00:00.000Z'))).toBe('2026-11-14');
  });
});

describe('addDays', () => {
  it('crosses month boundaries', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
  });
});
