import { scheduleStatus } from './status';

const s = { startsAt: '2026-11-14T14:00:00.000Z', endsAt: '2026-11-16T14:00:00.000Z' };

describe('scheduleStatus', () => {
  it('is upcoming before start', () => {
    expect(scheduleStatus(s, new Date('2026-11-14T13:59:59.000Z'))).toBe('upcoming');
  });
  it('is live from start (inclusive)', () => {
    expect(scheduleStatus(s, new Date('2026-11-14T14:00:00.000Z'))).toBe('live');
  });
  it('is expired at end (exclusive)', () => {
    expect(scheduleStatus(s, new Date('2026-11-16T14:00:00.000Z'))).toBe('expired');
  });
});
