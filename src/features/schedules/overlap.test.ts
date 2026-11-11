import type { Schedule } from '@/api/schemas';
import { findConflict, overlaps } from './overlap';

const w = (startsAt: string, endsAt: string) => ({ startsAt, endsAt });

describe('overlaps', () => {
  it('detects partial overlap', () => {
    expect(
      overlaps(
        w('2026-11-14T14:00:00.000Z', '2026-11-16T14:00:00.000Z'),
        w('2026-11-15T14:00:00.000Z', '2026-11-17T14:00:00.000Z'),
      ),
    ).toBe(true);
  });

  it('detects containment', () => {
    expect(
      overlaps(
        w('2026-11-10T14:00:00.000Z', '2026-11-20T14:00:00.000Z'),
        w('2026-11-14T14:00:00.000Z', '2026-11-15T14:00:00.000Z'),
      ),
    ).toBe(true);
  });

  it('ignores disjoint windows', () => {
    expect(
      overlaps(
        w('2026-11-14T14:00:00.000Z', '2026-11-15T14:00:00.000Z'),
        w('2026-11-18T14:00:00.000Z', '2026-11-19T14:00:00.000Z'),
      ),
    ).toBe(false);
  });
});

describe('findConflict', () => {
  const existing = [
    {
      id: 's_1',
      productId: 'p_001',
      startsAt: '2026-11-14T14:00:00.000Z',
      endsAt: '2026-11-16T14:00:00.000Z',
    },
  ] as Schedule[];

  it('only considers the same product', () => {
    const candidate = {
      productId: 'p_002',
      ...w('2026-11-15T14:00:00.000Z', '2026-11-17T14:00:00.000Z'),
    };
    expect(findConflict(candidate, existing)).toBeUndefined();
  });

  it('returns the conflicting schedule', () => {
    const candidate = {
      productId: 'p_001',
      ...w('2026-11-15T14:00:00.000Z', '2026-11-17T14:00:00.000Z'),
    };
    expect(findConflict(candidate, existing)?.id).toBe('s_1');
  });
});
