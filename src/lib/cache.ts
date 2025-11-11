// In-memory caching for performance optimization
// In production, consider using Redis or similar

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void { // 5 minutes default
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// Periodic cleanup
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => memoryCache.cleanup(), 10 * 60 * 1000); // Every 10 minutes
}

// Cache keys
export const CACHE_KEYS = {
  SELLER_STATS: (sellerId: string) => `seller:stats:${sellerId}`,
  SELLER_PRODUCTS: (sellerId: string) => `seller:products:${sellerId}`,
  SELLER_ORDERS: (sellerId: string) => `seller:orders:${sellerId}`,
  PRODUCT_DETAILS: (productId: string) => `product:${productId}`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
} as const;

// Helper functions for common caching patterns
export function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  const cached = memoryCache.get<T>(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    memoryCache.set(key, data, ttlMs);
    return data;
  });
}

export function invalidateCache(key: string): void {
  memoryCache.delete(key);
}

export function invalidatePattern(pattern: string): void {
  // Simple pattern matching for cache invalidation
  for (const key of memoryCache['cache'].keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}

// Database query result caching
export class QueryCache {
  static async getOrSet<T>(
    key: string,
    query: () => Promise<T>,
    ttlMs: number = 10 * 60 * 1000 // 10 minutes
  ): Promise<T> {
    const cached = memoryCache.get<T>(key);
    if (cached) {
      return cached;
    }

    const result = await query();
    memoryCache.set(key, result, ttlMs);
    return result;
  }

  static invalidateSellerData(sellerId: string): void {
    invalidatePattern(`seller:${sellerId}`);
  }

  static invalidateProductData(productId: string): void {
    invalidatePattern(`product:${productId}`);
  }

  static invalidateUserData(userId: string): void {
    invalidatePattern(`user:${userId}`);
  }
}