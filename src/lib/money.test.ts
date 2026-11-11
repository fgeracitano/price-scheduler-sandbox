import { applyPercentOff, formatCents, parseDollars, percentOffBetween } from './money';

describe('formatCents', () => {
  it('formats cents as USD', () => {
    expect(formatCents(1999)).toBe('$19.99');
    expect(formatCents(120000)).toBe('$1,200.00');
  });
});

describe('parseDollars', () => {
  it('parses plain and $-prefixed amounts', () => {
    expect(parseDollars('19.99')).toBe(1999);
    expect(parseDollars('$5')).toBe(500);
    expect(parseDollars(' 79.90 ')).toBe(7990);
  });
});

describe('applyPercentOff', () => {
  it('applies a percentage discount', () => {
    expect(applyPercentOff(10000, 20)).toBe(8000);
    expect(applyPercentOff(5000, 50)).toBe(2500);
  });

  it('rounds down to the cent', () => {
    expect(applyPercentOff(1999, 10)).toBe(1799);
  });
});

describe('percentOffBetween', () => {
  it('returns the whole-number discount', () => {
    expect(percentOffBetween(10000, 7500)).toBe(25);
  });
});
