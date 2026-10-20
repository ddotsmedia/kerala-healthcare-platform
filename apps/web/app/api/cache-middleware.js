import { cached, get, set, del, delByPrefix, TTL } from '@khp/cache'

const CACHE_DURATIONS = {
  challenges: TTL.profile || 3600,
  medicines: TTL.content || 1800,
  labTests: TTL.content || 1800,
  equipment: TTL.profile || 3600,
  nursingServices: 900,
  analytics: TTL.slots || 300,
  leaderboard: 600,
  translations: 86400
}

function getCached(key) {
  return get(key)
}

function setCached(key, data, duration) {
  set(key, data, duration)
}

function invalidateCache(pattern) {
  if (pattern.includes('*')) {
    delByPrefix(pattern.replace('*', ''))
  } else {
    del(pattern)
  }
}

export { getCached, setCached, invalidateCache, CACHE_DURATIONS }
