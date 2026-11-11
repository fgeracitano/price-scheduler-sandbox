/**
 * Simulated network behaviour, configured with environment variables:
 *   LATENCY=0 FAILURE_RATE=0 npm run dev
 *   LATENCY=100-3000 npm run dev
 */
export interface ServerConfig {
  /** Response delay range in ms. */
  latency: [min: number, max: number];
  /** Probability (0–1) that a write request fails with 503. */
  failureRate: number;
}

function parseLatency(value: string | undefined): [number, number] {
  if (!value) return [150, 900];
  const [min = 0, max = min] = value.split('-').map(Number);
  return [min, max];
}

export const config: ServerConfig = {
  latency: parseLatency(process.env.LATENCY),
  failureRate: process.env.FAILURE_RATE === undefined ? 0.1 : Number(process.env.FAILURE_RATE),
};
