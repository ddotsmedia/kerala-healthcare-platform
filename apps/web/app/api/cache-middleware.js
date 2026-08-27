import { redis } from '@khp/cache'

const CACHE_DURATIONS = {
  challenges: 3600, // 1 hour
  medicines: 1800, // 30 minutes
  labTests: 1800,
  equipment: 3600,
  nursingServices: 900, // 15 minutes (update frequently)
  analytics: 300, // 5 minutes (real-time)
  leaderboard: 600, // 10 minutes
  translations: 86400 // 24 hours
}

async function getCached(key) {
  if (!redis) return null
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

async function setCached(key, data, duration) {
  if (!redis) return
  try {
    await redis.setex(key, duration, JSON.stringify(data))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

async function invalidateCache(pattern) {
  if (!redis) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

export { getCached, setCached, invalidateCache, CACHE_DURATIONS }
