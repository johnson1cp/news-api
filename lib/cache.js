import { kv } from '@vercel/kv';

// TTL values in seconds
export const TTL = {
  SHORT: 5 * 60,        // 5 minutes
  MEDIUM: 60 * 60,      // 1 hour
  LONG: 24 * 60 * 60,   // 24 hours
};

export async function getCache(key) {
  try {
    return await kv.get(key);
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = TTL.MEDIUM) {
  try {
    await kv.set(key, value, { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function deleteCache(key) {
  try {
    await kv.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

// Cache keys
export const CACHE_KEYS = {
  NEWS_AGGREGATED: 'news:aggregated',
  NEWS_ENRICHED: 'news:enriched',
  LAST_REFRESH: 'news:last_refresh',
};
