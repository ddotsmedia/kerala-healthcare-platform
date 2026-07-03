// @khp/ratelimit — sliding-window counter. Edge-safe (no node builtins).
// In-process store by default; swap for Redis (INCR + EXPIRE) in production —
// the interface stays the same. See BLOCKERS.md.

const buckets = new Map(); // key -> number[] (timestamps ms)

/**
 * @param {string} key
 * @param {number} limit max requests in the window
 * @param {number} windowSeconds
 * @returns {{ allowed:boolean, remaining:number, retryAfter:number }}
 */
function rateLimit(key, limit, windowSeconds) {
  const nowMs = Date.now();
  const windowMs = windowSeconds * 1000;
  const arr = (buckets.get(key) || []).filter((ts) => ts > nowMs - windowMs);
  if (arr.length >= limit) {
    const retryAfter = Math.ceil((arr[0] + windowMs - nowMs) / 1000);
    buckets.set(key, arr);
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
  }
  arr.push(nowMs);
  buckets.set(key, arr);
  return { allowed: true, remaining: limit - arr.length, retryAfter: 0 };
}

export { rateLimit };
