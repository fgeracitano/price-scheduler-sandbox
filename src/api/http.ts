import type { z } from 'zod';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE = '/api';

async function send(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(new URL(`${API_BASE}${path}`, window.location.origin), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }
  return res;
}

export async function getJson<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S>> {
  const res = await send(path);
  return schema.parse(await res.json());
}

export async function postJson<S extends z.ZodType>(
  path: string,
  body: unknown,
  schema: S,
): Promise<z.output<S>> {
  const res = await send(path, { method: 'POST', body: JSON.stringify(body) });
  return schema.parse(await res.json());
}

export async function del(path: string): Promise<void> {
  await send(path, { method: 'DELETE' });
}
