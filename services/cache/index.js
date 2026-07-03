// @khp/cache — TTL cache with hit/miss logging.
// Backend: in-process Map (no new package). If REDIS_URL is set in production,
// swap the store for a Redis client with the same get/set/del interface — the
// call sites do not change. See BLOCKERS.md.

const store = new Map(); // key -> { value, expiresAt }

function now() { return Date.now(); }

function get(key) {
  const e = store.get(key);
  if (!e) { log('miss', key); return undefined; }
  if (e.expiresAt && e.expiresAt < now()) { store.delete(key); log('miss', key); return undefined; }
  log('hit', key);
  return e.value;
}

function set(key, value, ttlSeconds) {
  store.set(key, { value, expiresAt: ttlSeconds ? now() + ttlSeconds * 1000 : 0 });
}

function del(key) { store.delete(key); }

/** Delete every key starting with a prefix (invalidation by namespace). */
function delByPrefix(prefix) {
  for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
}

/** Memoise an async producer under a key with a TTL. */
async function cached(key, ttlSeconds, producer) {
  const hit = get(key);
  if (hit !== undefined) return hit;
  const value = await producer();
  set(key, value, ttlSeconds);
  return value;
}

function log(kind, key) {
  if (process.env.CACHE_LOG === '1') console.log(`[cache ${kind}] ${key}`);
}

// TTL presets (seconds) per Phase 5 spec.
const TTL = { providers: 300, content: 600, slots: 60, profile: 3600 };

export { get, set, del, delByPrefix, cached, TTL };
