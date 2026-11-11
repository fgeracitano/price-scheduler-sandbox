/** Money is always integer cents. See CLAUDE.md. */
export type Cents = number;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCents(cents: Cents): string {
  return usd.format(cents / 100);
}

/** Parses a dollar amount typed by a user ("19.99", "$19.99") into cents. */
export function parseDollars(input: string): Cents {
  return Math.round(Number(input.replace('$', '').trim()) * 100);
}

/** Price after a percentage discount, rounded down to the cent. */
export function applyPercentOff(cents: Cents, percent: number): Cents {
  return Math.floor(cents * (1 - percent / 100));
}

/** Discount between two prices as a whole percentage, for display only. */
export function percentOffBetween(original: Cents, discounted: Cents): number {
  if (original === 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}
