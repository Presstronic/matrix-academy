/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file cache-keys.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
/**
 * Cache key prefixes for different resource types
 */
export const CACHE_KEYS = {
  USER: 'user',
  HEALTH: 'health',
} as const;

/**
 * Cache TTL values in milliseconds
 */
export const CACHE_TTL = {
  USER: 300000, // 5 minutes
  HEALTH: 60000, // 1 minute
  DEFAULT: 300000, // 5 minutes
} as const;

/**
 * Generate a cache key for a user by ID
 */
export const getUserCacheKey = (userId: string): string => {
  return `${CACHE_KEYS.USER}:${userId}`;
};

/**
 * Generate a cache key for health check
 */
export const getHealthCacheKey = (): string => {
  return CACHE_KEYS.HEALTH;
};