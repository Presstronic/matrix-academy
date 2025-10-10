/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file redis.e2e-spec.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { INestApplication } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import request from 'supertest';

import { closeTestApp, createTestApp } from './utils/test-app.js';
import { clearDatabase, closeTestDatabase, createTestDatabase } from './utils/test-db.js';

describe('Redis Integration (e2e)', () => {
  let app: INestApplication;
  let cacheManager: Cache;

  beforeAll(async () => {
    await createTestDatabase();
    app = await createTestApp();
    cacheManager = app.get(CACHE_MANAGER);
  });

  afterAll(async () => {
    await closeTestApp(app);
    await closeTestDatabase();
  });

  afterEach(async () => {
    await clearDatabase();

    // Clear all test keys from Redis after each test
    const testKeys = [
      'test:key:write-read',
      'test:key:non-existent',
      'test:key:delete',
      'test:key:ttl',
      'test:key:complex',
      'test:key:invalidate',
      'user:123',
      'user:456',
      'health',
    ];
    await Promise.all(testKeys.map((key) => cacheManager.del(key)));
  });

  describe('Redis Connection', () => {
    it('should successfully connect to Redis', () => {
      expect(cacheManager).toBeDefined();
    });

    it('should write and read from Redis cache', async () => {
      const testKey = 'test:key:write-read';
      const testValue = { message: 'Hello Redis', timestamp: Date.now() };

      await cacheManager.set(testKey, testValue, 5000);
      const cachedValue = await cacheManager.get(testKey);

      expect(cachedValue).toEqual(testValue);
    });

    it('should return undefined for non-existent keys', async () => {
      const nonExistentKey = 'test:key:non-existent';
      const result = await cacheManager.get(nonExistentKey);

      expect(result).toBeUndefined();
    });

    it('should delete cached values', async () => {
      const testKey = 'test:key:delete';
      const testValue = { data: 'test' };

      await cacheManager.set(testKey, testValue, 5000);
      let cachedValue = await cacheManager.get(testKey);
      expect(cachedValue).toEqual(testValue);

      await cacheManager.del(testKey);
      cachedValue = await cacheManager.get(testKey);
      expect(cachedValue).toBeUndefined();
    });

    it('should handle TTL expiration', async () => {
      const testKey = 'test:key:ttl';
      const testValue = { data: 'expires soon' };
      const ttl = 100; // 100ms

      await cacheManager.set(testKey, testValue, ttl);

      const cachedValueBefore = await cacheManager.get(testKey);
      expect(cachedValueBefore).toEqual(testValue);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const cachedValueAfter = await cacheManager.get(testKey);
      expect(cachedValueAfter).toBeUndefined();
    }, 10000);

    it('should handle complex objects', async () => {
      const testKey = 'test:key:complex';
      const complexObject = {
        user: {
          id: '123',
          name: 'Test User',
          roles: ['user', 'admin'],
        },
        metadata: {
          created: new Date().toISOString(),
          nested: {
            level: 2,
            values: [1, 2, 3],
          },
        },
      };

      await cacheManager.set(testKey, complexObject, 5000);
      const cachedValue = await cacheManager.get(testKey);

      expect(cachedValue).toEqual(complexObject);
    });
  });

  describe('Health Endpoint Caching', () => {
    it('should cache health check responses', async () => {
      const response1 = await request(app.getHttpServer()).get('/health').expect(200);

      const response2 = await request(app.getHttpServer()).get('/health').expect(200);

      expect(response1.body.data.timestamp).toBe(response2.body.data.timestamp);
    });

    it('should serve cached response faster on subsequent requests', async () => {
      const start1 = Date.now();
      await request(app.getHttpServer()).get('/health').expect(200);
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      await request(app.getHttpServer()).get('/health').expect(200);
      const duration2 = Date.now() - start2;

      expect(duration2).toBeLessThanOrEqual(duration1);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache for specific keys', async () => {
      const testKey = 'test:key:invalidate';
      const testValue = { data: 'original' };

      await cacheManager.set(testKey, testValue, 10000);

      let cached = await cacheManager.get(testKey);
      expect(cached).toEqual(testValue);

      await cacheManager.del(testKey);

      cached = await cacheManager.get(testKey);
      expect(cached).toBeUndefined();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate unique cache keys for different requests', async () => {
      const key1 = 'user:123';
      const key2 = 'user:456';
      const value1 = { id: '123', name: 'User 1' };
      const value2 = { id: '456', name: 'User 2' };

      await cacheManager.set(key1, value1, 5000);
      await cacheManager.set(key2, value2, 5000);

      const cached1 = await cacheManager.get(key1);
      const cached2 = await cacheManager.get(key2);

      expect(cached1).toEqual(value1);
      expect(cached2).toEqual(value2);
      expect(cached1).not.toEqual(cached2);
    });
  });
});
