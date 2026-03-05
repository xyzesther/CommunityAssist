import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Simple in-process cache metrics.
 * (In production you’d typically export Prometheus metrics instead.)
 */
export const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  errors: 0,
  invalidations: 0,
};

let client;
let ready = false;

export function isRedisReady() {
  return ready;
}

export async function initRedis() {
  if (client) return client;

  client = createClient({
    url: REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(1000 * 2 ** retries, 10_000),
    },
  });

  client.on("ready", () => {
    ready = true;
  });

  client.on("end", () => {
    ready = false;
  });

  client.on("error", () => {
    // Do not spam logs; callers will treat cache failures as non-fatal.
    cacheMetrics.errors += 1;
  });

  try {
    await client.connect();
  } catch {
    // Non-fatal: app can run without cache
    ready = false;
  }

  return client;
}

export async function cacheGetJson(key) {
  if (!client || !ready) return null;
  try {
    const raw = await client.get(key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    cacheMetrics.errors += 1;
    return null;
  }
}

export async function cacheSetJson(key, value, { ttlSeconds }) {
  if (!client || !ready) return false;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    cacheMetrics.sets += 1;
    return true;
  } catch {
    cacheMetrics.errors += 1;
    return false;
  }
}

export async function cacheDel(keys) {
  if (!client || !ready) return 0;
  const list = Array.isArray(keys) ? keys : [keys];
  if (list.length === 0) return 0;

  try {
    const deleted = await client.del(list);
    cacheMetrics.invalidations += deleted;
    return deleted;
  } catch {
    cacheMetrics.errors += 1;
    return 0;
  }
}

export function computeHitRate() {
  const total = cacheMetrics.hits + cacheMetrics.misses;
  return total === 0 ? 0 : cacheMetrics.hits / total;
}
