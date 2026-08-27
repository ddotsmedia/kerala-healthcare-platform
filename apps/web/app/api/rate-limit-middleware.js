import { redis } from '@khp/cache'

const RATE_LIMITS = {
  public: { requests: 20, window: 60 }, // 20 req/min per IP
  authenticated: { requests: 100, window: 60 }, // 100 req/min per user
  admin: { requests: 500, window: 60 }, // 500 req/min for admins
  booking: { requests: 5, window: 60 }, // 5 bookings/min to prevent spam
  payment: { requests: 10, window: 60 } // 10 payment attempts/min
}

async function checkRateLimit(key, limit) {
  if (!redis) return true

  try {
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, limit.window)
    }

    return current <= limit.requests
  } catch (error) {
    console.error('Rate limit check error:', error)
    return true // Fail open on error
  }
}

async function getRateLimitStatus(key, limit) {
  if (!redis) return { remaining: limit.requests, reset: Date.now() + limit.window * 1000 }

  try {
    const current = await redis.get(key)
    const ttl = await redis.ttl(key)

    return {
      remaining: Math.max(0, limit.requests - (parseInt(current) || 0)),
      reset: Date.now() + Math.max(0, ttl) * 1000
    }
  } catch (error) {
    console.error('Rate limit status error:', error)
    return { remaining: limit.requests, reset: Date.now() }
  }
}

function getClientIP(req) {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') ||
         'unknown'
}

export { checkRateLimit, getRateLimitStatus, RATE_LIMITS, getClientIP }
