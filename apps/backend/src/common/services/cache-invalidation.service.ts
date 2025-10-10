/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file cache-invalidation.service.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

import { getUserCacheKey } from '../constants/cache-keys.js';

/**
 * Service for managing cache invalidation
 */
@Injectable()
export class CacheInvalidationService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Invalidate cache for a specific user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const cacheKey = getUserCacheKey(userId);
    await this.cacheManager.del(cacheKey);
  }

  /**
   * Invalidate cache for multiple users
   */
  async invalidateUsersCache(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((id) => this.invalidateUserCache(id)));
  }

  /**
   * Clear all cache entries
   * Note: Not all cache stores support this operation
   */
  clearAllCache(): void {
    // cache-manager v7+ doesn't have reset() method
    // We would need to implement pattern-based deletion or use store-specific methods
    // For now, this is a placeholder for future implementation
    throw new Error('Clear all cache is not implemented');
  }

  /**
   * Invalidate cache entries matching a pattern
   * Note: This requires redis store and is not available in the current cache-manager API
   */
  invalidatePattern(_pattern: string): void {
    // This would require direct access to the Redis client
    // which is not exposed in the current cache-manager v7+ API
    // For future implementation when needed
    throw new Error('Pattern invalidation is not implemented');
  }
}
